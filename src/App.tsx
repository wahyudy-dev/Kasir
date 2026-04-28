/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight, 
  History, 
  LogOut, 
  Plus, 
  Search, 
  AlertTriangle, 
  DollarSign,
  ShoppingCart,
  Menu,
  X
} from 'lucide-react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useLocation, 
  useNavigate
} from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore, UserRole, Barang, Transaksi } from './types';
import { format } from 'date-fns';

// --- Components ---

const Navbar = () => {
  const { user, logout } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Daftar Barang', icon: Package, path: '/barang' },
    { name: 'Restok', icon: ArrowUpRight, path: '/masuk' },
    { name: 'Kasir', icon: ShoppingCart, path: '/keluar' },
    { name: 'Laporan', icon: History, path: '/laporan' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">SmartKasir</span>
            </div>
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-gray-900">{user?.username}</span>
              <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Dashboard = ({ barang, transaksi }: { barang: Barang[], transaksi: Transaksi[] }) => {
  const currentMonthTransactions = useMemo(() => {
    const now = new Date();
    return transaksi.filter(t => {
      const d = new Date(t.tanggal);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [transaksi]);

  const totalPenjualan = currentMonthTransactions
    .filter(t => t.tipe === 'OUT')
    .reduce((acc, curr) => acc + curr.total, 0);

  const totalModal = currentMonthTransactions
    .filter(t => t.tipe === 'IN')
    .reduce((acc, curr) => acc + curr.total, 0);

  const lowStockCount = barang.filter(b => {
    const stokCurrent = (b.stok_awal || 0) + 
      transaksi.filter(t => t.kode_barang === b.kode && t.tipe === 'IN').reduce((a, c) => a + c.jumlah, 0) -
      transaksi.filter(t => t.kode_barang === b.kode && t.tipe === 'OUT').reduce((a, c) => a + c.jumlah, 0);
    return stokCurrent <= b.stok_minimal;
  }).length;

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return format(d, 'dd MMM');
    });

    return last7Days.map(dayStr => {
      const dayTrx = transaksi.filter(t => format(new Date(t.tanggal), 'dd MMM') === dayStr);
      return {
        name: dayStr,
        penjualan: dayTrx.filter(t => t.tipe === 'OUT').reduce((a, c) => a + c.total, 0),
      };
    });
  }, [transaksi]);

  const stats = [
    { title: 'Omset Bulan Ini', value: `Rp ${totalPenjualan.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Restok', value: `Rp ${totalModal.toLocaleString()}`, icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Produk', value: barang.length, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Stok Menipis', value: lowStockCount, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.title}
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4"
          >
            <div className={`${stat.bg} p-3 rounded-lg`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Grafik Penjualan 7 Hari Terakhir</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(val) => `Rp ${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number) => [`Rp ${val.toLocaleString()}`, '']}
                />
                <Line type="monotone" dataKey="penjualan" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Peringatan Stok</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {barang.filter(b => {
              const stok = (b.stok_awal || 0) + 
                transaksi.filter(t => t.kode_barang === b.kode && t.tipe === 'IN').reduce((a, c) => a + c.jumlah, 0) -
                transaksi.filter(t => t.kode_barang === b.kode && t.tipe === 'OUT').reduce((a, c) => a + c.jumlah, 0);
              return stok <= b.stok_minimal;
            }).map((b) => (
              <div key={b.kode} className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{b.nama}</p>
                  <p className="text-xs text-gray-500">{b.kode}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-600">
                    Sisa {(b.stok_awal || 0) + 
                      transaksi.filter(t => t.kode_barang === b.kode && t.tipe === 'IN').reduce((a, c) => a + c.jumlah, 0) -
                      transaksi.filter(t => t.kode_barang === b.kode && t.tipe === 'OUT').reduce((a, c) => a + c.jumlah, 0)
                    }
                  </p>
                </div>
              </div>
            ))}
            {lowStockCount === 0 && <p className="text-gray-400 text-center py-8">Semua stok aman</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const InventoryList = ({ barang, transaksi, onUpdate }: { barang: Barang[], transaksi: Transaksi[], onUpdate: () => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { user } = useAppStore();
  
  const filteredBarang = barang.filter(b => 
    b.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.kode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateStock = (kode: string, awal: number) => {
    const inSum = transaksi.filter(t => t.kode_barang === kode && t.tipe === 'IN').reduce((a, c) => a + c.jumlah, 0);
    const outSum = transaksi.filter(t => t.kode_barang === kode && t.tipe === 'OUT').reduce((a, c) => a + c.jumlah, 0);
    return awal + inSum - outSum;
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem = {
      kode: formData.get('kode') as string,
      nama: formData.get('nama') as string,
      kategori: formData.get('kategori') as string,
      satuan: formData.get('satuan') as string,
      harga_modal: Number(formData.get('harga_modal')),
      harga_jual: Number(formData.get('harga_jual')),
      stok_awal: Number(formData.get('stok_awal')),
      stok_minimal: Number(formData.get('stok_minimal')),
    };

    const res = await fetch('/api/barang', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    if (res.ok) {
      setShowModal(false);
      onUpdate();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Daftar Barang</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari..."
              className="pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-64 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {user?.role === UserRole.ADMIN && (
            <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold">
              Tambah
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Nama</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4 text-right">Modal</th>
              <th className="px-6 py-4 text-right">Jual</th>
              <th className="px-6 py-4 text-center">Stok</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 italic">
            {filteredBarang.map((b) => (
              <tr key={b.kode} className="hover:bg-gray-50 uppercase not-italic">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{b.nama}</div>
                  <div className="text-xs text-gray-500">{b.kode}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold">{b.kategori}</span>
                </td>
                <td className="px-6 py-4 text-right">Rp {b.harga_modal.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-green-600 font-bold">Rp {b.harga_jual.toLocaleString()}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`font-bold ${calculateStock(b.kode, b.stok_awal) <= b.stok_minimal ? 'text-red-500' : ''}`}>
                    {calculateStock(b.kode, b.stok_awal)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
              <h3 className="text-lg font-bold mb-4">Tambah Barang Baru</h3>
              <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
                <input name="kode" required className="col-span-2 p-2 border border-gray-200 rounded-lg outline-none" placeholder="Kode Barang" />
                <input name="nama" required className="col-span-2 p-2 border border-gray-200 rounded-lg outline-none" placeholder="Nama Barang" />
                <input name="kategori" required className="p-2 border border-gray-200 rounded-lg" placeholder="Kategori" />
                <input name="satuan" required className="p-2 border border-gray-200 rounded-lg" placeholder="Satuan (Pcs/Kg)" />
                <input name="harga_modal" type="number" required className="p-2 border border-gray-200 rounded-lg" placeholder="H. Modal" />
                <input name="harga_jual" type="number" required className="p-2 border border-gray-200 rounded-lg" placeholder="H. Jual" />
                <input name="stok_awal" type="number" required className="p-2 border border-gray-200 rounded-lg" placeholder="Stok Awal" />
                <input name="stok_minimal" type="number" required className="p-2 border border-gray-200 rounded-lg" placeholder="Stok Reorder" />
                <button type="submit" className="col-span-2 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">Simpan Barang</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TransactionForm = ({ barang, type, onUpdate }: { barang: Barang[], type: 'IN' | 'OUT', onUpdate: () => void }) => {
  const [selectedKode, setSelectedKode] = useState('');
  const [jumlah, setJumlah] = useState(1);
  const { user } = useAppStore();

  const selectedBarang = barang.find(b => b.kode === selectedKode);
  const total = (selectedBarang ? (type === 'IN' ? selectedBarang.harga_modal : selectedBarang.harga_jual) : 0) * jumlah;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarang) return;
    const res = await fetch('/api/transaksi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipe: type, kode_barang: selectedKode, jumlah, harga: type === 'IN' ? selectedBarang.harga_modal : selectedBarang.harga_jual, total, user: user?.username }),
    });
    if (res.ok) {
      setSelectedKode('');
      setJumlah(1);
      onUpdate();
      alert('Transaksi berhasil!');
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className={`p-6 ${type === 'IN' ? 'bg-blue-600' : 'bg-green-600'} text-white`}>
        <h2 className="text-xl font-bold">{type === 'IN' ? 'Barang Masuk (Restok)' : 'Kasir Panjualan'}</h2>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <select value={selectedKode} onChange={(e) => setSelectedKode(e.target.value)} required className="w-full p-3 border border-gray-200 rounded-lg">
          <option value="">-- Pilih Barang --</option>
          {barang.map(b => <option key={b.kode} value={b.kode}>{b.nama}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-4">
          <input type="number" value={jumlah} onChange={(e) => setJumlah(Number(e.target.value))} className="p-3 border border-gray-200 rounded-lg" placeholder="Jumlah" min="1" required />
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg font-bold text-center">Rp {total.toLocaleString()}</div>
        </div>
        <button type="submit" disabled={!selectedKode} className={`w-full py-3 text-white font-bold rounded-lg shadow-md ${type === 'IN' ? 'bg-blue-600' : 'bg-green-600'}`}>SIMPAN</button>
      </form>
    </div>
  );
};

const ReportPage = ({ transaksi, barang }: { transaksi: Transaksi[], barang: Barang[] }) => {
  const [filter, setFilter] = useState('daily');
  const filtered = transaksi.filter(t => {
    const d = new Date(t.tanggal);
    if (filter === 'daily') return format(d, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    return true;
  });

  const totalOmset = filtered.filter(t => t.tipe === 'OUT').reduce((a, c) => a + c.total, 0);
  const totalModalRelatif = filtered.filter(t => t.tipe === 'OUT').reduce((acc, t) => {
    const b = barang.find(item => item.kode === t.kode_barang);
    return acc + ((b?.harga_modal || 0) * t.jumlah);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-600 text-white p-6 rounded-2xl">
          <div className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Laba Bersih Hari Ini</div>
          <div className="text-2xl font-black">Rp {(totalOmset - totalModalRelatif).toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Transaksi</div>
          <div className="text-2xl font-black">{filtered.length}</div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto italic">
        <table className="w-full text-left not-italic">
          <thead className="bg-gray-50 text-gray-500 text-[10px] font-bold uppercase">
            <tr><th className="px-6 py-3">Waktu</th><th className="px-6 py-3">Produk</th><th className="px-6 py-3">Tipe</th><th className="px-6 py-3 text-right">Total</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 uppercase text-xs">
            {filtered.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-gray-400">{format(new Date(t.tanggal), 'HH:mm')}</td>
                <td className="px-6 py-3 font-bold">{barang.find(b => b.kode === t.kode_barang)?.nama || t.kode_barang}</td>
                <td className="px-6 py-3">
                   <span className={`px-2 py-0.5 rounded text-[8px] font-black ${t.tipe === 'IN' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>{t.tipe === 'IN' ? 'Masuk' : 'Keluar'}</span>
                </td>
                <td className="px-6 py-3 text-right font-bold">Rp {t.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useAppStore();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 uppercase italic">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm w-full bg-white p-8 rounded-3xl shadow-2xl space-y-6 not-italic">
        <div className="text-center">
            <div className="inline-block p-4 bg-blue-600 rounded-2xl text-white mb-4 shadow-lg shadow-blue-100"><ShoppingCart className="w-8 h-8" /></div>
            <h2 className="text-2xl font-black tracking-tight">KASIR PINTAR</h2>
            <p className="text-xs text-gray-400 font-bold tracking-widest mt-1">SISTEM MONITORING PENJUALAN</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (username === 'admin' && password === 'admin123') setUser({ username: 'Admin', role: UserRole.ADMIN }); else if (username === 'kasir' && password === 'kasir123') setUser({ username: 'Kasir', role: UserRole.KASIR }); else alert('Salah!'); }} className="space-y-4 uppercase text-[10px] font-bold tracking-widest text-gray-400">
           <div className="space-y-1">
             <label className="pl-1">Username</label>
             <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 normal-case" />
           </div>
           <div className="space-y-1">
             <label className="pl-1">Password</label>
             <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 normal-case" />
           </div>
           <button type="submit" className="w-full p-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:scale-[1.02] active:scale-[0.98] transition-all tracking-widest uppercase">Login Sistem</button>
        </form>
      </motion.div>
    </div>
  );
};

export default function App() {
  const { user } = useAppStore();
  const [barang, setBarang] = useState<Barang[]>([]);
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const bRes = await fetch('/api/barang');
      const tRes = await fetch('/api/transaksi');
      setBarang(await bRes.json());
      setTransaksi(await tRes.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (!user) return <Login />;
  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-blue-600">LOADING...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full p-6">
          <Routes>
            <Route path="/" element={<Dashboard barang={barang} transaksi={transaksi} />} />
            <Route path="/barang" element={<InventoryList barang={barang} transaksi={transaksi} onUpdate={fetchData} />} />
            <Route path="/masuk" element={<TransactionForm barang={barang} type="IN" onUpdate={fetchData} />} />
            <Route path="/keluar" element={<TransactionForm barang={barang} type="OUT" onUpdate={fetchData} />} />
            <Route path="/laporan" element={<ReportPage transaksi={transaksi} barang={barang} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
