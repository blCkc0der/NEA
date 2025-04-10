import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-screen">
      <div className="relative w-1/2">
        <Image
          src="/logo.png"
          alt="SIMS Logo"
          fill
          priority
          className="object-cover"
        />
      </div>

      <div className="w-1/2 flex flex-col items-center justify-center bg-white p-6">
        <h1 className="text-4xl font-bold mb-4">Welcome to SIMS</h1>
        <p className="text-xl text-gray-600 mb-8">Manage Your Materials, Master Your Lessons</p>
        <Link 
        href = "/login"
        className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Get started
        </Link>
      </div>
    </main>
  );
}