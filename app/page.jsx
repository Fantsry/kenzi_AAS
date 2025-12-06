import Link from "next/link";
import { BookOpen, Users, Clock, Shield, Search, CheckCircle } from "lucide-react";

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">Perpustakaan Digital</p>
                <p className="text-xs text-gray-500">Sistem Peminjaman Modern</p>
              </div>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/registration"
                className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
              >
                Daftar Sekarang
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              Kelola Perpustakaan Anda
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Dengan Mudah & Cepat
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Platform digital terpercaya untuk mengelola koleksi buku, peminjaman, dan pengguna. 
              Solusi lengkap untuk perpustakaan modern.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/registration"
                className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
              >
                Mulai Gratis Sekarang
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all"
              >
                Masuk ke Akun
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              ✨ Tidak perlu kartu kredit • Setup dalam hitungan menit
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Mengapa Pilih Kami?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Fitur-fitur unggulan yang membuat perpustakaan Anda lebih efisien
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all bg-gradient-to-br from-white to-indigo-50/30">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pencarian Cepat</h3>
              <p className="text-gray-600">
                Temukan buku yang Anda cari dengan mudah menggunakan fitur pencarian yang canggih dan intuitif.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all bg-gradient-to-br from-white to-purple-50/30">
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Manajemen Waktu</h3>
              <p className="text-gray-600">
                Pantau tanggal peminjaman dan pengembalian dengan sistem notifikasi otomatis yang terintegrasi.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all bg-gradient-to-br from-white to-indigo-50/30">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Manajemen Pengguna</h3>
              <p className="text-gray-600">
                Kelola anggota perpustakaan dengan mudah, lihat riwayat peminjaman dan aktivitas mereka.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all bg-gradient-to-br from-white to-purple-50/30">
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Keamanan Terjamin</h3>
              <p className="text-gray-600">
                Data Anda aman dengan sistem autentikasi modern dan enkripsi password yang kuat.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all bg-gradient-to-br from-white to-indigo-50/30">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Katalog Lengkap</h3>
              <p className="text-gray-600">
                Kelola ribuan buku dengan informasi lengkap seperti judul, penulis, ISBN, dan stok tersedia.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all bg-gradient-to-br from-white to-purple-50/30">
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mudah Digunakan</h3>
              <p className="text-gray-600">
                Interface yang ramah pengguna, tidak perlu pelatihan khusus untuk mulai menggunakan sistem ini.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Siap Memulai?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Bergabunglah dengan ratusan perpustakaan yang sudah mempercayai sistem kami
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/registration"
              className="px-8 py-4 text-lg font-semibold text-indigo-600 bg-white rounded-xl hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              Buat Akun Gratis
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white/10 transition-all"
            >
              Masuk ke Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                  <BookOpen className="h-5 w-5" />
                </div>
                <p className="text-white font-bold">Perpustakaan Digital</p>
              </div>
              <p className="text-sm">
                Platform modern untuk mengelola perpustakaan dengan efisien dan mudah.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Tautan Cepat</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Masuk
                  </Link>
                </li>
                <li>
                  <Link href="/registration" className="hover:text-white transition-colors">
                    Daftar
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Kontak</h3>
              <p className="text-sm">
                Dibuat dengan Next.js, NextAuth, dan MySQL
              </p>
              <p className="text-sm mt-2">
                © 2024 Perpustakaan Digital. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
