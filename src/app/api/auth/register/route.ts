import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Lütfen tüm zorunlu alanları doldurun." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Şifre en az 6 karakter olmalıdır." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kullanımda." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
      },
    });

    // Create a welcoming first project
    await prisma.project.create({
      data: {
        userId: user.id,
        name: "İlk Projem",
        description: "Hızlı notlarını buraya kaydedebilirsin.",
        icon: "folder",
        color: "#2563eb",
        notes: {
          create: [
            {
              userId: user.id,
              content: "Proje Notları sistemine hoş geldiniz! Buraya aklınıza gelen her fikri kaydedebilirsiniz.",
              category: "idea",
              status: "open",
            },
          ],
        },
      },
    });

    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Kayıt olurken bir hata oluştu." }, { status: 500 });
  }
}
