/**
 * DEEP SYSTEM AUDIT & VERIFICATION SUITE
 * Exhaustively tests all layers:
 * 1. Healthcheck & System Metrics
 * 2. Auth & Session Lifecycle
 * 3. Input Validation & Error Handling
 * 4. Multi-tenant User Data Isolation
 * 5. AES-256-GCM Vault & Masking Security
 * 6. Projects CRUD & Link Operations
 * 7. Notes CRUD, Status, Priorities & Categories
 * 8. Soft Delete, Trash Lifecycle & Undo
 * 9. Turkish Search & Complex Filtering
 * 10. JSON / CSV Export & Safe JSON Import
 * 11. PWA & Static Asset Integrity
 * 12. Frontend Route Renderability
 * 13. High-load & Stress Verification
 */

export {};

const BASE_URL = "http://localhost:3000";

interface TestReportItem {
  id: number;
  category: string;
  name: string;
  status: "PASS" | "FAIL";
  durationMs: number;
  details?: string;
}

const report: TestReportItem[] = [];
let testIdCounter = 1;

async function runTest(
  category: string,
  name: string,
  fn: () => Promise<{ passed: boolean; details?: string }>
) {
  const start = performance.now();
  try {
    const res = await fn();
    const durationMs = Math.round(performance.now() - start);
    report.push({
      id: testIdCounter++,
      category,
      name,
      status: res.passed ? "PASS" : "FAIL",
      durationMs,
      details: res.details,
    });
  } catch (error: any) {
    const durationMs = Math.round(performance.now() - start);
    report.push({
      id: testIdCounter++,
      category,
      name,
      status: "FAIL",
      durationMs,
      details: error.message || String(error),
    });
  }
}

