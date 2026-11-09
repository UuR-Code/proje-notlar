import { NextResponse } from "next/server";
import { getAuthUserOrDemo, unauthorizedResponse } from "@/lib/session";
import fs from "fs";
import path from "path";

function getUploadDir(): string {
  // If running in container with /app/data mount
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("/app/data")) {
    return "/app/data/uploads";
  }
  return path.join(process.cwd(), "data", "uploads");
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUserOrDemo();
    if (!user) return unauthorizedResponse();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Yüklenecek görsel dosyası bulunamadı." }, { status: 400 });
    }

    // Allowed image formats
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Desteklenmeyen dosya türü. Lütfen PNG, JPG, WEBP veya GIF formatında bir görsel yükleyin." },
        { status: 400 }
      );
    }

    // Size limit: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Görsel boyutu çok büyük. Lütfen 10MB'dan küçük bir görsel seçin." },
        { status: 400 }
      );
    }

    const uploadDir = getUploadDir();
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Determine extension
    let ext = "png";
    if (file.type === "image/jpeg") ext = "jpg";
    else if (file.type === "image/webp") ext = "webp";
    else if (file.type === "image/gif") ext = "gif";
    else if (file.type === "image/svg+xml") ext = "svg";

    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const filename = `shot_${uniqueId}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/api/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json({ error: "Görsel yüklenirken bir hata oluştu." }, { status: 500 });
  }
}
