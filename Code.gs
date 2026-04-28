/**
 * Google Apps Script - Backend for Sales & Inventory System
 * Copy code ini ke editor Apps Script Anda (script.google.com)
 */

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index');
}

/**
 * Setup Database: Membuat sheet yang diperlukan jika belum ada
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet Barang
  let sheetBarang = ss.getSheetByName("Barang");
  if (!sheetBarang) {
    sheetBarang = ss.insertSheet("Barang");
    sheetBarang.appendRow([
      "Kode Barang", "Nama Barang", "Kategori", "Satuan", "Harga Modal", "Harga Jual", "Stok Awal", "Stok Minimal", "Created At"
    ]);
    sheetBarang.getRange("A1:I1").setFontWeight("bold").setBackground("#f3f3f3");
  }

  // Sheet Transaksi (Masuk & Keluar)
  let sheetTransaksi = ss.getSheetByName("Transaksi");
  if (!sheetTransaksi) {
    sheetTransaksi = ss.insertSheet("Transaksi");
    sheetTransaksi.appendRow([
      "ID", "Tipe", "Kode Barang", "Jumlah", "Harga Satuan", "Total", "Tanggal", "User"
    ]);
    sheetTransaksi.getRange("A1:H1").setFontWeight("bold").setBackground("#f3f3f3");
  }

  return "Database Berhasil Disiapkan!";
}

/**
 * Fungsi API Pelengkap (Contoh dipanggil via google.script.run)
 */
function getBarang() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Barang");
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  return data.map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h.toLowerCase().replace(/ /g, "_")] = row[i]);
    return obj;
  });
}

function addBarang(item) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Barang");
  sheet.appendRow([
    item.kode, item.nama, item.kategori, item.satuan, item.harga_modal, item.harga_jual, item.stok_awal, item.stok_minimal, new Date()
  ]);
  return { success: true };
}

function catatTransaksi(trx) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetTrx = ss.getSheetByName("Transaksi");
  const id = "TRX-" + new Date().getTime();
  
  sheetTrx.appendRow([
    id, trx.tipe, trx.kode_barang, trx.jumlah, trx.harga, trx.total, new Date(), trx.user
  ]);
  
  return { success: true, id: id };
}
