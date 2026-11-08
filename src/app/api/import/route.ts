import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserOrDemo, unauthorizedResponse } from "@/lib/session";
import { encryptVaultText } from "@/lib/crypto";

export async function POST(req: Request) {
  try {
    const user = await getAuthUserOrDemo();
    if (!user) return unauthorizedResponse();

    const data = await req.json();

    if (!data || !Array.isArray(data.projects)) {
      return NextResponse.json(
        { error: "Geçersiz yedek dosyası formatı. 'projects' dizisi bulunamadı." },
        { status: 400 }
      );
    }

    let importedProjectsCount = 0;
    let importedNotesCount = 0;

    for (const projData of data.projects) {
      if (!projData.name || typeof projData.name !== "string") continue;

      // Find or create project
      let project = await prisma.project.findFirst({
        where: {
          userId: user.id,
          name: projData.name.trim(),
        },
      });

      if (!project) {
        project = await prisma.project.create({
          data: {
            userId: user.id,
            name: projData.name.trim(),
            description: projData.description || null,
            status: projData.status || "active",
            icon: projData.icon || "folder",
            color: projData.color || "#2563eb",
            url: projData.url || null,
            adminUrl: projData.adminUrl || null,
            priority: projData.priority || "normal",
          },
        });
        importedProjectsCount++;
      }

      // Import links
      if (Array.isArray(projData.links)) {
        for (const l of projData.links) {
          if (l.label && l.url) {
            const exists = await prisma.projectLink.findFirst({
              where: { projectId: project.id, url: l.url },
            });
            if (!exists) {
              await prisma.projectLink.create({
                data: {
                  projectId: project.id,
                  label: String(l.label).trim(),
                  url: String(l.url).trim(),
                },
              });
            }
          }
        }
      }

      // Import credentials if provided in backup
      if (Array.isArray(projData.credentials)) {
        for (const c of projData.credentials) {
          if (c.username || c.password) {
            await prisma.projectCredential.create({
              data: {
                projectId: project.id,
                title: c.title || "İçe Aktarılan Giriş",
                username: c.username || null,
                encryptedPassword: c.password ? encryptVaultText(c.password) : null,
                notes: c.notes || null,
              },
            });
          }
        }
      }

      // Import notes
      if (Array.isArray(projData.notes)) {
        for (const n of projData.notes) {
          if (n.content && typeof n.content === "string") {
            const noteExists = await prisma.note.findFirst({
              where: {
                projectId: project.id,
                userId: user.id,
                content: n.content.trim(),
              },
            });

            if (!noteExists) {
              await prisma.note.create({
                data: {
                  projectId: project.id,
                  userId: user.id,
                  content: n.content.trim(),
                  category: n.category || "general",
                  status: n.status || "open",
                  priority: n.priority || "normal",
                  isPinned: Boolean(n.isPinned),
                },
              });
              importedNotesCount++;
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `İçe aktarma başarılı! ${importedProjectsCount} yeni proje ve ${importedNotesCount} yeni not eklendi.`,
      stats: { projects: importedProjectsCount, notes: importedNotesCount },
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "İçe aktarılırken hata oluştu." }, { status: 500 });
  }
}
