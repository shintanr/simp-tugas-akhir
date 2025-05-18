'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LogOut, Users, FileText, Settings } from 'lucide-react'

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
    <main className="min-h-screen  p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600">Selamat datang kembali, Admin 👋</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
              {/* Profile Picture */}
              <img
                src="/foto-profil.png"
                alt="Admin Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-800">Admin</p>
                <p className="text-sm text-gray-500">admin@lab.com</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>

        {/* Menu Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            title="Kelola Akun Praktikan"
            description="Tambah, edit, dan hapus akun praktikan."
            icon={<Users className="w-6 h-6 text-blue-500" />}
            bgColor="bg-blue-100"
          />
          <Card
            title="Kelola Laporan Praktikum"
            description="Pantau dan nilai laporan dari praktikan."
            icon={<FileText className="w-6 h-6 text-green-600" />}
            bgColor="bg-green-100"
          />
          <Card
            title="Pengaturan Sistem"
            description="Atur konfigurasi dan data praktikum."
            icon={<Settings className="w-6 h-6 text-yellow-500" />}
            bgColor="bg-yellow-100"
          />
        </section>
      </div>
    </main>
  )
}

function Card({
  title,
  description,
  icon,
  bgColor,
}: {
  title: string
  description: string
  icon: React.ReactNode
  bgColor: string
}) {
  return (
    <div
      className={`p-6 rounded-xl shadow-md hover:shadow-xl transition ${bgColor} cursor-pointer`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-white rounded-full shadow">{icon}</div>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      <p className="text-gray-700 text-sm">{description}</p>
    </div>
  )
}
