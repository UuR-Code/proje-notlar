/**
 * Comprehensive End-to-End Test Suite for Proje Notları
 * Verifies all 24 requirements from User Request Section 15.
 */

export {};

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== PROJE NOTLARI UÇTAN UCA TEST BAŞLIYOR ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${detail ? `-> ${detail}` : ""}`);
      failed++;
    }
  }

  // Helper for requests with cookies
  let sessionCookie = "";

  // 1. Healthcheck
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = await healthRes.json();
  assert(healthRes.status === 200 && healthData.status === "healthy", "1. Sunucu ve Veritabanı Healthcheck");

  // 2. Demo Login & Auth
  const loginRes = await fetch(`${BASE_URL}/api/auth/demo`, { method: "POST" });
  const cookieHeader = loginRes.headers.get("set-cookie");
  if (cookieHeader) {
    sessionCookie = cookieHeader.split(";")[0];
  }
  assert(loginRes.status === 200 && sessionCookie.includes("pn_session"), "2. Kullanıcı Girişi ve Oturum Çerezi (pn_session)");

  const headers = {
    "Content-Type": "application/json",
    Cookie: sessionCookie,
  };

  // 3. Current User verification
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, { headers });
  const meData = await meRes.json();
  assert(meData.authenticated === true && !!meData.user.id, "3. Oturum Doğrulama /api/auth/me");

  // 4. List existing projects
  const projRes = await fetch(`${BASE_URL}/api/projects`, { headers });
  const projects = await projRes.json();
  assert(Array.isArray(projects) && projects.length >= 5, `4. Başlangıç Projeleri Listelendi (${projects.length} adet)`);

  // 5. Fast project creation (ONLY NAME REQUIRED)
  const fastProjRes = await fetch(`${BASE_URL}/api/projects`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name: "Sadece İsimle Hızlı Proje" }),
  });
  const fastProj = await fastProjRes.json();
  assert(fastProjRes.status === 201 && fastProj.name === "Sadece İsimle Hızlı Proje", "5. Sadece İsimle Hızlı Proje Oluşturma (Criterion 2)");

  // 6. Full project creation with vault credentials & URLs
  const fullProjRes = await fetch(`${BASE_URL}/api/projects`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: "Gelişmiş Finans SaaS",
      description: "Finansal raporlama ve muhasebe otomasyonu.",
      url: "https://finans-saas.com",
      adminUrl: "https://finans-saas.com/admin",
      username: "admin@finans.com",
      passwordNote: "SuperSecretKey99!",
      priority: "high",
      tags: ["Finans", "SaaS", "B2B"],
    }),
  });
  const fullProj = await fullProjRes.json();
  assert(fullProjRes.status === 201 && fullProj.name === "Gelişmiş Finans SaaS", "6. Kapsamlı Proje ve Kasa Giriş Bilgileri ile Oluşturma");

  // 7. Get Project Details & Verify Vault Decryption
  const detailRes = await fetch(`${BASE_URL}/api/projects/${fullProj.id}`, { headers });
  const detailData = await detailRes.json();
  assert(
    detailData.credentials.length > 0 &&
    detailData.credentials[0].decryptedPassword === "SuperSecretKey99!",
    "7. Proje Detayı ve Güvenli Kasa Şifre Çözümü (AES-256-GCM)"
  );

  // 8. Add project link
  const linkRes = await fetch(`${BASE_URL}/api/projects/${fullProj.id}/links`, {
    method: "POST",
    headers,
    body: JSON.stringify({ label: "Coolify Sunucu", url: "https://coolify.myvps.com" }),
  });
  const linkData = await linkRes.json();
  assert(linkRes.status === 201 && linkData.label === "Coolify Sunucu", "8. Projeye Yeni Bağlantı Ekleme");

  // 9. Quick note creation (Default category)
  const note1Res = await fetch(`${BASE_URL}/api/notes`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      projectId: fullProj.id,
      content: "Gelir tablosu PDF dışa aktarma özelliği eklenmeli.",
      category: "general",
    }),
  });
  const note1 = await note1Res.json();
  assert(note1Res.status === 201 && note1.content.includes("PDF dışa aktarma"), "9. Genel Kategoriyle Hızlı Not Ekleme");

  // 10. Note creation with specific categories (idea, bug, issue, improvement)
  const note2Res = await fetch(`${BASE_URL}/api/notes`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      projectId: fullProj.id,
      content: "Banka API entegrasyonunda zaman aşımı kontrolü.",
      category: "bug",
      priority: "high",
    }),
  });
  const note2 = await note2Res.json();
  assert(note2Res.status === 201 && note2.category === "bug" && note2.priority === "high", "10. Hata (Bug) Kategorisinde Yüksek Öncelikli Not");

  // 11. Edit note
  const editNoteRes = await fetch(`${BASE_URL}/api/notes/${note1.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      content: "Gelir tablosu PDF ve Excel dışa aktarma özelliği eklendi.",
      category: "improvement",
    }),
  });
  const editedNote = await editNoteRes.json();
  assert(
    editNoteRes.status === 200 &&
    editedNote.content.includes("Excel") &&
    editedNote.category === "improvement",
    "11. Not Düzenleme (İçerik ve Kategori Güncelleme)"
  );

  // 12. Mark note as completed
  const completeRes = await fetch(`${BASE_URL}/api/notes/${note1.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status: "completed" }),
  });
  const completedNote = await completeRes.json();
  assert(completedNote.status === "completed", "12. Notu Tek Tıkla Tamamlandı Olarak İşaretleme");

  // 13. Move note to another project
  const moveRes = await fetch(`${BASE_URL}/api/notes/${note1.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ projectId: fastProj.id }),
  });
  const movedNote = await moveRes.json();
  assert(movedNote.projectId === fastProj.id, "13. Notu Başka Bir Projeye Taşıma");

  // 14. Soft delete note (Move to Trash)
  const delRes = await fetch(`${BASE_URL}/api/notes/${note2.id}`, {
    method: "DELETE",
    headers,
  });
  assert(delRes.status === 200, "14. Not Silme (Çöp Kutusuna Taşıma)");

  // 15. Verify Trash list
  const trashRes = await fetch(`${BASE_URL}/api/trash`, { headers });
  const trashData = await trashRes.json();
  assert(
    Array.isArray(trashData) && trashData.some((n: any) => n.id === note2.id),
    "15. Çöp Kutusu Listesi ve Silinen Notun Doğrulanması"
  );

  // 16. Restore Note from Trash
  const restoreRes = await fetch(`${BASE_URL}/api/notes/${note2.id}/restore`, {
    method: "POST",
    headers,
  });
  const restoreData = await restoreRes.json();
  assert(restoreRes.status === 200 && restoreData.note.deletedAt === null, "16. Silinen Notu Tek Tıkla Geri Yükleme (Undo)");

  // 17. Global Search (Ctrl+K)
  const searchRes = await fetch(`${BASE_URL}/api/search?q=Finans`, { headers });
  const searchData = await searchRes.json();
  assert(
    searchData.projects.some((p: any) => p.name.includes("Finans")),
    "17. Global Arama (Projeler ve Notlar)"
  );

  // 18. Turkish Character Aware Search
  const searchTrRes = await fetch(`${BASE_URL}/api/search?q=düğün`, { headers });
  const searchTrData = await searchTrRes.json();
  assert(
    searchTrData.projects.some((p: any) => p.name.includes("Düğün")),
    "18. Türkçe Karakter Duyarlı Arama (Düğün / düğün)"
  );

  // 19. Filter notes by uncompleted / category
  const uncompletedRes = await fetch(`${BASE_URL}/api/notes?status=uncompleted`, { headers });
  const uncompletedNotes = await uncompletedRes.json();
  assert(
    uncompletedNotes.every((n: any) => n.status !== "completed"),
    "19. Tamamlanmamış Notları Filtreleme"
  );

  // 20. PWA Web App Manifest
  const manifestRes = await fetch(`${BASE_URL}/manifest.json`);
  const manifestData = await manifestRes.json();
  assert(
    manifestRes.status === 200 && manifestData.display === "standalone" && manifestData.theme_color === "#2563eb",
    "20. PWA Manifest (manifest.json, standalone mod)"
  );

  // 21. Data Export: JSON (with secrets masked by default)
  const exportJsonRes = await fetch(`${BASE_URL}/api/export?format=json`, { headers });
  const exportJson = await exportJsonRes.json();
  assert(
    exportJsonRes.status === 200 &&
    exportJson.projects.length > 0 &&
    exportJson.projects.every((p: any) => p.credentials.length === 0), // credentials excluded by default for security!
    "21. JSON Dışa Aktarma (Şifreler Varsayılan Olarak Gizli/Hariç)"
  );

  // 22. Data Export: JSON with explicit decrypted secrets
  const exportSecretsRes = await fetch(`${BASE_URL}/api/export?format=json&includeSecrets=true`, { headers });
  const exportSecrets = await exportSecretsRes.json();
  const foundCred = exportSecrets.projects.flatMap((p: any) => p.credentials).find((c: any) => c.password === "SuperSecretKey99!");
  assert(!!foundCred, "22. Kullanıcı Talebiyle Şifreli Kasayı Dahil Eden Güvenli JSON Dışa Aktarma");

  // 23. Data Export: CSV
  const exportCsvRes = await fetch(`${BASE_URL}/api/export?format=csv`, { headers });
  const csvText = await exportCsvRes.text();
  assert(
    exportCsvRes.status === 200 && csvText.startsWith("Proje Adı,Kategori,Durum"),
    "23. CSV (Excel) Formatında Dışa Aktarma"
  );

  // 24. Safe JSON Data Import (Merge without data loss)
  const importPayload = {
    projects: [
      {
        name: "İçe Aktarılan Test Projesi",
        description: "Yedekten geri yüklenen harici proje",
        notes: [
          { content: "İçe aktarılan önemli not", category: "idea", status: "open" }
        ]
      }
    ]
  };
  const importRes = await fetch(`${BASE_URL}/api/import`, {
    method: "POST",
    headers,
    body: JSON.stringify(importPayload),
  });
  const importData = await importRes.json();
  assert(importRes.status === 200 && importData.success === true, "24. Güvenli JSON İçe Aktarma ve Veri Doğrulama");

  // Multi-user Isolation Test
  const secondUserRegister = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "İkinci Kullanıcı",
      email: "user2@test.com",
      password: "password123",
    }),
  });
  const secondCookie = secondUserRegister.headers.get("set-cookie")?.split(";")[0] || "";
  const secondUserProjectsRes = await fetch(`${BASE_URL}/api/projects`, {
    headers: { Cookie: secondCookie },
  });
  const secondUserProjects = await secondUserProjectsRes.json();
  const containsFirstUserProj = secondUserProjects.some((p: any) => p.name === "Gelişmiş Finans SaaS");
  assert(!containsFirstUserProj, "25. ÇOKLU KULLANICI VERİ İZOLASYONU: 2. Kullanıcı 1. Kullanıcının Verilerini Göremez");

  console.log("\n==============================================");
  console.log(`TEST SONUCU: ${passed} Başarılı, ${failed} Hatalı`);
  console.log("==============================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Test çalıştırma hatası:", e);
  process.exit(1);
});
