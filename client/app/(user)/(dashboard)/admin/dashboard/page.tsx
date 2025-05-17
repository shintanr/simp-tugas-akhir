'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'


export default function AdminDashboard() {
  const router = useRouter()
  const session = useSession()
  console.log("🚀 ~ AdminDashboard ~ session:", session)

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      router.push('/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </header>

        <section>
          <p className="text-gray-600">
            Selamat datang, Admin! 👋
          </p>

          {/* Tambahkan menu navigasi atau konten lainnya di sini */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-100 rounded-lg shadow text-blue-800">
              💡 Kelola akun praktikan
            </div>
            <div className="p-4 bg-green-100 rounded-lg shadow text-green-800">
              📄 Kelola laporan praktikum
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
