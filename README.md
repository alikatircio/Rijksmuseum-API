# 🖼️ Rijksmuseum API Test Projesi

Bu proje, Rijksmuseum API’nin uç noktalarını test etmek için oluşturulmuş bir API test otomasyon projesidir. `Playwright`, `TypeScript`, `Zod` ve `Allure` kullanılarak yazılmıştır. Amaç; API'nin doğruluğunu, filtreleme, sayfalama, arama ve hata yönetimi gibi senaryolarda kontrol etmektir.

---

## 📦 Neler Test Ediliyor?

- [x] Farklı dillerde (`en`, `nl`) koleksiyon detaylarının kontrolü
- [x] Belirli sanatçılar için arama yapılabilmesi (`Van Gogh`, `Rembrandt`, `Vermeer`)
- [x] Yalnızca görsel içeren koleksiyonların filtrelenmesi (`imgonly`)
- [x] Şehre göre filtreleme (`place=Amsterdam`)
- [x] Sayfalama (`p` ve `ps` parametreleriyle)
- [x] Geçersiz endpoint’ler için 404 cevabı
- [x] Gelen JSON verilerinin şema doğrulaması (`zod` kullanılarak)
- [x] Test sonuçlarının Allure HTML raporuna aktarılması

---

## 🛠️ Gereksinimler

- [Node.js (v18+)](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- API anahtarı (Rijksmuseum Developer Portal'dan alınabilir)

---

## 🚀 Kurulum ve Çalıştırma

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/alikatircio/Rijksmuseum-API.git
cd Rijksmuseum-API
```

### 2. Bağımlılıkları Kurun

```bash
npm install
```

### 3. `.env` Dosyasını Oluşturun

Proje kök dizinine `.env` dosyasını oluşturun ve aşağıdaki içeriği ekleyin:

```env
BASE_URL=https://www.rijksmuseum.nl/api
RIJKSMUSEUM_API_KEY=your_api_key_here
```

API anahtarınızı buradan alabilirsiniz:  
🔗 https://www.rijksmuseum.nl/en/api/register

> ⚠️ Bu dosya sadece lokal kullanım içindir ve versiyon kontrolüne dahil edilmemelidir.

---

## ✅ Testleri Çalıştırmak

Tüm testleri çalıştırmak için aşağıdaki komutu kullanın:

```bash
npx playwright test
```

veya

```bash
npm test
```

---

## 📊 Allure Raporu Oluşturmak

Aşağıdaki komutla Allure HTML raporu oluşturulup tarayıcıda açılır:

```bash
npm run report
```

Bu komut:

- `allure-results` klasöründen `allure-report` klasörünü oluşturur
- `allure open` komutuyla raporu tarayıcıda açar

Eğer sadece raporu tekrar görüntülemek isterseniz:

```bash
npx allure open allure-report
```

---

## 🌐 GitHub Actions ile Otomasyon

Proje GitHub Actions ile entegredir:

- Her `main` branch push veya pull request'te testler otomatik olarak çalışır
- Başarılı test sonrası Allure HTML raporu otomatik olarak `gh-pages` branch'ine deploy edilir
- Rapor GitHub Pages üzerinden yayınlanır

🔗 Canlı HTML raporu:  
https://alikatircio.github.io/Rijksmuseum-API/

> ❗ Deploy işlemi için `gh-pages` branch’i otomatik oluşturulur. Allure raporu doğru şekilde oluşmuyorsa, `allure-results` klasörünün içerik ürettiğinden emin olun.

---

## 📁 Dosya Yapısı

```bash
Rijksmuseum-API/
├── tests/                   # Test senaryoları
├── schema/                  # Zod şema tanımlamaları
├── utils/                   # API client fonksiyonu
├── .github/workflows/       # GitHub Actions tanımı
├── .env                     # API anahtarını içerir (lokal kullanım)
├── allure-results/          # Test çıktıları
├── allure-report/           # HTML raporu (otomatik oluşturulur)
├── package.json             # Komutlar ve bağımlılıklar
└── README.md
```

---

## 🤝 Katkı Sağlamak

Katkıda bulunmak isterseniz:

- Forklayın
- Branch oluşturun
- Geliştirme yapın
- Pull Request gönderin 🚀

---

## 📜 Lisans

MIT Lisansı altında yayınlanmıştır. Detaylar için `LICENSE` dosyasına bakabilirsiniz.
