import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserOrDemo, unauthorizedResponse } from "@/lib/session";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUserOrDemo();
    if (!user) return unauthorizedResponse();

    const note = await prisma.note.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!note) {
      return NextResponse.json({ error: "Not bulunamadı." }, { status: 404 });
    }

    const restored = await prisma.note.update({
      where: { id: params.id },
      data: { deletedAt: null },
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

    return NextResponse.json({ success: true, note: restored });
  } catch (error) {
    console.error("Note restore error:", error);
    return NextResponse.json({ error: "Not geri yüklenemedi." }, { status: 500 });
  }
}
