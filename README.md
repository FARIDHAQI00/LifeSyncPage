# LifeSync — Landing Page

Situs statis untuk publikasi & unduhan aplikasi **LifeSync**. Tanpa framework, tanpa
build step. Ditujukan untuk deploy ke Vercel.

- **Android:** tombol "Unduh APK" (arahkan ke GitHub Releases atau file APK).
- **iOS:** ditandai "segera hadir" sampai TestFlight/App Store siap.

---

## Struktur

```
index.html        Halaman utama (hero, fitur, presensi, bento, timer, AI, harga, FAQ, CTA)
privacy.html      Kebijakan Privasi (disalin dari aplikasi)
terms.html        Syarat Layanan (disalin dari aplikasi)
styles.css        Semua styling: design token, komponen, responsive, reduced-motion
script.js         GSAP scroll choreography, nav, accordion, toggle harga, linker
vercel.json       Clean URLs + cache & security headers
assets/
  app-icon.png             ikon aplikasi (dipakai di nav, footer, favicon)
  app-icon-foreground.png  cadangan ikon
  fonts/
    plus-jakarta-sans-latin.woff2   font brand (variable, 200–800)
    phosphor.woff2                  ikon Phosphor (subset)
```

---

## 1. Yang WAJIB diisi sebelum go-live

Buka `script.js` dan isi objek `LINKS` di bagian paling atas:

```js
const LINKS = {
  apk: "",          // URL langsung berkas .apk
  play: "",         // URL listing Google Play
  testflight: "",   // URL TestFlight publik
  privacy: "",      // (opsional) URL lain untuk kebijakan privasi
  terms: "",        // (opsional) URL lain untuk syarat layanan
};
```

Selama `apk` masih kosong:

- semua tombol "Unduh APK" menggulir ke bagian `#unduh` dan menampilkan catatan
  kecil "Tautan unduhan sedang disiapkan";
- tautan Google Play / TestFlight memunculkan toast "belum dipublikasikan".

Setelah diisi, tombol otomatis memakai URL tersebut, membuka tab baru, dan catatan
peringatan hilang. Tidak ada perubahan lain yang diperlukan.

### URL APK yang disarankan (GitHub Releases)

```
https://github.com/USER/REPO/releases/latest/download/lifesync.apk
```

URL ini selalu menunjuk aset pada rilis terbaru. Repo harus publik.

---

## 2. Deploy ke Vercel

1. Push repo ini ke GitHub (`FARIDHAQI00/LifeSyncPage`).
2. Vercel → **Add New → Project** → import repo.
3. Framework Preset: **Other**. Build Command: kosong. Output Directory: kosong.
4. Deploy. Situs langsung jalan (statis, tanpa build).

Atau lewat CLI:

```bash
npx vercel --prod
```

---

## 3. Pratinjau lokal

Karena halaman memakai `fetch`-free static assets, cukup buka `index.html`
di peramban. Untuk hasil paling akurat (font & inline script), jalankan server
statis kecil:

```bash
npx serve .
# atau
python -m http.server 5173
```

---

## 4. Catatan desain

- **Referensi gaya:** landing app yang terang dan lapang — kanvas krem/lavender,
  heading di tengah, kartu bersudut lembut, mockup perangkat, bento fitur,
  carousel, harga 3 tingkat, band CTA bergradasi, FAQ berbentuk grid kartu,
  footer gelap.
- **Palet:** hitam (teks + footer + band CTA) · kuning lime brand `#D4F63D`
  (tombol utama, badge, garis gauge) · ungu `#8B1484` (aksen sekunder, kartu
  unggulan, tautan, ikon fitur).
- **Tema:** terang dan dikunci (mengikuti permukaan utama aplikasi). Tidak ada
  section yang membalik tema; band gelap dipakai sengaja sebagai jeda irama.
- **Skala sudut:** kartu 20px · tile 14px · tombol/pill 999px · bodi ponsel 46px.
- **Kontras:** tombol lime selalu berteks hitam; teks aksen memakai ungu
  (`#8B1484`) agar lolos WCAG AA di atas kanvas terang.
- **Gerak:** hanya `transform`/`opacity`, memakai GSAP ScrollTrigger (tanpa scroll
  listener manual). Semua animasi berhenti di bawah `prefers-reduced-motion`.
- **Ikon:** Phosphor Icons (subset resmi, self-host). Tidak ada emoji.
- **Font:** Plus Jakarta Sans, self-host (tidak memuat Google Fonts saat runtime).

## 5. Todo opsional

- [ ] Ganti mockup ponsel dengan tangkapan layar asli bila tersedia
      (`assets/` → ubah komponen `.phone__screen` di `index.html`).
- [ ] Tambahkan URL Google Play & TestFlight di `LINKS`.
- [ ] Tambahkan gambar OG 1200×630 khusus (`og:image` sekarang memakai ikon aplikasi).
- [ ] Sinkronkan tanggal "Terakhir diperbarui" di `privacy.html` / `terms.html`
      bila dokumen legal di aplikasi ikut berubah.
