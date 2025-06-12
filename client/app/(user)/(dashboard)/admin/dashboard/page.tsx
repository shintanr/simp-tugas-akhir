"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { LogOut, Users, FileText } from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const session = useSession()
  console.log("🚀 ~ AdminDashboard ~ session:", session)

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      router.push("/login")
    } catch (err) {
      console.error("Logout failed:", err)
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
              {/* Profile Picture */} // ini seharusnya memakai Iage  
              <img
                src="/foto-profil.png"
                alt="Admin Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold">{session.data?.user?.name}</h2>
                <p className="text-sm text-gray-500">{session.data?.user?.email}</p>
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
            title="Manajemen User"
            description="Kelola data user seperti menambah dan mengedit akun pengguna."
            icon={<Users className="w-6 h-6 text-blue-500" />}
            bgColor="bg-blue-100"
          />

          <Card
            title="Manajemen Praktikum"
            description="Kelola data praktikum seperti menambah dan mengedit praktikum."
            icon={<FileText className="w-6 h-6 text-blue-500" />}
            bgColor="bg-blue-100"
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
