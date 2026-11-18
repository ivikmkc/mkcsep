# Panduan Hosting MKC CBT (Vercel Serverless & Node.js)

## 1. Deploy ke Vercel (`vercel.json` + `api/index.cjs`)
Proyek ini sudah dilengkapi `vercel.json` dan serverless handler CommonJS `api/index.cjs` (dibundel otomatis lewat `npm run build`) sehingga route frontend (`dist/`) dan API backend (`/api/*`) berjalan dalam satu deployment Vercel.

Atur **Environment Variables** berikut di **Vercel Project Settings → Environment Variables**:
- `SESSION_SECRET`: string acak minimal 32 karakter (wajib sama antar serverless instance agar token login siswa/guru/super admin tetap valid).
- `FIREBASE_SERVICE_ACCOUNT_JSON`: isi JSON (atau string base64 dari JSON) **Firebase Service Account Key** dari Firebase Console (*Project Settings → Service accounts → Generate new private key*) agar seluruh data (akun siswa/guru, bank soal, ujian, jawaban, dan audit log) tersimpan **permanen** di Cloud Firestore (`ai-studio-remixsakaujiancb-e0846e26-5263-42b1-acea-b52700abc083`).

> **Catatan**: Jika `FIREBASE_SERVICE_ACCOUNT_JSON` belum diisi, Vercel tetap dapat menjalankan login demo menggunakan penyimpanan sementara di `/tmp`, namun data perubahan akan kembali ke bawaan awal saat serverless function restart.

## 2. Menjalankan Secara Lokal / VPS Node.js
```bash
npm install
npm run build
npm start
```

## 3. Catatan Keamanan Exam Mode
Browser web standar tidak dapat menjamin penguncian perangkat 100% pada tingkat sistem operasi. Untuk ujian berisiko tinggi, gunakan perangkat terkelola (*managed device* / Chromebook Kiosk) atau peramban ujian khusus (*Safe Exam Browser*).
