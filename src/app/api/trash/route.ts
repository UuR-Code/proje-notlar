import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserOrDemo, unauthorizedResponse } from "@/lib/session";

export async function GET() {
  try {
    const user = await getAuthUserOrDemo();
    if (!user) return unauthorizedResponse();

    const notes = await prisma.note.findMany({
      where: {
        userId: user.id,
        deletedAt: { not: null },
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
      orderBy: { deletedAt: "desc" },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Trash GET error:", error);
    return NextResponse.json({ error: "Çöp kutusu yüklenirken hata oluştu." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getAuthUserOrDemo();
    if (!user) return unauthorizedResponse();

    const result = await prisma.note.deleteMany({
      where: {
        userId: user.id,
        deletedAt: { not: null },
      },
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} adet not çöp kutusundan kalıcı olarak temizlendi.`,
    });
  } catch (error) {
    console.error("Trash DELETE error:", error);
    return NextResponse.json({ error: "Çöp kutusu boşaltılamadı." }, { status: 500 });
  }
}
