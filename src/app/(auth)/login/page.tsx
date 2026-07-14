import LoginForm from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    // Menggunakan tata letak Flexbox untuk memosisikan form tepat di tengah layar browser
    <div className='min-h-screen w-full flex items-center justify-center px-4'>
      <LoginForm />
    </div>
  );
}
