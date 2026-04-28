import { create } from 'zustand';

export enum UserRole {
  ADMIN = 'admin',
  KASIR = 'kasir'
}

interface User {
  username: string;
  role: UserRole;
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

export interface Barang {
  kode: string;
  nama: string;
  kategori: string;
  satuan: string;
  harga_modal: number;
  harga_jual: number;
  stok_awal: number;
  stok_minimal: number;
  created_at: string;
}

export interface Transaksi {
  id: string;
  tipe: 'IN' | 'OUT';
  kode_barang: string;
  jumlah: number;
  harga: number;
  total: number;
  tanggal: string;
  user: string;
}
