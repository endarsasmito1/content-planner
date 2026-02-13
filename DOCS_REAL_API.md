# 🔌 Panduan Integrasi Real API (Social Media)

Saat ini aplikasi menggunakan **Simulasi Data** untuk memudahkan development dan testing tanpa perlu izin rumit. Jika ingin menggunakan data **Real-Time** (Live) dari Instagram, YouTube, dll, berikut adalah langkah-langkah teknis yang harus dilakukan.

---

## 📸 1. Instagram & Facebook (via Meta Graph API)

Untuk mengambil data views/likes dari Instagram, Anda tidak bisa sekadar *scraping*. Anda harus menggunakan **Official API** dengan izin user (OAuth).

### 🛠 Langkah Persiapan:
1.  Masuk ke [Meta for Developers](https://developers.facebook.com/).
2.  Buat Aplikasi baru (Type: Business).
3.  Tambahkan produk **Instagram Graph API**.
4.  Di bagian *Settings* -> *Basic*, dapatkan **App ID** dan **App Secret**.

### 🔄 Alur Integrasi (Coding):
1.  **OAuth Login**:
    *   Frontend mengarahkan user ke URL login Facebook:
        ```
        https://www.facebook.com/v17.0/dialog/oauth?client_id={APP_ID}&redirect_uri={CALLBACK_URL}&scope=instagram_basic,pages_show_list
        ```
2.  **Dapatkan Token**:
    *   Setelah user login, Facebook akan redirect ke `CALLBACK_URL` dengan membawa `code`.
    *   Backend menukar `code` tersebut dengan **Access Token**.
3.  **Simpan Token**:
    *   Simpan `access_token` ini di tabel `SocialAccounts` di database.
4.  **Tarik Data (Report)**:
    *   Gunakan token untuk request ke API:
        ```http
        GET https://graph.facebook.com/v17.0/{media_id}?fields=like_count,comments_count,media_product_type,media_url&access_token={YOUR_TOKEN}
        ```

---

## ▶️ 2. YouTube (via YouTube Data API v3)

YouTube lebih mudah karena bisa menggunakan **API Key** saja untuk data publik (seperti jumlah views video publik), tapi lebih aman menggunakan OAuth jika ingin data private.

### 🛠 Langkah Persiapan:
1.  Masuk ke [Google Cloud Console](https://console.cloud.google.com/).
2.  Buat Project baru -> Enable **YouTube Data API v3**.
3.  Buat **API Key** di menu Credentials.

### 🔄 Alur Integrasi (Coding):
1.  **Extract Video ID**:
    *   Ambil ID dari link yang diinput user (misal: `youtube.com/watch?v=dQw4w9WgXcQ` -> ID: `dQw4w9WgXcQ`).
2.  **Request Data**:
    *   Panggil API Google secara langsung (bisa dari Backend atau Frontend):
        ```http
        GET https://www.googleapis.com/youtube/v3/videos?part=statistics&id={VIDEO_ID}&key={YOUR_API_KEY}
        ```
3.  **Response**:
    *   API akan mengembalikan JSON berisi `viewCount`, `likeCount`, `commentCount`.

---

## 🎵 3. TikTok (TikTok Display API)

TikTok juga memerlukan proses OAuth yang mirip dengan Instagram.

1.  Daftar di [TikTok for Developers](https://developers.tiktok.com/).
2.  Gunakan **Display API** untuk mendapatkan data dasar video.
3.  Flow: User Login -> Get Access Token -> Query `/video/list/`.

---

## 💻 Apa yang Perlu Diubah di Code Kita?

Jika ingin menerapkan ini, kita perlu memodifikasi struktur code saat ini:

1.  **Database (`models/SocialAccount.js`)**:
    *   Tambah kolom: `accessToken` (Text), `refreshToken` (Text), `platformUserId` (String).
2.  **Backend Routes**:
    *   Buat endpoint Auth, misal: `router.get('/auth/instagram', ...)` untuk menangani proses login dan penyimpanan token.
3.  **Frontend (`InputAkun.jsx`)**:
    *   Ganti tombol "Tambah Akun Manual" menjadi tombol "Connect with Instagram / YouTube".
4.  **Sync Logic (`ContentReport.jsx`)**:
    *   Ubah fungsi `handleSync` yang sekarang (random math) menjadi fungsi `fetch` yang memanggil endpoint backend masing-masing platform.

---

> **Catatan**: Untuk proyek portofolio atau demo internal, metode **Data Simulation/Sync** (yang sekarang kita pakai) adalah standar industri yang valid, karena proses Development Approval dari Meta/TikTok bisa memakan waktu berminggu-minggu.
