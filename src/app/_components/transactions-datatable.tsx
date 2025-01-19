"use client";

import {DataTable} from "@/components/ui/datatable";

const columns = [
  {
    header: "ID",
    accessorKey: "id",
  },
  {
    header: "Currency",
    accessorKey: "currency",
  },
  {
    header: "Total Amount",
    accessorKey: "totalAmount",
  },
  {
    header: "Installments",
    accessorKey: "installments",
  },
  {
    header: "Payment Method",
    accessorKey: "paymentMethod",
  },
  {
    header: "Status",
    accessorKey: "status",
  },
  {
    header: "Type",
    accessorKey: "type",
  },
  {
    header: "Processed At",
    accessorKey: "processedAt",
  },
  {
    header: "Confirmed At",
    accessorKey: "confirmedAt",
  },
  {
    id: "user.email",
    header: "Email",
    accessorKey: "user.email",
  },
];

export function TransactionsDataTable() {
  return (
    <DataTable url="http://localhost:7543/api/transactions" columns={columns} />
  );
}
