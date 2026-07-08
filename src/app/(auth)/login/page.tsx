// 💡 1. Pastikan jalur impor mengarah ke komponen LoginForm yang bebas tipe 'any' kemarin
import LoginForm from '@/features/auth/components/LoginForm';

// 💡 2. WAJIB menggunakan 'export default function' agar dikenali oleh Router Next.js
export default function LoginPage() {
  return (
    // Menggunakan tata letak Flexbox untuk memosisikan form tepat di tengah layar browser
    <div className='min-h-screen w-full flex items-center justify-center bg-neutral-50 px-4'>
      <LoginForm />
    </div>
  );
}
