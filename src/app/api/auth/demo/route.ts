import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  try {
    let demoUser = await prisma.user.findUnique({
      where: { email: "demo@projenotlar.com" },
    });

    if (!demoUser) {
      const passwordHash = await hashPassword("demo1234");
      demoUser = await prisma.user.create({
        data: {
          name: "Demo Kullanıcı",
          email: "demo@projenotlar.com",
          passwordHash,
        },
      });
    }

    const token = await signSessionToken({
      userId: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: demoUser.id, email: demoUser.email, name: demoUser.name },
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
    console.error("Demo login error:", error);
    return NextResponse.json({ error: "Demo girişi başlatılamadı." }, { status: 500 });
  }
}
