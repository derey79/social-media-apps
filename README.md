Open [http://localhost:3000](http://localhost:3000) or https://mysocial-connect.vercel.app/login with your browser to see the result.

🛠️ Agenda Pengembangan ke Depan (What We Haven't Done / Future Roadmap)

1. Autentikasi & Keamanan Tingkat Lanjut
   - Refresh Token Mechanism: Menambahkan sistem rotasi token JWT otomatis agar sesi login user tidak mendadak terputus ketika masa berlaku token habis di tengah jalan.
   - Change Email Flow with OTP Verification: Merakit alur pembaruan email terpisah yang menuntut verifikasi kode OTP ke email lama dan baru demi mencegah pembajakan akun.

2. Fitur Interaksi Sosial & Koleksi
   - Likes History Modal (Agenda Terlewat): Membuka jendela pop-up daftar nama pengguna yang menyukai sebuah postingan ketika angka statistik "Likes" disentuh di halaman profil.
   - Form Pop-Up Koleksi Bookmark Ber-Kategori: Mengizinkan pengguna membuat folder koleksi khusus (misal: "Koleksi Gaming", "Resep Makanan") saat mengklik tombol Bookmark pita emas, bukan hanya sekadar menyatukannya di satu tab Saved.

3. Skalabilitas Media & UX
   - Cloudinary Server-Side Crop / Optimization: Mengintegrasikan transformasi gambar otomatis Cloudinary di sisi server untuk memperkecil ukuran byte foto profil yang diunggah user sebelum disimpan ke pangkalan data database.
   - Infinite Scroll pada Tab Saved & Stories: Mengonversi Grid 3 Kolom profil dari kueri statis menjadi kueri tanpa batas (Infinite Scroll) menggunakan useInfiniteQuery TanStack untuk mengantisipasi penumpukan ribuan data postingan.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# social-media-apps
