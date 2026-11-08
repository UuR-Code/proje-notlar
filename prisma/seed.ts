import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Veritabanı başlangıç verileri yükleniyor...");

  // Create demo user
  const hashedPassword = await bcrypt.hash("demo1234", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@projenotlar.com" },
    update: {},
    create: {
      name: "Kullanıcı",
      email: "demo@projenotlar.com",
      passwordHash: hashedPassword,
    },
  });

  console.log(`Kullanıcı oluşturuldu: ${user.email} (şifre: demo1234)`);

  // Create initial tags
  const tagsData = ["SaaS", "WhatsApp", "Otomasyon", "E-Ticaret", "Yapay Zeka", "Mobil", "Web"];
  const createdTags: Record<string, string> = {};

  for (const tagName of tagsData) {
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
    createdTags[tagName] = tag.id;
  }

  // 1. WhatsApp SaaS
  const whatsappProject = await prisma.project.create({
    data: {
      userId: user.id,
      name: "WhatsApp SaaS",
      description: "WhatsApp üzerinden otomasyon ve müşteri yönetimi.",
      status: "active",
      icon: "whatsapp",
      color: "#10b981",
      url: "https://panel.wappsaas.com",
      adminUrl: "https://panel.wappsaas.com/admin",
      priority: "high",
      links: {
        create: [
          { label: "Canlı Site", url: "https://wappsaas.com" },
          { label: "Yönetim Paneli", url: "https://panel.wappsaas.com" },
          { label: "GitHub Repo", url: "https://github.com/example/whatsapp-saas" },
        ],
      },
      credentials: {
        create: [
          {
            title: "Admin Girişi",
            username: "kullanici@wappsaas.com",
            encryptedPassword: "DemoPassword123!",
            notes: "Üretim ortamı ana yetkili hesabı",
          },
        ],
      },
      tags: {
        create: [
          { tagId: createdTags["SaaS"] },
          { tagId: createdTags["WhatsApp"] },
          { tagId: createdTags["Otomasyon"] },
        ],
      },
      notes: {
        create: [
          {
            userId: user.id,
            content: "Çoklu WhatsApp hesabı desteği eklenebilir",
            category: "idea",
            status: "open",
            priority: "normal",
            isPinned: true,
          },
          {
            userId: user.id,
            content: "Webhook logları kontrol edilecek",
            category: "issue",
            status: "open",
            priority: "high",
            isPinned: false,
          },
          {
            userId: user.id,
            content: "Mobil panel sadeleştirilmeli",
            category: "improvement",
            status: "open",
            priority: "normal",
            isPinned: false,
          },
        ],
      },
    },
  });

  // 2. Durbasma
  await prisma.project.create({
    data: {
      userId: user.id,
      name: "Durbasma",
      description: "Oyun ve ödül kazanım platformu web sitesi.",
      status: "active",
      icon: "globe",
      color: "#3b82f6",
      url: "https://durbasma.com",
      priority: "normal",
      notes: {
        create: [
          {
            userId: user.id,
            content: "Ödül kazanım testleri kontrol edilecek",
            category: "bug",
            status: "open",
            priority: "high",
          },
          {
            userId: user.id,
            content: "Kullanıcı sıralama tablosuna haftalık filtre eklenmeli",
            category: "idea",
            status: "open",
            priority: "normal",
          },
        ],
      },
    },
  });

  // 3. Düğün Pusulası
  await prisma.project.create({
    data: {
      userId: user.id,
      name: "Düğün Pusulası",
      description: "Evlilik ve organizasyon planlama rehberi platformu.",
      status: "active",
      icon: "heart",
      color: "#f43f5e",
      url: "https://dugunpusulasi.com",
      priority: "normal",
      notes: {
        create: [
          {
            userId: user.id,
            content: "Mekan filtrelerine açık hava seçeneği eklensin",
            category: "idea",
            status: "open",
            priority: "normal",
          },
        ],
      },
    },
  });

  // 4. HafifSepet
  await prisma.project.create({
    data: {
      userId: user.id,
      name: "HafifSepet",
      description: "Hızlı e-ticaret ve sepet yönetim aracı.",
      status: "active",
      icon: "shopping-cart",
      color: "#8b5cf6",
      url: "https://hafifsepet.com",
      priority: "normal",
      tags: {
        create: [{ tagId: createdTags["E-Ticaret"] }],
      },
      notes: {
        create: [
          {
            userId: user.id,
            content: "Ürün filtrelerinde performans kontrolü",
            category: "issue",
            status: "open",
            priority: "normal",
          },
          {
            userId: user.id,
            content: "Ürün arama sonuçları daha sade gösterilmeli",
            category: "improvement",
            status: "open",
            priority: "normal",
          },
        ],
      },
    },
  });

  // 5. AI Influencer Panel
  await prisma.project.create({
    data: {
      userId: user.id,
      name: "AI Influencer Panel",
      description: "Yapay zeka içerik üretici ve sanal influencer yönetim sistemi.",
      status: "active",
      icon: "sparkles",
      color: "#6366f1",
      url: "https://ai-influencer.local",
      priority: "high",
      tags: {
        create: [{ tagId: createdTags["Yapay Zeka"] }],
      },
      notes: {
        create: [
          {
            userId: user.id,
            content: "Yeni karakter oluşturma adımları daha anlaşılır olmalı",
            category: "idea",
            status: "open",
            priority: "normal",
          },
        ],
      },
    },
  });

  console.log("Örnek projeler ve notlar başarıyla eklendi.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
