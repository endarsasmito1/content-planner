# Content Planner App 🚀

Aplikasi **Content Planner** yang komprehensif untuk membantu konten kreator dan tim media sosial merencanakan, mengelola, dan melacak jadwal postingan mereka di berbagai platform (Instagram, Facebook, YouTube, TikTok, Twitter/X).

## ✨ Fitur Utama

### 1. 📊 Kanban Board
Visualisasikan alur kerja konten Anda dengan mudah menggunakan sistem papan Kanban.
*   **Drag-and-Drop**: Pindahkan kartu konten antar status (Draft -> Scripting -> Shooting -> Editing -> Ready -> Posted).
*   **Multi-Platform**: Buat satu ide konten dan assign ke banyak akun sosial media sekaligus.
*   **Quick Edit**: Klik kartu untuk mengedit detail atau melihat preview cepat.
*   **Status Tracking**: Indikator warna untuk overdue dan status penyelesaian.

### 2. 📅 Content Calendar
Lihat jadwal postingan Anda dalam tampilan kalender bulanan.
*   **Visual Schedule**: Lihat hari apa saja yang kosong atau padat postingan.
*   **Quick Add**: Tambahkan rencana konten baru langsung dari tanggal di kalender.
*   **Filter**: Navigasi mudah antar bulan dan tahun.

### 3. 📝 Content Planner (List View)
Tampilan tabel/grid mendetail untuk manajemen data yang lebih terstruktur.
*   **Filtering**: Filter berdasarkan Platform, Status, atau Rentang Tanggal.
*   **Pagination**: Navigasi data yang efisien.
*   **Detail View**: Kolom untuk Caption, Script, dan Resource Links.

### 4. 👥 Manajemen Akun (Input Akun)
Kelola semua akun media sosial Anda di satu tempat.
*   **Multi-Account Support**: Tambahkan akun Instagram, Facebook, YouTube, TikTok, dll.
*   **Platform Identity**: Ikon dan warna branding otomatis sesuai platform.

## 🛠️ Tech Stack

*   **Frontend**: React.js, Vite, Tailwind CSS (styled manually/custom CSS), `@hello-pangea/dnd` (Drag & Drop), `lucide-react` (Icons).
*   **Backend**: Node.js, Express.js.
*   **Database**: SQLite / MySQL / PostgreSQL (via Sequelize ORM).

---

## 🚀 Cara Menjalankan Aplikasi

### Prasyarat
*   Node.js terinstall di komputer Anda.

### 1. Setup Backend
Masuk ke folder backend, install dependency, dan jalankan server.

```bash
cd backend
npm install
npm run dev
```
*Server akan berjalan di port default (biasanya 5000).*

**Seed Data (Opsional)**
Jika ingin mengisi database dengan data dummy (akun & plan) untuk testing:
```bash
node seed.js
```

### 2. Setup Frontend
Buka terminal baru, masuk ke root folder proyek, install dependency, dan jalankan frontend.

```bash
# Pastikan Anda berada di root folder proyek
npm install
npm run dev
```
*Frontend akan berjalan di port default (biasanya 5173).*

---

## 📖 Panduan Penggunaan

1.  **Daftarkan Akun**:
    *   Buka halaman **Input Akun**.
    *   Tambahkan akun sosial media yang ingin dikelola (misal: @brand_ku di Instagram).

2.  **Buat Rencana Konten**:
    *   Bisa dari menu **Kanban**, **Calendar**, atau **Content Planner**.
    *   Klik **Add Task** / Tanda Tambah `+`.
    *   Isi Judul, Tanggal Posting, Caption, Script, dan **Pilih Akun** (bisa pilih banyak akun sekaligus).

3.  **Kelola Progress**:
    *   Buka **Kanban**.
    *   Geser kartu dari *Draft* ke *Scripting*, *Shooting*, dst. sesuai progress nyata.
    *   Saat geser ke *Posted*, Anda akan diminta memasukkan **Link Postingan** (URL) sebagai bukti tayang.

4.  **Monitoring**:
    *   Gunakan **Calendar** untuk memastikan konsistensi postingan bulanan.
    *   Cek **Content Planner** untuk melihat arsip konten yang sudah lalu.

---

## 🎨 Credits
Developed by **Antigravity** & **You**.
