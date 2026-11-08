# Proje Notları – Kişisel Proje, Fikir ve Eksik Takip Sistemi

Modern, minimal, mobil uyumlu, PWA destekli ve son derece hızlı bir SaaS proje & not yönetim sistemi.

Aynı anda çok sayıda yazılım projesi, web sitesi ve iş fikri üzerinde çalışan geliştiriciler ve kurucular için tasarlanmıştır.

---

## 🚀 Öne Çıkan Özellikler

1. **Yıldırım Hızında Hızlı Not Ekleme (5–10 Saniye)**:
   - Uygulama açıldığında ilk görülen alan not ekleme kartıdır.
   - Son seçilen projeyi otomatik hatırlar.
   - `Ctrl+Enter` veya `Cmd+Enter` klavye kısayoluyla anında kaydeder.
   - **Otomatik Taslak Koruma:** Kullanıcı not yazarken sayfa kapansa veya bağlantı kopsa bile yazılan metin `localStorage` üzerinde saklanır, veri kaybı yaşanmaz.

2. **Kategoriler ve Öncelikler**:
   - 💡 **Yeni Fikir** (`idea`)
   - ⚠️ **Eksik** (`issue`)
   - 🐞 **Hata** (`bug`)
   - ⚙️ **İyileştirme / Özellik** (`improvement`)
   - 📝 **Genel Not** (`general` - varsayılan)
   - Öncelik seviyeleri (Düşük, Normal, Yüksek 🔥).

3. **Göz Alıcı ve Minimal SaaS Tasarımı**:
   - Açık renkli, yumuşak gölgeli, modern Lucide ikonlu arayüz.
   - Masaüstünde sabit sol menü ve geniş çalışma alanı.
   - Mobilde tek elle kullanıma uygun, alt gezinme çubuğu ve yüzen hızlı işlem butonu (+).

4. **Kapsamlı Proje Yönetimi ve Güvenli Kasa**:
   - **Hızlı Oluşturma:** Sadece isim girerek tek tıkla proje oluşturma.
   - **Çoklu Bağlantılar:** Canlı Site, Yönetim Paneli, GitHub, Coolify, API Dokümantasyonu vb. bağlantıları saklama ve tek tıkla kopyalama/açma.
   - **AES-256-GCM Şifreli Kasa:** Proje giriş bilgileri ve API anahtarları veritabanında AES-256-GCM ile şifrelenir. Güvenli olmayan ortamlarda veya varsayılan dışa aktarmalarda asla düz metin olarak sızmaz.

5. **Global Arama (`Ctrl+K` / `⌘K`)**:
   - Türkçe karakter duyarlı (`İ/i`, `I/ı`, `Ğ/ğ`, `Ü/ü`, `Ş/ş`, `Ö/ö`) hızlı arama.
   - Proje adlarında, açıklamalarda, etiketlerde ve not metinlerinde anında sonuç.

6. **Geri Alınabilir Çöp Kutusu (Soft Delete)**:
   - Silinen notlar yanlışlıkla kaybolmaz; çöp kutusuna taşınır.
   - Silme anında tek tıkla "Geri Al" (Undo) bildirimi gösterilir.
   - İstenirse çöp kutusu tek tıkla kalıcı olarak boşaltılabilir.

7. **Veri Yedekleme, Dışa ve İçe Aktarma**:
   - **JSON Yedekleme:** Tüm projeleri, bağlantıları ve notları yapılandırılmış JSON olarak indirme.
   - **CSV Dışa Aktarma:** Notları Excel ve Google E-Tablolar için CSV olarak indirme.
   - **JSON İçe Aktarma:** Yedek dosyasını mevcut verileri ezmeden güvenle geri yükleme ve birleştirme.

8. **PWA (Progressive Web App) Desteği**:
   - Telefonda (iOS Safari / Android Chrome) "Ana Ekrana Ekle" seçeneğiyle yerel bir uygulama gibi açılır.

