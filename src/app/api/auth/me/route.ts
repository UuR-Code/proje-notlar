import { NextResponse } from "next/server";
import { getAuthUserOrDemo } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthUserOrDemo();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
}
