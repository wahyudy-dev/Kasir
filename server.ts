import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory "Database" for simulation
  let db_barang = [
    { kode: "B001", nama: "Beras 5kg", kategori: "Sembako", satuan: "Pcs", harga_modal: 60000, harga_jual: 65000, stok_awal: 20, stok_minimal: 5, created_at: new Date().toISOString() },
    { kode: "B002", nama: "Minyak Goreng 2L", kategori: "Sembako", satuan: "Pcs", harga_modal: 32000, harga_jual: 35000, stok_awal: 15, stok_minimal: 3, created_at: new Date().toISOString() },
    { kode: "B003", nama: "Gula Pasir 1kg", kategori: "Sembako", satuan: "Pcs", harga_modal: 14000, harga_jual: 16000, stok_awal: 50, stok_minimal: 10, created_at: new Date().toISOString() },
  ];

  let db_transaksi: any[] = [];

  // API Routes
  app.get("/api/barang", (req, res) => {
    res.json(db_barang);
  });

  app.post("/api/barang", (req, res) => {
    const novel = req.body;
    db_barang.push({ ...novel, created_at: new Date().toISOString() });
    res.json({ success: true });
  });

  app.get("/api/transaksi", (req, res) => {
    res.json(db_transaksi);
  });

  app.post("/api/transaksi", (req, res) => {
    const trx = req.body;
    const id = "TRX-" + Date.now();
    db_transaksi.push({ ...trx, id, tanggal: new Date().toISOString() });
    res.json({ success: true, id });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
