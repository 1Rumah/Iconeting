# DANA App Clone dengan Admin Panel

Aplikasi e-wallet DANA clone dengan fitur multi-user dan admin panel untuk mengontrol semua user.

## 🔗 Link Aplikasi (Static Deployment)

- **Aplikasi Utama**: https://d2gfrzr2e2bkk.ok.kimi.link
- **Admin Panel**: https://d2gfrzr2e2bkk.ok.kimi.link/admin.html

## ⚠️ Catatan Penting: Cross-Device Support

### Keterbatasan Static Deployment
Deployment static saat ini menggunakan **localStorage** untuk menyimpan data. Ini memiliki keterbatasan:

✅ **Bisa dalam jaringan yang sama (sama WiFi)**:
- Buka aplikasi di browser berbeda
- Data akan tersinkronisasi antar tab/browser
- Admin Panel bisa mengontrol semua user

❌ **Tidak bisa antar jaringan berbeda**:
- Data tersimpan di browser masing-masing perangkat
- Perangkat di jaringan berbeda tidak bisa berbagi data

---

## 🚀 Solusi: Setup Backend Server

Untuk mendukung **cross-device & cross-network**, Anda perlu menjalankan backend server Node.js.

### Cara Setup Backend Server

#### 1. Download Project
```bash
cd /mnt/okcomputer/output/app
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Jalankan Server
```bash
npm run server
```

Server akan berjalan di `http://localhost:3000`

#### 4. Akses Aplikasi
- Main App: http://localhost:3000
- Admin Panel: http://localhost:3000/admin

---

## 📱 Fitur Aplikasi

### Aplikasi Utama (DANA)
- ✅ Registrasi user dengan nama & nomor HP
- ✅ Saldo default Rp 118.101
- ✅ QR Code Payment (Bayar & Terima)
- ✅ Chat dengan DIANA (Asisten Digital)
- ✅ Riwayat transaksi
- ✅ Logout & ganti akun

### Admin Panel
- ✅ Lihat semua user yang terdaftar
- ✅ Tambah/Kurangi saldo user
- ✅ Aktifkan/Nonaktifkan user
- ✅ Hapus user
- ✅ Statistik total user, saldo, transaksi
- ✅ Notifikasi suara saat ada perubahan
- ✅ Real-time sync

---

## 🔧 Cara Menggunakan

### 1. Mendaftarkan User
1. Buka Aplikasi Utama
2. Masukkan nama & nomor HP
3. Klik "Daftar"
4. User otomatis muncul di Admin Panel

### 2. Mengontrol User dari Admin Panel
1. Buka Admin Panel (di tab/window lain)
2. Pilih tab "Users"
3. Klik "Pilih & Kontrol" pada user
4. Masukkan jumlah & deskripsi
5. Klik "Tambah Saldo" atau "Kurangi Saldo"
6. Saldo user akan berubah real-time

### 3. Multi-User Testing
1. Buka aplikasi di browser berbeda/incognito
2. Daftar dengan nama & nomor HP berbeda
3. Lihat semua user di Admin Panel

---

## 🔔 Sinkronisasi Real-Time

Aplikasi menggunakan beberapa mekanisme sinkronisasi:

1. **BroadcastChannel** - Sinkronisasi antar tab dalam browser yang sama
2. **localStorage Events** - Sinkronisasi antar browser dalam perangkat yang sama
3. **Polling** - Auto refresh setiap 1-2 detik

---

## 🎵 Notifikasi Suara

Admin Panel memiliki suara untuk:
- ✅ Transaksi berhasil (success chime)
- 🔔 Update data (notification beep)

Toggle suara di header Admin Panel.

---

## 📂 Struktur File

```
app/
├── server.js              # Backend server (Node.js/Express)
├── src/
│   ├── App.tsx           # Aplikasi utama DANA
│   ├── AdminPanel.tsx    # Admin Panel
│   ├── components/
│   │   ├── ChatInterface.tsx
│   │   └── QRScanner.tsx
│   └── hooks/
│       ├── useUserManagement.ts
│       └── useApi.ts
├── dist/                 # Build output
├── index.html
├── admin.html
└── package.json
```

---

## 🛠️ Teknologi

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **State Management**: React Hooks + localStorage
- **Sync**: BroadcastChannel + Custom Events

---

## 📝 Catatan Pengembangan

### Untuk Cross-Device & Cross-Network
Anda perlu:
1. Deploy backend server ke cloud (Heroku, Railway, VPS, dll)
2. Update `API_BASE_URL` di `src/hooks/useApi.ts`
3. Ganti `useUserManagement.ts` untuk menggunakan API (sudah disiapkan)

### Backend Server API Endpoints

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/users` | GET | Get all users |
| `/api/users/:id` | GET | Get user by ID |
| `/api/users/register` | POST | Register new user |
| `/api/users/:id/balance` | POST | Update user balance |
| `/api/users/:id/status` | PATCH | Toggle user status |
| `/api/users/:id` | DELETE | Delete user |
| `/api/stats` | GET | Get statistics |

---

## 🐛 Troubleshooting

### Data tidak sinkron?
- Refresh halaman
- Pastikan menggunakan jaringan yang sama
- Cek console browser untuk error

### Suara tidak berfungsi?
- Browser memerlukan interaksi user pertama kali
- Klik anywhere di halaman untuk enable audio

### User tidak muncul di Admin Panel?
- Pastikan sudah mendaftar di aplikasi utama
- Cek localStorage di DevTools
- Refresh halaman Admin Panel

---

## 📄 Lisensi

Project ini untuk edukasi dan demonstrasi.
