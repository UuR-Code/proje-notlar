import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserOrDemo, unauthorizedResponse } from "@/lib/session";
import { decryptVaultText } from "@/lib/crypto";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getAuthUserOrDemo();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json"; // "json" or "csv"
    const includeSecrets = searchParams.get("includeSecrets") === "true";

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: {
        links: true,
        credentials: true,
        tags: { include: { tag: true } },
        notes: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (format === "csv") {
      // CSV Export of all notes
      const headers = ["Proje Adı", "Kategori", "Durum", "Öncelik", "Not İçeriği", "Eklenme Tarihi", "Silindi mi"];
      const rows = [headers.join(",")];

      for (const p of projects) {
        for (const n of p.notes) {
          const cleanContent = `"${(n.content || "").replace(/"/g, '""')}"`;
          const cleanProject = `"${(p.name || "").replace(/"/g, '""')}"`;
          rows.push([
            cleanProject,
            n.category,
            n.status,
            n.priority,
            cleanContent,
            new Date(n.createdAt).toISOString(),
            n.deletedAt ? "Evet" : "Hayır",
          ].join(","));
        }
      }

      return new Response(rows.join("\n"), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="proje-notlari-yedek-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    // Default: JSON Export
    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      user: {
        email: user.email,
        name: user.name,
      },
      projects: projects.map((p) => ({
        name: p.name,
        description: p.description,
        status: p.status,
        icon: p.icon,
        color: p.color,
        url: p.url,
        adminUrl: p.adminUrl,
        priority: p.priority,
        createdAt: p.createdAt,
        tags: p.tags.map((t) => t.tag.name),
        links: p.links.map((l) => ({ label: l.label, url: l.url })),
        credentials: includeSecrets
          ? p.credentials.map((c) => ({
              title: c.title,
              username: c.username,
              password: c.encryptedPassword ? decryptVaultText(c.encryptedPassword) : "",
              notes: c.notes,
            }))
          : [], // Masked/excluded by default for privacy
        notes: p.notes.map((n) => ({
          content: n.content,
          category: n.category,
          status: n.status,
          priority: n.priority,
          isPinned: n.isPinned,
          createdAt: n.createdAt,
          deletedAt: n.deletedAt,
        })),
      })),
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="proje-notlari-yedek-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Dışa aktarma yapılamadı." }, { status: 500 });
  }
}
