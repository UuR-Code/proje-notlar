import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserOrDemo, unauthorizedResponse } from "@/lib/session";
import { encryptVaultText } from "@/lib/crypto";

export async function GET(req: Request) {
  try {
    const user = await getAuthUserOrDemo();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "active"; // "active", "archived", "all"

    const whereClause: any = {
      userId: user.id,
      deletedAt: null,
    };

    if (status !== "all") {
      whereClause.status = status;
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        links: {
          orderBy: { createdAt: "asc" },
        },
        tags: {
          include: { tag: true },
        },
        _count: {
          select: {
            notes: {
              where: { deletedAt: null },
            },
          },
        },
        notes: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: [
        { lastOpenedAt: "desc" },
        { updatedAt: "desc" },
      ],
    });

    // Format response
    const formatted = projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      icon: p.icon || "folder",
      color: p.color || "#2563eb",
      url: p.url,
      adminUrl: p.adminUrl,
      priority: p.priority,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      lastOpenedAt: p.lastOpenedAt,
      totalNotes: p._count.notes,
      latestNote: p.notes[0] || null,
      tags: p.tags.map((t) => t.tag.name),
      links: p.links,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Projects GET error:", error);
    return NextResponse.json({ error: "Projeler listelenirken hata oluştu." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUserOrDemo();
    if (!user) return unauthorizedResponse();

    const body = await req.json();
    const {
      name,
      description,
      url,
      adminUrl,
      username,
      passwordNote,
      priority = "normal",
      icon = "folder",
      color = "#2563eb",
      tags = [],
      initialNote,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Proje adı zorunludur." }, { status: 400 });
    }

    // Create project transactionally
    const project = await prisma.$transaction(async (tx) => {
      const newProj = await tx.project.create({
        data: {
          userId: user.id,
          name: name.trim(),
          description: description?.trim() || null,
          url: url?.trim() || null,
          adminUrl: adminUrl?.trim() || null,
          priority: priority || "normal",
          icon: icon || "folder",
          color: color || "#2563eb",
          lastOpenedAt: new Date(),
        },
      });

      // Add credential if provided
      if (username?.trim() || passwordNote?.trim()) {
        await tx.projectCredential.create({
          data: {
            projectId: newProj.id,
            title: "Ana Giriş Bilgileri",
            username: username?.trim() || null,
            encryptedPassword: passwordNote?.trim() ? encryptVaultText(passwordNote.trim()) : null,
          },
        });
      }

      // Add links if main URL or admin URL provided
      if (url?.trim()) {
        await tx.projectLink.create({
          data: {
            projectId: newProj.id,
            label: "Canlı Site",
            url: url.trim(),
          },
        });
      }
      if (adminUrl?.trim()) {
        await tx.projectLink.create({
          data: {
            projectId: newProj.id,
            label: "Yönetim Paneli",
            url: adminUrl.trim(),
          },
        });
      }

      // Add tags if provided
      if (Array.isArray(tags) && tags.length > 0) {
        for (const tagName of tags) {
          const trimmed = String(tagName).trim();
          if (!trimmed) continue;

          const tag = await tx.tag.upsert({
            where: {
              userId_name: {
                userId: user.id,
                name: trimmed,
              },
            },
            update: {},
            create: {
              userId: user.id,
              name: trimmed,
            },
          });

          await tx.projectTag.create({
            data: {
              projectId: newProj.id,
              tagId: tag.id,
            },
          });
        }
      }

      // Add initial note if provided
      if (initialNote && initialNote.trim()) {
        await tx.note.create({
          data: {
            projectId: newProj.id,
            userId: user.id,
            content: initialNote.trim(),
            category: "general",
            status: "open",
          },
        });
      }

      return newProj;
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Project POST error:", error);
    return NextResponse.json({ error: "Proje oluşturulurken hata oluştu." }, { status: 500 });
  }
}
