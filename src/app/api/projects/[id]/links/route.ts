import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserOrDemo, unauthorizedResponse } from "@/lib/session";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUserOrDemo();
    if (!user) return unauthorizedResponse();

    const project = await prisma.project.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!project) {
      return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });
    }

    const { label, url } = await req.json();
    if (!label || !url) {
      return NextResponse.json({ error: "Bağlantı adı ve URL zorunludur." }, { status: 400 });
    }

    const newLink = await prisma.projectLink.create({
      data: {
        projectId: project.id,
        label: label.trim(),
        url: url.trim(),
      },
    });

    return NextResponse.json(newLink, { status: 201 });
  } catch (error) {
    console.error("ProjectLink POST error:", error);
    return NextResponse.json({ error: "Bağlantı eklenirken hata oluştu." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthUserOrDemo();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get("linkId");
    if (!linkId) {
      return NextResponse.json({ error: "linkId parametresi gerekli." }, { status: 400 });
    }

    // Verify ownership through project
    const link = await prisma.projectLink.findUnique({
      where: { id: linkId },
      include: { project: true },
    });

    if (!link || link.project.userId !== user.id) {
      return NextResponse.json({ error: "Bağlantı bulunamadı." }, { status: 404 });
    }

    await prisma.projectLink.delete({
      where: { id: linkId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ProjectLink DELETE error:", error);
    return NextResponse.json({ error: "Bağlantı silinemedi." }, { status: 500 });
  }
}
