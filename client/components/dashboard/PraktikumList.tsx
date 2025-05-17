"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Praktikum } from "@/types/praktikum";
import Link from "next/link";
import FormModalAddPracticum from "./FormModalAddPracticum";
import { signOut, useSession } from "next-auth/react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaUser } from "react-icons/fa";

// Definisikan tipe data untuk modul
interface praktikumListProps {
  praktikum: Praktikum[];
  selectedLab: string;
}

function PraktikumList({ praktikum, selectedLab }: praktikumListProps) {
  const session = useSession();
  const router = useRouter();
  return (
    <div className="flex min-h-screen">
      {/* Main content */}
      <main className="flex-1 px-8 ">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">
            {selectedLab || "Select a Lab"}
          </h1>
          <div className="flex items-center gap-4 mt-[-50px]">
          <div className="relative w-10 h-10 rounded-full bg-gray-200">
            <Image 
              src="/profile-dummy.png" 
              alt="Profile" 
              width={40} 
              height={40} 
              className="rounded-full" 
            />
            <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1">
              <FaUser size={10} />
            </div>
          </div>
            <Popover>
              <PopoverTrigger>{session.data?.user?.name}</PopoverTrigger>
              <PopoverContent className="w-56 mt-4">
                <div className="flex flex-col gap-2 p-1 bg-white">
                  <Button
                    className="w-full"
                    onClick={() => {
                      router.push("/profile");
                    }}
                  >
                    Profile
                  </Button>
                  <Button
                    className="w-full"
                    variant={"outline"}
                    onClick={() =>
                      signOut({
                        callbackUrl: "/login",
                      })
                    }
                  >
                    Keluar
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {praktikum.length > 0 &&
            praktikum.map((module, index) => (
              <Link
                key={index}
                href={`/praktikum/${module.id_praktikum}/presensi`}
              >
                <Card className="w-full max-w-xs overflow-hidden rounded-md shadow-md hover:shadow-lg transition-shadow duration-300">
              
                  <div className="relative w-full h-28">
                    <Image
                        src={`https://images.unsplash.com/photo-1553273883-a8938f89f492?q=80&w=2108&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`}
                        alt={`Praktikum ${module.name}`}
                        fill
                        className="object-cover rounded-t-md"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={false}
                      />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70 rounded-t-md" />
                  </div>
                
                <CardContent>
                  <h2 className="text-base font-semibold text-gray-800 mb-1 -mt-2 line-clamp-2">{module.name}</h2>
                  <p className="text-gray-500 text-xs pb-6">{module.modul}</p>
                </CardContent>
              </Card>
              </Link>
            ))}
          <div className="col-span-1">
            <FormModalAddPracticum />
          </div>
        </div>
      </main>
    </div>
  );
}

export default PraktikumList;
