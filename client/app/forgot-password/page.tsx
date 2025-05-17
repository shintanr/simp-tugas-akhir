"use client";

import Image from "next/image";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useForgotPasswordMutation } from "@/redux/services/authApi";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [ForgotPassword, { isLoading }] = useForgotPasswordMutation();

  const onSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    
    try {
      await ForgotPassword({ email }).unwrap();

      toast.success("Email berhasil dikirim");
    } catch (error) {
      console.log(error);
      toast.error("Email gagal dikirim");
    }
  };
  return (
    <div className="flex h-screen bg-gray-100 items-center justify-center font-nunito">
      <div className="flex w-full h-full bg-white shadow-xl overflow-hidden">
        <div className="w-full md:w-1/2 flex items-center justify-center p-12 h-full">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-4">
              <Image
                src="https://ugc.production.linktr.ee/wDJz56aeTbK1fX6Xhr8t_CSagowYHYDXjdslc"
                alt="Logo UNDIP"
                width={80}
                height={80}
              />
            </div>

            <h2 className="text-3xl font-extrabold text-primary text-center">
              Lupa Password
            </h2>

            <div className="mt-6 mb-4">
              <div className="flex flex-col gap-2 w-full">
                <form onSubmit={onSubmit}>
                  <div className="form-control flex flex-col gap-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="Email"
                      required
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className={`mt-4 w-full`} disabled={isLoading}>{isLoading ? "Loading..." : "Kirim Email"}</Button>
                </form>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:underline"
              >
                Login Sekarang?
              </Link>
            </div>
          </div>
        </div>

        <div className="relative hidden md:flex w-1/2 h-full">
          <Image
            src="/teknik-komputer.jpg"
            alt="Login Illustration"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
