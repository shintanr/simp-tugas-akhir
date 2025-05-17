"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCreateComplaintMutation } from "@/redux/services/complaintApi";
import { PenilaianType } from "@/types/penilaian";
import { AlertCircle } from "lucide-react";
import React, { useEffect } from "react";
import { toast } from "sonner";

interface DialogComplaintPraktikanProps {
  data: PenilaianType;
}
function DialogComplaintPraktikan({ data }: DialogComplaintPraktikanProps) {
  const [description, setDescription] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const onOpenModal = () => {
    if (data && data.id === null) {
      return;
    }

    setOpen(!open);
  };

  const [createComplaint, { isLoading }] = useCreateComplaintMutation();
  const onSubmit = async () => {
    try {
      await createComplaint({
        reference_type: "penilaian",
        reference_id: data.id,
        description,
        status: "open",
      }).unwrap();

      toast.success("Berhasil", {
        description: "Komplain berhasil dikirim",
      });
      setOpen(false);
    } catch (error) {
      console.log(error);

      toast.error("Gagal", {
        description: "Komplain gagal dikirim",
      });
      setOpen(true);
    }
  };

  useEffect(() => {
    if (data && data.id_complaint !== null) {
      setDescription(data.komplain || "");
    }
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={onOpenModal}>
      <DialogTrigger asChild>
        <div
          className={cn(
            "flex items-center gap-2 p-2 text-white rounded-full justify-center w-full",
            data.id === null && "bg-red-500",
            data.id !== null && "bg-yellow-500 cursor-pointer"
          )}
        >
          <AlertCircle />
          <span className="hidden lg:block">{data.id === null ? "Belum Absen" : "Komplain"}</span>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Komplain</DialogTitle>
          <DialogDescription>
            Masukkan alasan komplain praktikan
          </DialogDescription>
        </DialogHeader>
          <div className="form-control flex flex-col w-full gap-4">
            <Label htmlFor="description" className="text-left">
              Deskripsi
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></Textarea>
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={onSubmit} className="w-full">
              {isLoading ? "Loading..." : "Kirim"}
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DialogComplaintPraktikan;
