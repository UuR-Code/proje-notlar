import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserOrDemo, unauthorizedResponse } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUserOrDemo();
    if (!user) return unauthorizedResponse();

    const existing = await prisma.note.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not bulunamadı." }, { status: 404 });
    }

    const body = await req.json();
    const { content, category, status, priority, isPinned, projectId } = body;

    // If moving to another project, verify user owns target project
    if (projectId && projectId !== existing.projectId) {
      const targetProj = await prisma.project.findFirst({
        where: { id: projectId, userId: user.id },
      });
      if (!targetProj) {
        return NextResponse.json({ error: "Hedef proje bulunamadı." }, { status: 400 });
      }
    }

    const updated = await prisma.note.update({
      where: { id: params.id },
      data: {
        content: content !== undefined ? content.trim() : undefined,
        category: category !== undefined ? category : undefined,
        status: status !== undefined ? status : undefined,
        priority: priority !== undefined ? priority : undefined,
        isPinned: isPinned !== undefined ? Boolean(isPinned) : undefined,
        projectId: projectId !== undefined ? projectId : undefined,
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
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Note PATCH error:", error);
    return NextResponse.json({ error: "Not güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUserOrDemo();
    if (!user) return unauthorizedResponse();

    const existing = await prisma.note.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not bulunamadı." }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent) {
      // Hard delete
      await prisma.note.delete({
        where: { id: params.id },
      });
      return NextResponse.json({ success: true, message: "Not kalıcı olarak silindi." });
    } else {
      // Soft delete -> move to trash
      await prisma.note.update({
        where: { id: params.id },
        data: { deletedAt: new Date() },
      });
      return NextResponse.json({ success: true, message: "Not çöp kutusuna taşındı." });
    }
  } catch (error) {
    console.error("Note DELETE error:", error);
    return NextResponse.json({ error: "Not silinemedi." }, { status: 500 });
  }
}
