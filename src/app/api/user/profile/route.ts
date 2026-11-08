import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserOrDemo, unauthorizedResponse } from "@/lib/session";
import { comparePassword, hashPassword } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    const user = await getAuthUserOrDemo();
    if (!user) return unauthorizedResponse();

    const body = await req.json();
    const { name, currentPassword, newPassword } = body;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    const dataToUpdate: any = {};

    if (name && name.trim()) {
      dataToUpdate.name = name.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Mevcut şifrenizi girmelisiniz." }, { status: 400 });
      }

      const isMatch = await comparePassword(currentPassword, dbUser.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: "Mevcut şifre hatalı." }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "Yeni şifre en az 6 karakter olmalıdır." }, { status: 400 });
      }

      dataToUpdate.passwordHash = await hashPassword(newPassword);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: dataToUpdate,
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Profil güncellenemedi." }, { status: 500 });
  }
}
