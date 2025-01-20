"use client";

import {DataTable} from "@/components/ui/datatable";

const columns = [
  {
    id: "id",
    header: "ID",
    accessorKey: "id",
  },
  {
    id: "currency",
    header: "Currency",
    accessorKey: "currency",
  },
  {
    id: "totalAmount",
    header: "Total Amount",
    accessorKey: "totalAmount",
  },
  {
    id: "installments",
    header: "Installments",
    accessorKey: "installments",
  },
  {
    id: "paymentMethod",
    header: "Payment Method",
    accessorKey: "paymentMethod",
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
  },
  {
    id: "type",
    header: "Type",
    accessorKey: "type",
  },
  {
    id: "processedAt",
    header: "Processed At",
    accessorKey: "processedAt",
  },
  {
    id: "confirmedAt",
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
    <DataTable
      url="http://localhost:7543/api/transactions"
      columns={columns}
      sortColumns={["totalAmount", "user.email", "processedAt"]}
      defaultSortField="processedAt"
      defaultSortDirection="desc"
    />
  );
}
