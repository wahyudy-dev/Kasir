# Petunjuk Penggunaan Sistem Kasir & Inventory

Aplikasi ini dirancang untuk bekerja dengan Google Spreadsheet sebagai database melalui Google Apps Script.

## 1. Persiapan Google Spreadsheet
1.  Buka [Google Sheets](https://sheets.new) dan buat spreadsheet baru.
2.  Beri nama (misal: `Database Toko Saya`).
3.  Klik menu **Extensions** > **Apps Script**.

## 2. Setup Apps Script
1.  Hapus kode yang ada di editor Apps Script.
2.  Copy isi file `Code.gs` dari folder proyek ini ke editor Apps Script.
3.  Simpan proyek dengan nama `Backend Kasir`.
4.  Jalankan fungsi `setupDatabase` (Pilih fungsinya di toolbar, lalu klik **Run**). 
    *   *Catatan: Anda perlu memberikan izin akses ke spreadsheet saat dijalankan pertama kali.*
5.  Ini akan secara otomatis membuat sheet `Barang` dan `Transaksi`.

## 3. Deploy sebagai Web App
1.  Klik tombol **Deploy** > **New Deployment**.
2.  Pilih type: **Web App**.
3.  Description: `Versi 1`.
4.  Execute as: **Me**.
5.  Who has access: **Anyone** (Ini diperlukan agar aplikasi web bisa mengakses API).
6.  Klik **Deploy** dan copy **Web App URL** yang diberikan.

## 4. Menghubungkan ke Aplikasi Web
1.  Gunakan URL Web App tersebut di aplikasi frontend ini untuk melakukan panggilan API (Biasanya didefinisikan di variabel global atau environment).

---

## Akun Demo Default
- **Admin**:
  - Email: `admin`
  - Password: `admin123`
- **Kasir**:
  - Email: `kasir`
  - Password: `kasir123`
