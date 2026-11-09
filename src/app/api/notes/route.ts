import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserOrDemo, unauthorizedResponse } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const user = await getAuthUserOrDemo();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const query = searchParams.get("query");
    const deleted = searchParams.get("deleted") === "true";
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const whereClause: any = {
      userId: user.id,
      deletedAt: deleted ? { not: null } : null,
    };

    if (projectId && projectId !== "all") {
      whereClause.projectId = projectId;
    }

    if (category && category !== "all") {
      whereClause.category = category;
    }

    if (status && status !== "all") {
      if (status === "uncompleted") {
        whereClause.status = { not: "completed" };
      } else {
        whereClause.status = status;
      }
    }

    if (priority && priority !== "all") {
      whereClause.priority = priority;
    }

    if (query && query.trim()) {
      whereClause.content = {
        contains: query.trim(),
      };
    }

    const notes = await prisma.note.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Notes GET error:", error);
    return NextResponse.json({ error: "Notlar listelenirken hata oluştu." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUserOrDemo();
    if (!user) return unauthorizedResponse();

    const body = await req.json();
    const {
      projectId,
      content,
      imageUrl,
      category = "general",
      priority = "normal",
      isPinned = false,
    } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Not içeriği boş olamaz." }, { status: 400 });
    }

    let targetProjectId = projectId;

    // If no project specified, find or create default project
    if (!targetProjectId) {
      const defaultProj = await prisma.project.findFirst({
        where: { userId: user.id, deletedAt: null },
        orderBy: { lastOpenedAt: "desc" },
      });

      if (defaultProj) {
        targetProjectId = defaultProj.id;
      } else {
        const created = await prisma.project.create({
          data: {
            userId: user.id,
            name: "Genel Notlar",
            color: "#2563eb",
            icon: "folder",
          },
        });
        targetProjectId = created.id;
      }
    } else {
      // Validate project exists & user owns it
      const proj = await prisma.project.findFirst({
        where: { id: targetProjectId, userId: user.id },
      });
      if (!proj) {
        return NextResponse.json({ error: "Seçilen proje bulunamadı." }, { status: 404 });
      }
    }

    // Create note & update project lastOpenedAt
    const [note] = await prisma.$transaction([
      prisma.note.create({
        data: {
          projectId: targetProjectId,
          userId: user.id,
          content: content.trim(),
          imageUrl: imageUrl ? String(imageUrl).trim() : null,
          category,
          priority,
          isPinned: Boolean(isPinned),
          status: "open",
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true,
            },
          },
        },
      }),
      prisma.project.update({
        where: { id: targetProjectId },
        data: { lastOpenedAt: new Date(), updatedAt: new Date() },
      }),
    ]);

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Notes POST error:", error);
    return NextResponse.json({ error: "Not kaydedilirken bir hata oluştu." }, { status: 500 });
  }
}
