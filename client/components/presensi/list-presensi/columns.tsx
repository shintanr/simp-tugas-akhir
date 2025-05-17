"use client";

import { ColumnDef } from "@tanstack/react-table";
import StatusActionButton from "./statusActionButton";
import { ListPresensiType } from "@/types/presensi";
import DialogComplaintAsisten from "./dialogComplaintAsisten";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const getColumns = (
  selectedModul: string
): ColumnDef<ListPresensiType>[] => [
  {
    accessorKey: "nim",
    header: "Nim",
  },
  {
    accessorKey: "nama_user",
    header: "Nama",
  },
  {
    accessorKey: "nama_kelompok",
    header: "Kelompok",
  },
  {
    accessorKey: "status",
    header: () => <div className=" w-full">Status</div>,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <StatusActionButton
            data={row.original}
            selectedModul={selectedModul}
          />
          <DialogComplaintAsisten data={row.original} />
        </div>
      );
    },
  },
];
