import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserOrDemo, unauthorizedResponse } from "@/lib/session";
import { decryptVaultText, encryptVaultText } from "@/lib/crypto";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUserOrDemo();
    if (!user) return unauthorizedResponse();

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        deletedAt: null,
      },
      include: {
        links: {
          orderBy: { createdAt: "asc" },
        },
        credentials: {
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
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });
    }

    // Update lastOpenedAt silently
    await prisma.project.update({
      where: { id: project.id },
      data: { lastOpenedAt: new Date() },
    });

    // Decrypt credentials safely for authorized owner
    const safeCredentials = project.credentials.map((c) => ({
      id: c.id,
      title: c.title,
      username: c.username,
      decryptedPassword: c.encryptedPassword ? decryptVaultText(c.encryptedPassword) : "",
      notes: c.notes,
    }));

    return NextResponse.json({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      icon: project.icon || "folder",
      color: project.color || "#2563eb",
      url: project.url,
      adminUrl: project.adminUrl,
      priority: project.priority,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      lastOpenedAt: project.lastOpenedAt,
      totalNotes: project._count.notes,
      links: project.links,
      credentials: safeCredentials,
      tags: project.tags.map((t) => t.tag.name),
    });
  } catch (error) {
    console.error("Project GET [id] error:", error);
    return NextResponse.json({ error: "Proje detayı alınamadı." }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUserOrDemo();
    if (!user) return unauthorizedResponse();

    const body = await req.json();
    const {
      name,
      description,
      status,
      icon,
      color,
      url,
      adminUrl,
      priority,
      tags,
      credentialUsername,
      credentialPassword,
    } = body;

    const existing = await prisma.project.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const proj = await tx.project.update({
        where: { id: params.id },
        data: {
          name: name !== undefined ? name.trim() : undefined,
          description: description !== undefined ? (description?.trim() || null) : undefined,
          status: status !== undefined ? status : undefined,
          icon: icon !== undefined ? icon : undefined,
          color: color !== undefined ? color : undefined,
          url: url !== undefined ? (url?.trim() || null) : undefined,
          adminUrl: adminUrl !== undefined ? (adminUrl?.trim() || null) : undefined,
          priority: priority !== undefined ? priority : undefined,
          archivedAt: status === "archived" ? new Date() : (status === "active" ? null : undefined),
        },
      });

      // Update credentials if provided
      if (credentialUsername !== undefined || credentialPassword !== undefined) {
        const firstCred = await tx.projectCredential.findFirst({
          where: { projectId: params.id },
        });

        if (firstCred) {
          await tx.projectCredential.update({
            where: { id: firstCred.id },
            data: {
              username: credentialUsername !== undefined ? credentialUsername : undefined,
              encryptedPassword:
                credentialPassword !== undefined
                  ? (credentialPassword ? encryptVaultText(credentialPassword) : null)
                  : undefined,
            },
          });
        } else if (credentialUsername || credentialPassword) {
          await tx.projectCredential.create({
            data: {
              projectId: params.id,
              title: "Ana Giriş Bilgileri",
              username: credentialUsername || null,
              encryptedPassword: credentialPassword ? encryptVaultText(credentialPassword) : null,
            },
          });
        }
      }

      // Update tags if provided
      if (Array.isArray(tags)) {
        await tx.projectTag.deleteMany({
          where: { projectId: params.id },
        });

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
              projectId: params.id,
              tagId: tag.id,
            },
          });
        }
      }

      return proj;
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Project PATCH error:", error);
    return NextResponse.json({ error: "Proje güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUserOrDemo();
    if (!user) return unauthorizedResponse();

    const existing = await prisma.project.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });
    }

    // Soft delete
    await prisma.project.update({
      where: { id: params.id },
      data: { deletedAt: new Date(), status: "archived" },
    });

    return NextResponse.json({ success: true, message: "Proje arşive taşındı." });
  } catch (error) {
    console.error("Project DELETE error:", error);
    return NextResponse.json({ error: "Proje silinemedi." }, { status: 500 });
  }
}
