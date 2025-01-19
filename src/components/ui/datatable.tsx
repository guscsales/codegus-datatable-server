"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {parseAsInteger, useQueryState} from "nuqs";
import qs from "qs";
import {cn} from "@/lib/utils";
import useSWR from "swr";
import {Input} from "./input";

interface DataTableProps<TData, TValue> {
  url: string;
  columns: ColumnDef<TData, TValue>[];
}

interface DataTableMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function fetcher(url: string) {
  return fetch(url).then((res) => res.json());
}

export function DataTable<TData, TValue>({
  url,
  columns,
}: DataTableProps<TData, TValue>) {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10)
  );
  const [q, setQ] = useQueryState("q", {defaultValue: ""});
  const [type, setType] = useQueryState("type", {defaultValue: ""});
  const {data, isLoading} = useSWR(
    `${url}?${qs.stringify({page, q, type, limit})}`,
    {
      fetcher,
      revalidateOnFocus: false,
    }
  );

  const {items, metadata} = React.useMemo(() => {
    return {items: data?.items, metadata: data?.metadata};
  }, [data]);

  const pagesToRender = React.useMemo(() => {
    if (!metadata) return [];

    const maxPagesToRender = 5;

    const pages = [];
    let startIndex = metadata.page - 2;
    let endIndex = metadata.page + 2;

    if (metadata.totalPages <= maxPagesToRender) {
      startIndex = 1;
      endIndex = metadata.totalPages;
    } else {
      if (startIndex < 1) {
        startIndex = 1;
        endIndex = maxPagesToRender;
      }

      if (endIndex > metadata.totalPages) {
        startIndex = metadata.totalPages - maxPagesToRender + 1;
        endIndex = metadata.totalPages;
      }
    }

    for (let i = startIndex; i <= endIndex; i++) {
      pages.push(i);
    }

    return pages;
  }, [metadata]);

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="grid gap-2">
      <div className="flex gap-2 justify-between">
        <div className="flex gap-2">
          <Input
            placeholder="Search by id or email"
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            className="w-48"
          />
          <Select
            onValueChange={(value) => {
              setPage(1);
              setType(value === "all" ? "" : value);
            }}
            defaultValue="all"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="CREDIT">Credit</SelectItem>
              <SelectItem value="DEBIT">Debit</SelectItem>
              <SelectItem value="TRANSFER">Transfer</SelectItem>
              <SelectItem value="PAYMENT">Payment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select
            onValueChange={(value) => setLimit(parseInt(value))}
            defaultValue={limit.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select limit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 Rows</SelectItem>
              <SelectItem value="20">20 Rows</SelectItem>
              <SelectItem value="50">50 Rows</SelectItem>
              <SelectItem value="100">100 Rows</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {!isLoading &&
              table.getRowModel().rows?.length > 0 &&
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!isLoading && table.getRowModel().rows?.length <= 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Sem resultados.
                </TableCell>
              </TableRow>
            )}
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Carregando dados...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {!isLoading && (
        <>
          <footer className="w-full flex justify-between items-center gap-10">
            <p className="flex-1 text-sm font-bold">
              Página {metadata.page} de {metadata.totalPages} com{" "}
              {metadata.total} resultados
            </p>
            <Pagination className="flex-1 justify-end">
              <PaginationContent>
                <PaginationItem disabled={!metadata.hasPreviousPage}>
                  <PaginationPrevious href="#" onClick={() => setPage(1)}>
                    Primeira
                  </PaginationPrevious>
                </PaginationItem>
                <PaginationItem disabled={!metadata.hasPreviousPage}>
                  <PaginationPrevious
                    href="#"
                    onClick={() => setPage(page - 1)}
                  >
                    Anterior
                  </PaginationPrevious>
                </PaginationItem>
                {pagesToRender.map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={() => setPage(page)}
                      className={cn({
                        underline: page === metadata.page,
                      })}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem disabled={!metadata.hasNextPage}>
                  <PaginationNext href="#" onClick={() => setPage(page + 1)}>
                    Próxima
                  </PaginationNext>
                </PaginationItem>
                <PaginationItem disabled={!metadata.hasNextPage}>
                  <PaginationNext
                    href="#"
                    onClick={() => setPage(metadata.totalPages)}
                  >
                    Última
                  </PaginationNext>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </footer>
        </>
      )}
    </div>
  );
}
