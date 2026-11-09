import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("=== TÜM ESKİ ÖRNEK VERİLER TEMİZLENİYOR ===");

  // 1. Clean existing notes, credentials, links, tags, and projects
  await prisma.noteTag.deleteMany();
  await prisma.projectTag.deleteMany();
  await prisma.projectCredential.deleteMany();
  await prisma.projectLink.deleteMany();
  await prisma.note.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.project.deleteMany();

  console.log("Eski veriler temizlendi. Gerçek Coolify ve GitHub projeleri yükleniyor...");

  // 2. Ensure main user exists
  const hashedPassword = await bcrypt.hash("demo1234", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@projenotlar.com" },
    update: { name: "Uğur" },
    create: {
      name: "Uğur",
      email: "demo@projenotlar.com",
      passwordHash: hashedPassword,
    },
  });

  console.log(`Kullanıcı: ${user.name} (${user.email})`);

  // 3. Define Real Projects from GitHub and Coolify
  const realProjects = [
    {
      name: "WhatsApp AI SaaS",
      description: "WhatsApp üzerinden yapay zeka destekli müşteri yönetimi ve mesajlaşma otomasyonu.",
      status: "active",
      icon: "message-circle",
      color: "#10b981",
      priority: "high",
      url: "https://wpotomasyon.tr",
      adminUrl: "https://wpotomasyon.tr/admin",
      githubUrl: "https://github.com/UuR-Code/whatsapp-ai-saas",
      tags: ["WhatsApp", "Yapay Zeka", "SaaS", "Otomasyon"],
      links: [
        { label: "Canlı Site", url: "https://wpotomasyon.tr" },
        { label: "GitHub Repo", url: "https://github.com/UuR-Code/whatsapp-ai-saas" },
      ],
      notes: [
        {
          content: "Çoklu WhatsApp hesabı bağlama ve QR kod oturum yenileme süreleri test edilecek.",
          category: "issue",
          priority: "high",
        },
        {
          content: "Webhook hata kayıtları ve yanıt süreleri izleme paneline eklenebilir.",
          category: "idea",
          priority: "normal",
        },
      ],
    },
    {
      name: "HafifSepet",
      description: "Market fiyat karşılaştırma ve akıllı sepet optimizasyon platformu.",
      status: "active",
      icon: "shopping-cart",
      color: "#8b5cf6",
      priority: "high",
      url: "https://hafifsepet.com",
      githubUrl: "https://github.com/UuR-Code/hafifsepet",
      tags: ["E-Ticaret", "Fiyat Karşılaştırma", "Web"],
      links: [
        { label: "Canlı Site", url: "https://hafifsepet.com" },
        { label: "GitHub Repo", url: "https://github.com/UuR-Code/hafifsepet" },
      ],
      notes: [
        {
          content: "Ürün filtrelerinde ve barkod arama sonuçlarında sayfalama performansı optimize edilecek.",
          category: "improvement",
          priority: "normal",
        },
        {
          content: "En ucuz market sepeti kombinasyonu için anlık indirim alarmı entegrasyonu.",
          category: "idea",
          priority: "normal",
        },
      ],
    },
    {
      name: "BrandLook Studio",
      description: "7/24 Lead Generator & Editorial Studio CRM ve marka içerik yönetim sistemi.",
      status: "active",
      icon: "camera",
      color: "#ec4899",
      priority: "normal",
      url: "https://brandlook.tr",
      githubUrl: "https://github.com/UuR-Code/brandlook",
      tags: ["CRM", "Lead Gen", "Studio", "Pazarlama"],
      links: [
        { label: "Canlı Site", url: "https://brandlook.tr" },
        { label: "GitHub Repo", url: "https://github.com/UuR-Code/brandlook" },
      ],
      notes: [
        {
          content: "Otomatik lead oluşturucu webhook bildirimleri incelenecek.",
          category: "issue",
          priority: "normal",
        },
      ],
    },
    {
      name: "Fiyat Radarı",
      description: "Otonom fırsat & fiyat takip motoru ve anlık indirim bildirim sistemi.",
      status: "active",
      icon: "bell",
      color: "#f59e0b",
      priority: "high",
      url: "https://fiyatradar.tr",
      githubUrl: "https://github.com/UuR-Code/indirim-habercisi",
      tags: ["Fiyat Takip", "Bot", "İndirim", "Python"],
      links: [
        { label: "Canlı Site", url: "https://fiyatradar.tr" },
        { label: "GitHub Repo", url: "https://github.com/UuR-Code/indirim-habercisi" },
      ],
      notes: [
        {
          content: "Fiyat düşüşü anında gönderilen Telegram alarmları test edilecek.",
          category: "bug",
          priority: "high",
        },
      ],
    },
    {
      name: "Durbasma",
      description: "Sıra tabanlı senkron geri sayım yarışması ve ödül platformu.",
      status: "active",
      icon: "gamepad-2",
      color: "#3b82f6",
      priority: "normal",
      url: "https://oyun.taskotic.com",
      githubUrl: "https://github.com/UuR-Code/durbasma",
      tags: ["Oyun", "Gerçek Zamanlı", "WebSocket"],
      links: [
        { label: "Canlı Oyun", url: "https://oyun.taskotic.com" },
        { label: "GitHub Repo", url: "https://github.com/UuR-Code/durbasma" },
      ],
      notes: [
        {
          content: "Sıra tabanlı senkronizasyonda gecikme (latency) testleri kontrol edilecek.",
          category: "bug",
          priority: "high",
        },
      ],
    },
    {
      name: "Yüreğir Sinyal Sistemi",
      description: "BIST al-sat sinyal tarama sistemi - Yüreğir Pullback algoritması.",
      status: "active",
      icon: "trending-up",
      color: "#059669",
      priority: "high",
      url: "https://borsa.taskotic.com",
      githubUrl: "https://github.com/UuR-Code/yuregir-sinyal-sistemi",
      tags: ["Borsa", "Algoritma", "Finans", "Sinyal"],
      links: [
        { label: "Dashboard", url: "https://borsa.taskotic.com" },
        { label: "GitHub Repo", url: "https://github.com/UuR-Code/yuregir-sinyal-sistemi" },
      ],
      notes: [
        {
          content: "Gün sonu mum kapanışlarında sinyal üretim süresi doğrulanacak.",
          category: "issue",
          priority: "high",
        },
      ],
    },
    {
      name: "Video Otomasyon",
      description: "Yapay zeka ile otomatik dikey video (Reels/Shorts/TikTok) üretim sistemi.",
      status: "active",
      icon: "video",
      color: "#dc2626",
      priority: "normal",
      url: "https://video.taskotic.com",
      githubUrl: "https://github.com/UuR-Code/video-otomasyon",
      tags: ["Video", "AI", "Otomasyon"],
      links: [
        { label: "Canlı Panel", url: "https://video.taskotic.com" },
        { label: "GitHub Repo", url: "https://github.com/UuR-Code/video-otomasyon" },
      ],
      notes: [
        {
          content: "Seslendirme ve altyazı senkronizasyon modelleri test edilecek.",
          category: "improvement",
          priority: "normal",
        },
      ],
    },
    {
      name: "Maps Scraper LeadGen",
      description: "Self-hosted Google Maps tabanlı yerel işletme ve müşteri bulma aracı.",
      status: "active",
      icon: "map-pin",
      color: "#0284c7",
      priority: "normal",
      url: "https://musteri.taskotic.com",
      githubUrl: "https://github.com/UuR-Code/maps-scraper-leadgen",
      tags: ["Lead Gen", "Harita", "Scraper", "Go"],
      links: [
        { label: "Canlı Panel", url: "https://musteri.taskotic.com" },
        { label: "GitHub Repo", url: "https://github.com/UuR-Code/maps-scraper-leadgen" },
      ],
      notes: [
        {
          content: "Proxy rotasyonları ve sonuç dışa aktarma hızları kontrol edilecek.",
          category: "issue",
          priority: "normal",
        },
      ],
    },
    {
      name: "Tivi Gündem",
      description: "Dijital haber yayını, canlı gündem akışı ve yönetim paneli.",
      status: "active",
      icon: "tv",
      color: "#e11d48",
      priority: "normal",
      url: "https://tivigundem.com",
      adminUrl: "https://admin.tivigundem.com",
      githubUrl: "https://github.com/UuR-Code/broadcast-news",
      tags: ["Haber", "Yayın", "Medya"],
      links: [
        { label: "Canlı Site", url: "https://tivigundem.com" },
        { label: "Admin Paneli", url: "https://admin.tivigundem.com" },
        { label: "GitHub Repo", url: "https://github.com/UuR-Code/broadcast-news" },
      ],
      notes: [
        {
          content: "Canlı yayın akışı ve RSS entegrasyonları kontrol edilecek.",
          category: "general",
          priority: "normal",
        },
      ],
    },
    {
      name: "AURA AI Influencer Panel",
      description: "Yapay zeka sanal influencer karakter, görsel ve içerik yönetim stüdyosu.",
      status: "active",
      icon: "sparkles",
      color: "#6366f1",
      priority: "high",
      githubUrl: "https://github.com/UuR-Code/ai-influencer-panel",
      tags: ["AI Influencer", "Üretken Yapay Zeka", "Karakter"],
      links: [
        { label: "GitHub Repo", url: "https://github.com/UuR-Code/ai-influencer-panel" },
      ],
      notes: [
        {
          content: "Yeni karakter oluşturma adımları ve prompt şablonları basitleştirilecek.",
          category: "idea",
          priority: "normal",
        },
      ],
    },
    {
      name: "Güzellik Randevu",
      description: "Güzellik salonu, kuaför ve spa randevu takip sistemi.",
      status: "active",
      icon: "calendar",
      color: "#d946ef",
      priority: "normal",
      url: "https://h68a86wdkz041g8rcj5l1tk2.46.62.218.106.sslip.io",
      githubUrl: "https://github.com/UuR-Code/guzellik-randevu",
      tags: ["Randevu", "Hizmet", "Mobil"],
      links: [
        { label: "Canlı Uygulama", url: "https://h68a86wdkz041g8rcj5l1tk2.46.62.218.106.sslip.io" },
        { label: "GitHub Repo", url: "https://github.com/UuR-Code/guzellik-randevu" },
      ],
      notes: [
        {
          content: "Müşteri SMS ve WhatsApp randevu hatırlatma şablonu eklenecek.",
          category: "idea",
          priority: "normal",
        },
      ],
    },
    {
      name: "Android Test Havuzu",
      description: "Kredi tabanlı kapalı beta 14 gün / 20 test kullanıcısı platformu.",
      status: "active",
      icon: "smartphone",
      color: "#16a34a",
      priority: "normal",
      url: "http://ie892cbwphtzo3x7prnj7br0.46.62.218.106.sslip.io",
      githubUrl: "https://github.com/UuR-Code/android-testers",
      tags: ["Android", "Google Play", "Test", "Beta"],
      links: [
        { label: "Canlı Panel", url: "http://ie892cbwphtzo3x7prnj7br0.46.62.218.106.sslip.io" },
        { label: "GitHub Repo", url: "https://github.com/UuR-Code/android-testers" },
      ],
      notes: [
        {
          content: "Test cihazı doğrulama ve kredi yükleme akışı test edilecek.",
          category: "issue",
          priority: "normal",
        },
      ],
    },
    {
      name: "Servis Takip",
      description: "Minimalist mobil servis, güzergah ve personel vardiya takip sistemi.",
      status: "active",
      icon: "bus",
      color: "#0d9488",
      priority: "normal",
      url: "https://i3gqb40ra7oa8uqvgry73msp.46.62.218.106.sslip.io",
      githubUrl: "https://github.com/UuR-Code/servis-takip",
      tags: ["Servis", "Lojistik", "Mobil"],
      links: [
        { label: "Canlı Panel", url: "https://i3gqb40ra7oa8uqvgry73msp.46.62.218.106.sslip.io" },
        { label: "GitHub Repo", url: "https://github.com/UuR-Code/servis-takip" },
      ],
      notes: [
        {
          content: "Harita üzerinde canlı konum paylaşım bağlantısı eklenecek.",
          category: "idea",
          priority: "normal",
        },
      ],
    },
    {
      name: "Dijital Davetiye",
      description: "Dijital düğün davetiye sistemi - admin panel ve interaktif davetiye sayfaları.",
      status: "active",
      icon: "mail",
      color: "#be185d",
      priority: "normal",
      githubUrl: "https://github.com/UuR-Code/dijital-davetiye",
      tags: ["Davetiye", "Düğün", "Web"],
      links: [
        { label: "GitHub Repo", url: "https://github.com/UuR-Code/dijital-davetiye" },
      ],
      notes: [
        {
          content: "LCV (katılım durumu) yanıt formu mobil tasarımı incelenecek.",
          category: "improvement",
          priority: "normal",
        },
      ],
    },
    {
      name: "Düğün Pusulası",
      description: "Evlilik ve düğün organizasyonu planlama rehberi platformu.",
      status: "active",
      icon: "heart",
      color: "#f43f5e",
      priority: "normal",
      githubUrl: "https://github.com/UuR-Code/dugun-pusulasi",
      tags: ["Düğün", "Rehber", "Organizasyon"],
      links: [
        { label: "GitHub Repo", url: "https://github.com/UuR-Code/dugun-pusulasi" },
      ],
      notes: [
        {
          content: "Düğün mekanları için filtreleme kriterleri genişletilecek.",
          category: "idea",
          priority: "normal",
        },
      ],
    },
    {
      name: "AI News",
      description: "Yapay zeka dünyasından en güncel haberleri toplayan ve özetleyen platform.",
      status: "active",
      icon: "newspaper",
      color: "#0284c7",
      priority: "normal",
      githubUrl: "https://github.com/UuR-Code/ai-news",
      tags: ["AI", "Haber", "Özet"],
      links: [
        { label: "GitHub Repo", url: "https://github.com/UuR-Code/ai-news" },
      ],
      notes: [
        {
          content: "Günlük yapay zeka bülteni otomatik özetleme akışı kontrol edilecek.",
          category: "general",
          priority: "normal",
        },
      ],
    },
    {
      name: "Evden İş",
      description: "Evden çalışma ve serbest zamanlı freelance iş fırsatları platformu.",
      status: "active",
      icon: "briefcase",
      color: "#4f46e5",
      priority: "normal",
      url: "http://a7mgkn1vley4wsx6am6su8q8.46.62.218.106.sslip.io:3000",
      githubUrl: "https://github.com/UuR-Code/evden-is",
      tags: ["İş", "Freelance", "Kariyer"],
      links: [
        { label: "Canlı Site", url: "http://a7mgkn1vley4wsx6am6su8q8.46.62.218.106.sslip.io:3000" },
        { label: "GitHub Repo", url: "https://github.com/UuR-Code/evden-is" },
      ],
      notes: [
        {
          content: "İlan filtreleme ve başvuru bildirimleri test edilecek.",
          category: "issue",
          priority: "normal",
        },
      ],
    },
    {
      name: "LeadAuto",
      description: "Otomatik web satış ve müşteri adayı toplama sistemi.",
      status: "active",
      icon: "target",
      color: "#ea580c",
      priority: "normal",
      url: "http://c116a5dzd6m1rfmx5p7t8ogy.46.62.218.106.sslip.io",
      githubUrl: "https://github.com/UuR-Code/leadauto",
      tags: ["Satış", "Otomasyon", "Lead"],
      links: [
        { label: "Canlı Panel", url: "http://c116a5dzd6m1rfmx5p7t8ogy.46.62.218.106.sslip.io" },
        { label: "GitHub Repo", url: "https://github.com/UuR-Code/leadauto" },
      ],
      notes: [
        {
          content: "Form dönüşüm oranları takip paneli hazırlanacak.",
          category: "idea",
          priority: "normal",
        },
      ],
    },
    {
      name: "Promptlar Galerisi",
      description: "Yapay zeka görsel ve video promptları, modeller ve çıktı kütüphanesi.",
      status: "active",
      icon: "terminal",
      color: "#9333ea",
      priority: "normal",
      githubUrl: "https://github.com/UuR-Code/promptlar",
      tags: ["Prompt", "Midjourney", "Kütüphane"],
      links: [
        { label: "GitHub Repo", url: "https://github.com/UuR-Code/promptlar" },
      ],
      notes: [
        {
          content: "Tek tıkla prompt kopyalama ve model etiketleme sistemi eklenecek.",
          category: "improvement",
          priority: "normal",
        },
      ],
    },
    {
      name: "İnsta Reels",
      description: "Instagram Reels hazırlama ve otomatik video kurgu pipeline'ı.",
      status: "active",
      icon: "film",
      color: "#c026d3",
      priority: "normal",
      githubUrl: "https://github.com/UuR-Code/insta-reels",
      tags: ["Instagram", "Reels", "Video", "Python"],
      links: [
        { label: "GitHub Repo", url: "https://github.com/UuR-Code/insta-reels" },
      ],
      notes: [
        {
          content: "Arka plan müzik ve altyazı şablonları güncellenecek.",
          category: "idea",
          priority: "normal",
        },
      ],
    },
    {
      name: "İnsta Copy",
      description: "Instagram style-clone arayüz ve tema klonlama dashboard'u.",
      status: "active",
      icon: "copy",
      color: "#e11d48",
      priority: "normal",
      url: "http://b11rv0j9lxh9hapj317wg4en.46.62.218.106.sslip.io",
      githubUrl: "https://github.com/UuR-Code/insta-copy",
      tags: ["Dashboard", "UI", "Instagram"],
      links: [
        { label: "Canlı Panel", url: "http://b11rv0j9lxh9hapj317wg4en.46.62.218.106.sslip.io" },
        { label: "GitHub Repo", url: "https://github.com/UuR-Code/insta-copy" },
      ],
      notes: [
        {
          content: "Mobil dokunmatik hikaye (stories) kaydırma animasyonu düzeltilecek.",
          category: "bug",
          priority: "normal",
        },
      ],
    },
    {
      name: "Proje Notları",
      description: "Kişisel Proje, Fikir ve Eksik Takip Sistemi (PWA destekli).",
      status: "active",
      icon: "file-text",
      color: "#2563eb",
      priority: "high",
      url: "https://proje-notlar.46.62.218.106.sslip.io",
      githubUrl: "https://github.com/UuR-Code/proje-notlar",
      tags: ["Not", "PWA", "Yönetim", "SaaS"],
      links: [
        { label: "Canlı Sistem", url: "https://proje-notlar.46.62.218.106.sslip.io" },
        { label: "GitHub Repo", url: "https://github.com/UuR-Code/proje-notlar" },
      ],
      notes: [
        {
          content: "Ekran görüntüsü yükleme, doğrudan panodan görsel yapıştırma (Ctrl+V) ve kalıcı proje silme özellikleri tamamlandı.",
          category: "improvement",
          priority: "high",
        },
      ],
    },
  ];

  for (const projData of realProjects) {
    const project = await prisma.project.create({
      data: {
        userId: user.id,
        name: projData.name,
        description: projData.description,
        status: projData.status,
        icon: projData.icon,
        color: projData.color,
        url: projData.url || null,
        adminUrl: projData.adminUrl || null,
        priority: projData.priority,
      },
    });

    // Create links
    if (projData.links && projData.links.length > 0) {
      for (const link of projData.links) {
        await prisma.projectLink.create({
          data: {
            projectId: project.id,
            label: link.label,
            url: link.url,
          },
        });
      }
    }

    // Create tags
    if (projData.tags && projData.tags.length > 0) {
      for (const tagName of projData.tags) {
        const tag = await prisma.tag.upsert({
          where: {
            userId_name: {
              userId: user.id,
              name: tagName,
            },
          },
          update: {},
          create: {
            userId: user.id,
            name: tagName,
          },
        });

        await prisma.projectTag.create({
          data: {
            projectId: project.id,
            tagId: tag.id,
          },
        });
      }
    }

    // Create initial notes
    if (projData.notes && projData.notes.length > 0) {
      for (const n of projData.notes) {
        await prisma.note.create({
          data: {
            projectId: project.id,
            userId: user.id,
            content: n.content,
            category: n.category,
            priority: n.priority,
            status: "open",
          },
        });
      }
    }

    console.log(`+ Eklendi: ${projData.name} (${projData.links?.length || 0} bağlantı, ${projData.notes?.length || 0} not)`);
  }

  console.log(`\nBAŞARILI: Toplam ${realProjects.length} adet gerçek proje sisteme tanımlandı.`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