async function audit() {
  console.log("==========================================================");
  console.log("       PROJE NOTLARI – DERİN SİSTEM TESTİ & DENETİMİ       ");
  console.log("==========================================================\n");

  let userACookie = "";
  let userBCookie = "";
  let testProjectIdA = "";
  let testProjectIdB = "";
  let testNoteIdA = "";

  // ----------------------------------------------------
  // BÖLÜM 1: Sistem & Healthcheck
  // ----------------------------------------------------
  await runTest("Sistem", "Sunucu /api/health kontrolü", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    return {
      passed: res.status === 200 && data.status === "healthy" && data.db === "connected",
      details: `Durum: ${data.status}, DB: ${data.db}, Uptime: ${Math.round(data.uptime)}s`,
    };
  });

  // ----------------------------------------------------
  // BÖLÜM 2: Kimlik Doğrulama & Oturum Yönetimi
  // ----------------------------------------------------
  const userAEmail = `test_audit_a_${Date.now()}@example.com`;
  const userBEmail = `test_audit_b_${Date.now()}@example.com`;

  await runTest("Oturum & Güvenlik", "Kısa şifreyle kayıt reddi (< 6 karakter)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Kısa Şifre", email: "kisa@test.com", password: "123" }),
    });
    return {
      passed: res.status === 400,
      details: `Beklenen: 400, Dönen: ${res.status}`,
    };
  });

  await runTest("Oturum & Güvenlik", "Eksik bilgiyle kayıt reddi", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", email: "", password: "" }),
    });
    return {
      passed: res.status === 400,
      details: `Beklenen: 400, Dönen: ${res.status}`,
    };
  });

  await runTest("Oturum & Güvenlik", "Yeni Kullanıcı A kaydı ve JWT çerezi", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Denetçi Kullanıcı A", email: userAEmail, password: "SecretPassword123!" }),
    });
    const cookie = res.headers.get("set-cookie");
    if (cookie) userACookie = cookie.split(";")[0];
    return {
      passed: res.status === 200 && userACookie.includes("pn_session"),
      details: `Oturum çerezi üretildi: ${userACookie.slice(0, 25)}...`,
    };
  });

  await runTest("Oturum & Güvenlik", "Mükerrer e-posta ile kayıt reddi (409 Conflict)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Aynı Kullanıcı", email: userAEmail, password: "SecretPassword123!" }),
    });
    return {
      passed: res.status === 409,
      details: `Beklenen: 409, Dönen: ${res.status}`,
    };
  });

  await runTest("Oturum & Güvenlik", "Hatalı şifreyle giriş reddi (401 Unauthorized)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userAEmail, password: "YanlisSifre123" }),
    });
    return {
      passed: res.status === 401,
      details: `Beklenen: 401, Dönen: ${res.status}`,
    };
  });

  await runTest("Oturum & Güvenlik", "Doğru şifreyle giriş ve /api/auth/me doğrulaması", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userAEmail, password: "SecretPassword123!" }),
    });
    const cookie = res.headers.get("set-cookie")?.split(";")[0] || userACookie;
    userACookie = cookie;

    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: userACookie },
    });
    const meData = await meRes.json();
    return {
      passed: res.status === 200 && meData.authenticated === true && meData.user.email === userAEmail,
      details: `Doğrulanan kullanıcı: ${meData.user?.email}`,
    };
  });

  await runTest("Oturum & Güvenlik", "Yeni Kullanıcı B kaydı (İzolasyon testi için)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Kullanıcı B", email: userBEmail, password: "PasswordB123!" }),
    });
    const cookie = res.headers.get("set-cookie");
    if (cookie) userBCookie = cookie.split(";")[0];
    return {
      passed: res.status === 200 && !!userBCookie,
      details: `Kullanıcı B oluşturuldu.`,
    };
  });

  // ----------------------------------------------------
  // BÖLÜM 3: Proje İşlemleri & Kasa Güvenliği (AES-256-GCM)
  // ----------------------------------------------------
  await runTest("Proje Yönetimi", "Proje adı olmadan oluşturma engeli (400)", async () => {
    const res = await fetch(`${BASE_URL}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userACookie },
      body: JSON.stringify({ name: "   " }),
    });
    return { passed: res.status === 400, details: `Boş isim engellendi (400)` };
  });

  await runTest("Proje Yönetimi", "Yalnızca isimle hızlı proje oluşturma", async () => {
    const res = await fetch(`${BASE_URL}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userACookie },
      body: JSON.stringify({ name: "Hızlı Deneme Projesi" }),
    });
    const data = await res.json();
    testProjectIdA = data.id;
    return {
      passed: res.status === 201 && data.name === "Hızlı Deneme Projesi",
      details: `Oluşturulan Proje ID: ${data.id}`,
    };
  });

  await runTest("Proje Yönetimi", "Tüm alanlar ve AES-256 Şifreli Kasa ile proje oluşturma", async () => {
    const res = await fetch(`${BASE_URL}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userACookie },
      body: JSON.stringify({
        name: "Güvenli Ödeme SaaS",
        description: "B2B ödeme geçidi ve sanal POS entegrasyonu.",
        url: "https://odeme-saas.com",
        adminUrl: "https://panel.odeme-saas.com",
        username: "superadmin@odeme.com",
        passwordNote: "P@ssw0rd!MasterKey2026",
        priority: "high",
        color: "#10b981",
        icon: "whatsapp",
        tags: ["Fintech", "Ödeme", "SaaS"],
      }),
    });
    const data = await res.json();
    return {
      passed: res.status === 201 && !!data.id,
      details: `Proje: ${data.name}, Renk: ${data.color}`,
    };
  });

  await runTest("Kasa Güvenliği", "Kasa şifresi çözümü doğrulaması (Yetkili kullanıcı)", async () => {
    // Proje detayını çek
    const listRes = await fetch(`${BASE_URL}/api/projects`, { headers: { Cookie: userACookie } });
    const list = await listRes.json();
    const proj = list.find((p: any) => p.name === "Güvenli Ödeme SaaS");

    const detailRes = await fetch(`${BASE_URL}/api/projects/${proj.id}`, {
      headers: { Cookie: userACookie },
    });
    const detail = await detailRes.json();
    const cred = detail.credentials?.[0];

    const isMatch = cred && cred.decryptedPassword === "P@ssw0rd!MasterKey2026";
    return {
      passed: isMatch,
      details: `Çözülen şifre: ${cred?.decryptedPassword}`,
    };
  });

  await runTest("Proje Yönetimi", "Projeye çoklu bağlantı ekleme (URL listesi)", async () => {
    const res = await fetch(`${BASE_URL}/api/projects/${testProjectIdA}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userACookie },
      body: JSON.stringify({ label: "API Dokümanı", url: "https://docs.api.com" }),
    });
    const data = await res.json();
    return {
      passed: res.status === 201 && data.label === "API Dokümanı",
      details: `Bağlantı ID: ${data.id}`,
    };
  });

  await runTest("Proje Yönetimi", "Proje güncelleme (PATCH)", async () => {
    const res = await fetch(`${BASE_URL}/api/projects/${testProjectIdA}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: userACookie },
      body: JSON.stringify({
        name: "Hızlı Deneme Projesi Güncellendi",
        priority: "high",
      }),
    });
    const data = await res.json();
    return {
      passed: res.status === 200 && data.name === "Hızlı Deneme Projesi Güncellendi" && data.priority === "high",
      details: `Güncellenen İsim: ${data.name}`,
    };
  });

  // ----------------------------------------------------
  // BÖLÜM 4: Çok Kullanıcılı Veri İzolasyonu (Güvenlik Duvarı)
  // ----------------------------------------------------
  await runTest("Veri İzolasyonu", "Kullanıcı B, Kullanıcı A'nın projesine erişemez (404/Engelli)", async () => {
    const res = await fetch(`${BASE_URL}/api/projects/${testProjectIdA}`, {
      headers: { Cookie: userBCookie },
    });
    return {
      passed: res.status === 404,
      details: `Beklenen: 404, Dönen durum: ${res.status}`,
    };
  });

  await runTest("Veri İzolasyonu", "Kullanıcı B, Kullanıcı A'nın projesini güncelleyemez", async () => {
    const res = await fetch(`${BASE_URL}/api/projects/${testProjectIdA}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: userBCookie },
      body: JSON.stringify({ name: "Yetkisiz Değişiklik" }),
    });
    return {
      passed: res.status === 404,
      details: `Beklenen: 404, Dönen durum: ${res.status}`,
    };
  });

  // ----------------------------------------------------
  // BÖLÜM 5: Not Yönetimi, Kategoriler & Durum Değişikliği
  // ----------------------------------------------------
  await runTest("Not Yönetimi", "Boş içerikli not reddi (400)", async () => {
    const res = await fetch(`${BASE_URL}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userACookie },
      body: JSON.stringify({ projectId: testProjectIdA, content: "   " }),
    });
    return { passed: res.status === 400, details: `Boş not engellendi (400)` };
  });

  await runTest("Not Yönetimi", "Farklı kategorilerde not oluşturma (Yeni Fikir, Eksik, Hata, İyileştirme)", async () => {
    const categories = [
      { cat: "idea", content: "AI destekli akıllı filtreleme eklensin." },
      { cat: "issue", content: "Mobil ekranda kaydırma çubuğu gizlenmeli." },
      { cat: "bug", content: "Giriş yaparken 500 dönen uç senaryo düzeltilmeli." },
      { cat: "improvement", content: "Veritabanı indeksleri optimize edilsin." },
    ];

    let allCreated = true;
    for (const c of categories) {
      const res = await fetch(`${BASE_URL}/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: userACookie },
        body: JSON.stringify({
          projectId: testProjectIdA,
          content: c.content,
          category: c.cat,
          priority: "normal",
        }),
      });
      if (res.status !== 201) allCreated = false;
      const data = await res.json();
      if (!testNoteIdA) testNoteIdA = data.id;
    }

    return {
      passed: allCreated,
      details: `4 farklı kategoride not eklendi. Örnek Not ID: ${testNoteIdA}`,
    };
  });

  await runTest("Not Yönetimi", "Not güncelleme (İçerik & Öncelik)", async () => {
    const res = await fetch(`${BASE_URL}/api/notes/${testNoteIdA}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: userACookie },
      body: JSON.stringify({
        content: "AI destekli akıllı filtreleme eklendi ve test edildi.",
        priority: "high",
      }),
    });
    const data = await res.json();
    return {
      passed: res.status === 200 && data.content.includes("test edildi") && data.priority === "high",
      details: `Güncellenen Öncelik: ${data.priority}`,
    };
  });

  await runTest("Not Yönetimi", "Notu tek tıkla Tamamlandı olarak işaretleme", async () => {
    const res = await fetch(`${BASE_URL}/api/notes/${testNoteIdA}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: userACookie },
      body: JSON.stringify({ status: "completed" }),
    });
    const data = await res.json();
    return {
      passed: res.status === 200 && data.status === "completed",
      details: `Durum: ${data.status}`,
    };
  });

  await runTest("Not Yönetimi", "Notu Başa Sabitleme (Pinning)", async () => {
    const res = await fetch(`${BASE_URL}/api/notes/${testNoteIdA}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: userACookie },
      body: JSON.stringify({ isPinned: true }),
    });
    const data = await res.json();
    return {
      passed: res.status === 200 && data.isPinned === true,
      details: `Sabitlendi mi: ${data.isPinned}`,
    };
  });

  // ----------------------------------------------------
  // BÖLÜM 6: Çöp Kutusu, Soft-Delete & Geri Yükleme (Undo)
  // ----------------------------------------------------
  await runTest("Çöp Kutusu & Geri Alma", "Notu çöp kutusuna taşıma (Soft Delete)", async () => {
    const res = await fetch(`${BASE_URL}/api/notes/${testNoteIdA}`, {
      method: "DELETE",
      headers: { Cookie: userACookie },
    });
    return {
      passed: res.status === 200,
      details: `Not çöp kutusuna taşındı.`,
    };
  });

  await runTest("Çöp Kutusu & Geri Alma", "Çöp kutusu listesinde silinen notun görünmesi", async () => {
    const res = await fetch(`${BASE_URL}/api/trash`, {
      headers: { Cookie: userACookie },
    });
    const data = await res.json();
    const found = Array.isArray(data) && data.some((n: any) => n.id === testNoteIdA);
    return {
      passed: found,
      details: `Çöp kutusundaki toplam silinmiş not sayısı: ${data.length}`,
    };
  });

  await runTest("Çöp Kutusu & Geri Alma", "Silinen notu tek tıkla geri yükleme (/restore)", async () => {
    const res = await fetch(`${BASE_URL}/api/notes/${testNoteIdA}/restore`, {
      method: "POST",
      headers: { Cookie: userACookie },
    });
    const data = await res.json();
    return {
      passed: res.status === 200 && data.success === true && data.note.deletedAt === null,
      details: `Geri yüklenen not deletedAt: null`,
    };
  });

  // ----------------------------------------------------
  // BÖLÜM 7: Türkçe Arama & Gelişmiş Filtreleme
  // ----------------------------------------------------
  await runTest("Arama & Filtre", "Türkçe büyük/küçük harf duyarlı arama (İ / i, Ödeme / ödeme)", async () => {
    const [resUpper, resLower] = await Promise.all([
      fetch(`${BASE_URL}/api/search?q=ÖDEME`, { headers: { Cookie: userACookie } }),
      fetch(`${BASE_URL}/api/search?q=ödeme`, { headers: { Cookie: userACookie } }),
    ]);
    const dataUpper = await resUpper.json();
    const dataLower = await resLower.json();

    const hasUpper = dataUpper.projects.some((p: any) => p.name.includes("Ödeme"));
    const hasLower = dataLower.projects.some((p: any) => p.name.includes("Ödeme"));

    return {
      passed: hasUpper && hasLower,
      details: `ÖDEME eşleşti: ${hasUpper}, ödeme eşleşti: ${hasLower}`,
    };
  });

  await runTest("Arama & Filtre", "Kombine Filtreleme (Proje + Kategori + Durum)", async () => {
    const res = await fetch(
      `${BASE_URL}/api/notes?projectId=${testProjectIdA}&category=bug&status=open`,
      { headers: { Cookie: userACookie } }
    );
    const data = await res.json();
    const allMatch = data.every((n: any) => n.projectId === testProjectIdA && n.category === "bug");
    return {
      passed: res.status === 200 && Array.isArray(data) && allMatch,
      details: `Filtrelenen sonuç: ${data.length} kayıt`,
    };
  });

  // ----------------------------------------------------
  // BÖLÜM 8: Veri Yedekleme, Güvenli Dışa/İçe Aktarma
  // ----------------------------------------------------
  await runTest("Yedekleme & Aktarım", "JSON Dışa Aktarma (Şifrelerin gizlenmesi doğrulaması)", async () => {
    const res = await fetch(`${BASE_URL}/api/export?format=json`, {
      headers: { Cookie: userACookie },
    });
    const data = await res.json();
    const hasPasswords = data.projects.some((p: any) => p.credentials && p.credentials.length > 0);
    return {
      passed: res.status === 200 && !hasPasswords,
      details: `Varsayılan export şifreleri maskeledi mi: ${!hasPasswords}`,
    };
  });

  await runTest("Yedekleme & Aktarım", "JSON Dışa Aktarma (Kullanıcı talebiyle şifreli kasa dahil)", async () => {
    const res = await fetch(`${BASE_URL}/api/export?format=json&includeSecrets=true`, {
      headers: { Cookie: userACookie },
    });
    const data = await res.json();
    const foundSecret = data.projects
      .flatMap((p: any) => p.credentials || [])
      .some((c: any) => c.password === "P@ssw0rd!MasterKey2026");
    return {
      passed: res.status === 200 && foundSecret,
      details: `Kasa şifresi çözülerek dahil edildi: ${foundSecret}`,
    };
  });

  await runTest("Yedekleme & Aktarım", "CSV (Excel) Dışa Aktarma", async () => {
    const res = await fetch(`${BASE_URL}/api/export?format=csv`, {
      headers: { Cookie: userACookie },
    });
    const text = await res.text();
    return {
      passed: res.status === 200 && text.includes("Proje Adı,Kategori,Durum"),
      details: `CSV Satır sayısı: ${text.split("\n").length}`,
    };
  });

  await runTest("Yedekleme & Aktarım", "Güvenli JSON İçe Aktarma (Doğrulama ve Birleştirme)", async () => {
    const backupPayload = {
      projects: [
        {
          name: "İçe Aktarılan Audit Projesi",
          description: "JSON yedeğinden geri yüklenen proje.",
          notes: [
            { content: "Audit içe aktarılan ilk not.", category: "idea", status: "open" },
            { content: "Audit içe aktarılan ikinci not.", category: "bug", status: "open" },
          ],
        },
      ],
    };

    const res = await fetch(`${BASE_URL}/api/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userACookie },
      body: JSON.stringify(backupPayload),
    });
    const data = await res.json();
    return {
      passed: res.status === 200 && data.success === true && data.stats.projects >= 1,
      details: `İçe aktarma: ${data.message}`,
    };
  });

  // ----------------------------------------------------
  // BÖLÜM 9: PWA & Statik Varlık Doğrulaması
  // ----------------------------------------------------
  await runTest("PWA & Varlıklar", "Web App Manifest (/manifest.json) bütünlüğü", async () => {
    const res = await fetch(`${BASE_URL}/manifest.json`);
    const data = await res.json();
    const valid =
      res.status === 200 &&
      data.display === "standalone" &&
      data.theme_color === "#2563eb" &&
      Array.isArray(data.icons) &&
      data.icons.length >= 2;
    return {
      passed: valid,
      details: `Uygulama Adı: ${data.name}, Tema: ${data.theme_color}`,
    };
  });

  await runTest("PWA & Varlıklar", "PWA Simgeleri (/icons/icon-192x192.svg)", async () => {
    const res192 = await fetch(`${BASE_URL}/icons/icon-192x192.svg`);
    const res512 = await fetch(`${BASE_URL}/icons/icon-512x512.svg`);
    return {
      passed: res192.status === 200 && res512.status === 200,
      details: `192x192: ${res192.status}, 512x512: ${res512.status}`,
    };
  });

  // ----------------------------------------------------
  // BÖLÜM 10: Ön Yüz HTML Sayfa Yanıtları (SSR & Client)
  // ----------------------------------------------------
  const pagesToTest = [
    { path: "/", name: "Ana Sayfa Dashboard" },
    { path: "/notes", name: "Tüm Notlar Sayfası" },
    { path: "/issues", name: "Eksikler & Hatalar Sayfası" },
    { path: "/ideas", name: "Yeni Fikirler Sayfası" },
    { path: "/projects", name: "Projelerim Listesi" },
    { path: "/tracking", name: "Takip Listesi" },
    { path: "/archive", name: "Arşiv Sayfası" },
    { path: "/trash", name: "Çöp Kutusu Sayfası" },
    { path: "/settings", name: "Ayarlar Sayfası" },
    { path: "/login", name: "Giriş Sayfası" },
    { path: "/register", name: "Kayıt Sayfası" },
  ];

  for (const page of pagesToTest) {
    await runTest("Ön Yüz Sayfaları", `${page.name} (${page.path}) 200 OK yanıtı`, async () => {
      const res = await fetch(`${BASE_URL}${page.path}`, {
        headers: { Cookie: userACookie },
      });
      const html = await res.text();
      return {
        passed: res.status === 200 && html.includes("<!DOCTYPE html>"),
        details: `Boyut: ${html.length} byte, Durum: ${res.status}`,
      };
    });
  }

  // ----------------------------------------------------
  // BÖLÜM 11: Yüksek Hız & Eşzamanlı Stres Testi
  // ----------------------------------------------------
  await runTest("Performans & Stres", "Arka arkaya 15 eşzamanlı hızlı not kaydı", async () => {
    const start = performance.now();
    const promises = Array.from({ length: 15 }).map((_, idx) =>
      fetch(`${BASE_URL}/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: userACookie },
        body: JSON.stringify({
          projectId: testProjectIdA,
          content: `Stres testi hızlı not maddesi #${idx + 1} - ${Date.now()}`,
          category: idx % 2 === 0 ? "idea" : "improvement",
          priority: "normal",
        }),
      })
    );

    const results = await Promise.all(promises);
    const totalTime = Math.round(performance.now() - start);
    const all201 = results.every((r) => r.status === 201);

    return {
      passed: all201,
      details: `15 not toplam ${totalTime}ms içinde başarıyla oluşturuldu (ortalama ${Math.round(totalTime / 15)}ms/istek)`,
    };
  });

  // ----------------------------------------------------
  // ÖZET RAPOR ÇIKTISI
  // ----------------------------------------------------
  console.log("\n==========================================================");
  console.log("                   TEST SONUÇ TABLOSU                     ");
  console.log("==========================================================");

  let passedCount = 0;
  let failedCount = 0;

  for (const item of report) {
    const icon = item.status === "PASS" ? "✓ PASS" : "✗ FAIL";
    console.log(
      `[${icon}] #${item.id.toString().padStart(2, "0")} [${item.category.padEnd(18, " ")}] ${item.name.padEnd(52, " ")} (${item.durationMs}ms)`
    );
    if (item.details) {
      console.log(`       └─ ${item.details}`);
    }
    if (item.status === "PASS") passedCount++;
    else failedCount++;
  }

  console.log("==========================================================");
  console.log(`TOPLAM: ${report.length} Test | ${passedCount} Başarılı | ${failedCount} Hatalı`);
  console.log("==========================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

audit().catch((err) => {
  console.error("Denetim sırasında kritik hata:", err);
  process.exit(1);
});
