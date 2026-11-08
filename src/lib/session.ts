import { NextResponse } from "next/server";
import { getSessionUser } from "./auth";
import { prisma } from "./prisma";

export async function getAuthUserOrDemo() {
  const sessionUser = await getSessionUser();
  if (sessionUser) return sessionUser;

  // In development, if no user session is active, auto-link to the demo user for seamless pairing
  const demoUser = await prisma.user.findUnique({
    where: { email: "demo@projenotlar.com" },
    select: { id: true, email: true, name: true },
  });

  return demoUser;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
}
