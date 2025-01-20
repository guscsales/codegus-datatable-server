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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {parseAsInteger, useQueryState} from "nuqs";
import qs from "qs";
import {cn} from "@/lib/utils";
import useSWR from "swr";
import {Input} from "./input";
import debounce from "lodash/debounce";
import {ArrowUp, ArrowUpDown} from "lucide-react";

interface DataTableProps<TData, TValue> {
  url: string;
  columns: ColumnDef<TData, TValue>[];
  sortColumns?: string[];
  defaultSortField?: string;
  defaultSortDirection?: "asc" | "desc";
}

interface DataTableData<TData> {
  items: TData[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

function fetcher(url: string) {
  return fetch(url).then((res) => res.json());
}

export function DataTable<TData, TValue>({
  url,
  columns,
  sortColumns,
  defaultSortField,
  defaultSortDirection,
}: DataTableProps<TData, TValue>) {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10)
  );
  const [q, setQ] = useQueryState("q", {defaultValue: ""});
  const [type, setType] = useQueryState("type", {defaultValue: ""});
  const [sortField, setSortField] = useQueryState("sortField", {
    defaultValue: defaultSortField || "",
  });
  const [sortDirection, setSortDirection] = useQueryState("sortDirection", {
    defaultValue: defaultSortDirection || "",
  });
  const {data, isLoading} = useSWR(
    `${url}?${qs.stringify({page, q, type, limit, sortField, sortDirection})}`,
    {
      fetcher,
      revalidateOnFocus: false,
    }
  );

  const {items, metadata} = React.useMemo<DataTableData<TData>>(() => {
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

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setPage(1);
    setQ(e.target.value);
  }

  function handleChangeType(value: string) {
    setPage(1);
    setType(value === "all" ? "" : value);
  }

  function handleChangeLimit(value: string) {
    setPage(1);
    setLimit(parseInt(value));
  }

  function handleUpdateSort(field: string) {
    setPage(1);
    setSortField(field);
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  }

  return (
    <div className="grid gap-2">
      <div className="flex gap-2 justify-between">
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <div className="text-sm font-bold">Busca:</div>
            <Input
              defaultValue={q}
              placeholder="Search by id or email"
              onChange={debounce(handleSearch, 500)}
              className="w-48"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-bold">Tipo:</div>
            <Select
              onValueChange={handleChangeType}
              defaultValue={type || "all"}
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
        </div>
        <div>
          <Select
            onValueChange={handleChangeLimit}
            defaultValue={limit.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select limit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 Registros</SelectItem>
              <SelectItem value="20">20 Registros</SelectItem>
              <SelectItem value="50">50 Registros</SelectItem>
              <SelectItem value="100">100 Registros</SelectItem>
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
                  const isSortable = sortColumns?.includes(header.id);
                  const isSorted = sortField === header.id;
                  return (
                    <TableHead key={header.id}>
                      <div
                        className={cn("flex items-center gap-0.5", {
                          "cursor-pointer hover:text-foreground": isSortable,
                          "text-foreground": isSorted,
                        })}
                        onClick={
                          isSortable
                            ? () => handleUpdateSort(header.id)
                            : undefined
                        }
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {isSorted && (
                          <ArrowUp
                            className={cn("ml-2 h-4 w-4", {
                              "rotate-180": sortDirection === "desc",
                            })}
                          />
                        )}
                      </div>
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
      {!isLoading && table.getRowModel().rows?.length > 0 && (
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
