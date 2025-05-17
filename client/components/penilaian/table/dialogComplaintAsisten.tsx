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
import { useUpdateStatusComplaintMutation } from "@/redux/services/complaintApi";
import { penilaianApi } from "@/redux/services/penilaian";
import { PenilaianType } from "@/types/penilaian";
import { AlertCircle } from "lucide-react";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

interface DialogComplaintAsistenProps {
  data: PenilaianType;
}
function DialogComplaintAsisten({ data }: DialogComplaintAsistenProps) {
  const [description, setDescription] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const dispatch = useDispatch();

  const [updateStatusComplaint, { isLoading }] =
    useUpdateStatusComplaintMutation();
  const onSubmit = async () => {
    try {
      await updateStatusComplaint({
        id: data.id_complaint,
        status: "closed",
      }).unwrap();

      toast.success("Berhasil", {
        description: "Komplain berhasil dikirim",
      });
      setOpen(false);
      dispatch(penilaianApi.util.invalidateTags(["penilaian"]));
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <AlertCircle
          className={cn(
            "w-8 h-8 p-2 text-white rounded-full",
            data.id_complaint === null && "bg-red-500",
            data.id_complaint !== null && "bg-yellow-500 cursor-pointer",
            data.status_komplain === "closed" && "bg-green-500"
          )}
        />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Komplain</DialogTitle>
          <DialogDescription>
            Berikut adalah komplain dari praktikan
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
            disabled
          ></Textarea>
        </div>
        <DialogFooter className="mt-4">
          <Button
            disabled={
              data.status_komplain === "closed" || data.id_complaint === null
            }
            onClick={onSubmit}
            className="w-full"
          >
            {isLoading ? "Loading..." : "Close Komplain"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DialogComplaintAsisten;
