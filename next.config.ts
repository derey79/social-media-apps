import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    dangerouslyAllowSVG: true, // Mengizinkan aset SVG jika ada ke depannya
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**', // 💡 Mengunci izin untuk seluruh aset gambar Cloudinary Anda
      },
    ],
  },
};

export default nextConfig;
