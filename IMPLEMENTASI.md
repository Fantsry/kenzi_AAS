# Dokumentasi Implementasi Sistem Perpustakaan Digital

## Struktur Folder

```
kenzi_AAS/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.js    # NextAuth configuration
│   │   ├── books/
│   │   │   ├── route.js                    # GET, POST books
│   │   │   └── [id]/route.js              # GET, PUT, DELETE book by ID
│   │   ├── borrows/
│   │   │   ├── route.js                    # GET, POST borrows
│   │   │   ├── [id]/route.js              # PUT borrow status
│   │   │   └── update-overdue/route.js    # Manual update overdue
│   │   ├── upload/route.js                # Upload book images
│   │   └── cron/update-overdue/route.js   # Cron job endpoint
│   ├── admin/
│   │   ├── books/page.jsx                  # Admin: CRUD books
│   │   └── borrows/page.jsx               # Admin: Manage transactions
│   ├── books/
│   │   ├── page.jsx                        # User: Book catalog with search
│   │   └── [id]/page.jsx                  # User: Book detail + borrow
│   ├── borrows/
│   │   └── page.jsx                        # User: My borrows list
│   ├── dashboard/
│   │   └── page.jsx                        # User: Dashboard with active borrows
│   ├── login/page.jsx                      # Login page
│   ├── registration/page.jsx               # Registration page
│   └── layout.tsx                          # Root layout
├── components/
│   ├── ui/                                 # shadcn/ui components
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── dialog.jsx
│   │   ├── dropdown-menu.jsx
│   │   ├── input.jsx
│   │   └── label.jsx
│   └── Navbar.jsx                          # Navigation component
├── lib/
│   ├── db.js                               # MySQL connection pool
│   ├── auth.js                             # Auth utilities
│   ├── actions.js                          # Server actions
│   ├── hooks.js                            # Custom hooks
│   └── utils.js                            # Utility functions (cn)
├── public/
│   └── books/                              # Book images folder
├── middleware.js                           # Route protection
└── tailwind.config.js                      # Tailwind configuration
```

## Fitur yang Diimplementasikan

### 1. Fitur untuk User

#### ✅ Halaman Katalog Buku + Pencarian
- **File**: `app/books/page.jsx`
- Fitur:
  - Menampilkan semua buku dalam grid
  - Pencarian real-time berdasarkan judul, penulis, atau ISBN
  - Menampilkan status ketersediaan
  - Link ke halaman detail

#### ✅ Halaman Detail Buku
- **File**: `app/books/[id]/page.jsx`
- Fitur:
  - Menampilkan informasi lengkap buku
  - Tombol "Pinjam" dengan validasi
  - Validasi: tidak bisa pinjam jika available = 0
  - Validasi: tidak bisa pinjam buku yang sama jika masih aktif
  - Validasi: maksimal 3 peminjaman aktif per user

#### ✅ Dashboard Peminjam
- **File**: `app/dashboard/page.jsx`
- Fitur:
  - Statistik peminjaman (total, aktif, dikembalikan)
  - List buku yang sedang dipinjam (status: borrowed/overdue)
  - Tombol "Return" untuk setiap buku
  - Auto-update status overdue saat load
  - Riwayat peminjaman yang sudah dikembalikan

#### ✅ Halaman Peminjaman Saya
- **File**: `app/borrows/page.jsx`
- Fitur:
  - List semua peminjaman (aktif + riwayat)
  - Filter dan status badge
  - Tombol return untuk peminjaman aktif

### 2. Fitur untuk Admin

#### ✅ CRUD Buku
- **File**: `app/admin/books/page.jsx`
- Fitur:
  - Tambah buku baru (dengan dialog form)
  - Edit buku yang ada
  - Hapus buku
  - Upload gambar ke `/public/books/`
  - Update stock & available otomatis

#### ✅ Kelola Transaksi Peminjaman
- **File**: `app/admin/borrows/page.jsx`
- Fitur:
  - Lihat semua transaksi peminjaman
  - Filter berdasarkan status (all, active, borrowed, overdue, returned)
  - Ubah status peminjaman (set overdue, set returned, dll)
  - Informasi lengkap peminjam dan buku

### 3. Mekanisme Otomatis