---

## 🛠️ Teknoloji Yığını

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Stil & Arayüz:** Tailwind CSS + Lucide Icons
- **Veritabanı & ORM:** Prisma ORM (SQLite varsayılan + PostgreSQL hazır)
- **Güvenlik & Oturum:** HTTP-Only JWT Session Cookie (`jose`), `bcryptjs`, AES-256-GCM Kasa Şifreleme
- **Konteyner & Dağıtım:** Docker (Multi-stage), Docker Compose, Coolify Uyumlu

---

## 💻 Yerel Geliştirme Kurulumu

Projeyi yerel bilgisayarınızda çalıştırmak için:

```bash
# Bağımlılıkları yükleyin
npm install

# Veritabanını oluşturun ve şemayı eşitleyin
npx prisma db push

# Örnek demo verilerini yükleyin (WhatsApp SaaS, Durbasma vb.)
npm run prisma:seed
# veya
npx tsx prisma/seed.ts

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

### Demo Kullanıcı Bilgileri
- **E-posta:** `demo@projenotlar.com`
- **Şifre:** `demo1234`
- *(Veya giriş ekranındaki "⚡ Demo Hesabı ile Hızlı Giriş Yap" butonuna basarak anında girebilirsiniz)*

---

## 🐳 Coolify ve VPS Dağıtımı

Uygulama Coolify veya herhangi bir Docker destekli VPS üzerinde bağımsız bir servis olarak çalışacak biçimde optimize edilmiştir.

### Yöntem A: Coolify ile Otomatik Dağıtım

1. Coolify kontrol panelinizde **+ New Resource** > **Public / Private Git Repository** seçin.
2. Bu projenin Git reposunu bağlayın.
3. Build Pack olarak **Dockerfile** seçin.
4. Coolify Ortam Değişkenleri (Environment Variables) sekmesine şunları ekleyin:
   ```env
   NODE_ENV=production
   DATABASE_URL=file:/app/data/prod.db
   JWT_SECRET=uretimde_guclu_ve_rastgele_bir_jwt_anahtari_girin
   VAULT_SECRET_KEY=32_karakterli_guclu_kasa_sifreleme_anahtari!
   NEXT_PUBLIC_APP_URL=https://notlar.siteniz.com
   ```
5. **Persistent Storage (Kalıcı Disk)** ekleyin:
   - **Mount Path:** `/app/data` (Veritabanının konteyner yeniden başlasa da korunması için).
6. **Healthcheck Port:** `3000` / **Path:** `/api/health`.
7. **Deploy** butonuna tıklayın.

### Yöntem B: Docker Compose ile VPS Dağıtımı

```bash
# Proje dizininde docker-compose ile başlatın:
docker compose up -d --build
```

Konteyner otomatik olarak başlatılacak, sağlık kontrolü yapacak ve verileri `proje_notlar_data` volume'ünde kalıcı olarak saklayacaktır.

---

## ⌨️ Klavye Kısayolları

| Kısayol | İşlev |
| :--- | :--- |
| `Ctrl + Enter` / `⌘ + Enter` | Hızlı notu anında kaydeder |
| `Ctrl + K` / `⌘ + K` | Global arama penceresini açar |
| `ESC` | Arama penceresini veya açık modalı kapatır |

---

## 🔒 Güvenlik Standartları

- **AES-256-GCM:** Proje giriş parolaları simetrik şifreleme ve kimlik doğrulama etiketiyle korunur.
- **Güvenli Dışa Aktarma:** Yedek alırken parolalar varsayılan olarak JSON/CSV dosyalarına eklenmez; kullanıcı özellikle talep ederse şifre çözülerek dahil edilir.
- **Kullanıcı İzolasyonu:** Her kullanıcının projeleri ve notları diğer hesaplardan tamamen yalıtılmıştır. Yetkisiz API erişimleri `401 Unauthorized` ile engellenir.
