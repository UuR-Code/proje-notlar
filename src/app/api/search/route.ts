import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserOrDemo, unauthorizedResponse } from "@/lib/session";
import { turkishMatches } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getAuthUserOrDemo();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    if (!q.trim()) {
      return NextResponse.json({ projects: [], notes: [] });
    }

    const trimmedQuery = q.trim();

    // Fetch projects and notes for this user
    const [allProjects, allNotes] = await Promise.all([
      prisma.project.findMany({
        where: { userId: user.id, deletedAt: null },
        include: {
          tags: { include: { tag: true } },
          _count: { select: { notes: { where: { deletedAt: null } } } },
        },
      }),
      prisma.note.findMany({
        where: { userId: user.id, deletedAt: null },
        include: {
          project: {
            select: { id: true, name: true, color: true, icon: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);

    // Apply Turkish-aware matching
    const matchedProjects = allProjects
      .filter((p) => {
        const nameMatch = turkishMatches(p.name, trimmedQuery);
        const descMatch = turkishMatches(p.description, trimmedQuery);
        const tagMatch = p.tags.some((t) => turkishMatches(t.tag.name, trimmedQuery));
        return nameMatch || descMatch || tagMatch;
      })
      .slice(0, 8)
      .map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        icon: p.icon,
        color: p.color,
        totalNotes: p._count.notes,
      }));

    const matchedNotes = allNotes
      .filter((n) => {
        return (
          turkishMatches(n.content, trimmedQuery) ||
          turkishMatches(n.project.name, trimmedQuery)
        );
      })
      .slice(0, 15)
      .map((n) => ({
        id: n.id,
        projectId: n.projectId,
        content: n.content,
        category: n.category,
        status: n.status,
        priority: n.priority,
        createdAt: n.createdAt,
        project: n.project,
      }));

    return NextResponse.json({
      projects: matchedProjects,
      notes: matchedNotes,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Arama yapılırken hata oluştu." }, { status: 500 });
  }
}