#### ✅ Saat Pinjam
- **File**: `app/api/borrows/route.js` (POST)
- Mekanisme:
  - Insert ke tabel `borrows`
  - Update `available = available - 1`
  - Set `due_date = borrow_date + 7 hari`
  - Validasi: available > 0, tidak ada pinjaman aktif untuk buku yang sama, max 3 aktif

#### ✅ Saat Return
- **File**: `app/api/borrows/[id]/route.js` (PUT)
- Mekanisme:
  - Update status → `returned`
  - Set `return_date` = sekarang
  - Update `available += 1`

#### ✅ Auto Update Overdue
- **File**: `app/api/borrows/update-overdue/route.js`
- Mekanisme:
  - Update status `borrowed` → `overdue` jika `due_date < today`
  - Dipanggil otomatis saat dashboard load
  - Bisa dipanggil via cron job: `/api/cron/update-overdue`

### 4. Proteksi Halaman

#### ✅ Middleware
- **File**: `middleware.js`
- Proteksi:
  - Route public: `/`, `/login`, `/registration`
  - Route protected: semua route lain memerlukan auth
  - Route admin-only: `/admin/*` hanya untuk role admin
  - Redirect otomatis jika tidak authorized

## Server Actions

Semua operasi database menggunakan server actions di `lib/actions.js`:
- `getBooks(search)` - Get books dengan search
- `getBookById(id)` - Get book detail
- `createBook(formData)` - Create book (admin only)
- `updateBook(id, formData)` - Update book (admin only)
- `deleteBook(id)` - Delete book (admin only)
- `borrowBook(bookId)` - Borrow book dengan validasi
- `returnBook(borrowId)` - Return book
- `getBorrows()` - Get borrows (filtered by role)
- `updateBorrowStatus(borrowId, status)` - Update status (admin only)
- `updateOverdueStatus()` - Auto update overdue

## Komponen UI (shadcn/ui)

Semua komponen menggunakan shadcn/ui:
- `Button` - Tombol dengan berbagai variant
- `Card` - Card container
- `Input` - Input field
- `Label` - Form label
- `Dialog` - Modal dialog
- `DropdownMenu` - Dropdown menu

## API Routes

### Books
- `GET /api/books` - List semua buku (dengan search query)
- `POST /api/books` - Create book (admin only)
- `GET /api/books/[id]` - Get book detail
- `PUT /api/books/[id]` - Update book (admin only)
- `DELETE /api/books/[id]` - Delete book (admin only)

### Borrows
- `GET /api/borrows` - List borrows (filtered by role)
- `POST /api/borrows` - Create borrow
- `PUT /api/borrows/[id]` - Update borrow status
- `POST /api/borrows/update-overdue` - Manual update overdue

### Upload
- `POST /api/upload` - Upload book image (admin only)

### Cron
- `GET /api/cron/update-overdue` - Cron job endpoint (requires CRON_SECRET)

## Validasi

### Peminjaman
1. ✅ `available > 0` - Buku harus tersedia
2. ✅ Tidak ada pinjaman aktif untuk buku yang sama
3. ✅ Maksimal 3 peminjaman aktif per user

### Admin
1. ✅ Hanya admin yang bisa CRUD buku
2. ✅ Hanya admin yang bisa kelola transaksi
3. ✅ Hanya admin yang bisa upload gambar

## Database Schema

Menggunakan schema yang diberikan:
- `users` - User data dengan role
- `books` - Book data dengan stock & available
- `borrows` - Transaction data dengan status

## Setup & Running

1. Install dependencies:
```bash
npm install
```

2. Setup database MySQL dengan schema yang diberikan

3. Konfigurasi `.env.local`:
```
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
CRON_SECRET=your-cron-secret
```

4. Run development server:
```bash
npm run dev
```

5. Setup cron job (optional):
   - Gunakan Vercel Cron atau service seperti cron-job.org
   - Set endpoint: `https://your-domain.com/api/cron/update-overdue`
   - Set header: `Authorization: Bearer ${CRON_SECRET}`
   - Schedule: Daily atau sesuai kebutuhan

## Catatan

- Upload gambar saat ini menyimpan ke `/public/books/`
- Untuk production, pertimbangkan menggunakan cloud storage (S3, Cloudinary, dll)
- Cron job untuk update overdue bisa di-setup via Vercel Cron atau external service
- Semua validasi sudah diimplementasikan sesuai requirement

