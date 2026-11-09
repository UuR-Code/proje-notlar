import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getUploadDir(): string {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("/app/data")) {
    return "/app/data/uploads";
  }
  return path.join(process.cwd(), "data", "uploads");
}

export async function GET(req: Request, { params }: { params: { filename: string } }) {
  try {
    const filename = path.basename(params.filename);
    const uploadDir = getUploadDir();
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse("Görsel bulunamadı.", { status: 404 });
    }

    const ext = path.extname(filename).toLowerCase();
    let contentType = "image/png";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".svg") contentType = "image/svg+xml";

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Uploads GET error:", error);
    return new NextResponse("Görsel yüklenirken hata oluştu.", { status: 500 });
  }
}
