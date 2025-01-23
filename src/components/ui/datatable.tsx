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
import {cn} from "@/lib/utils";
import {Input} from "./input";
import useSWR from "swr";
import {useQueryState} from "nuqs";
import qs from "qs";
import {ArrowUp} from "lucide-react";
import {debounce} from "lodash";

interface DataTableProps<TData, TValue> {
  url: string;
  columns: ColumnDef<TData, TValue>[];
  sortColumns?: string[];
  defaultSortField?: string;
  defaultSortDirection?: "asc" | "desc";
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function DataTable<TData, TValue>({
  url,
  columns,
  sortColumns = [],
  defaultSortField,
  defaultSortDirection,
}: DataTableProps<TData, TValue>) {
  const [page, setPage] = useQueryState("page", {
    defaultValue: "1",
  });
  const [limit, setLimit] = useQueryState("limit", {
    defaultValue: "10",
  });
  const [type, setType] = useQueryState("type", {
    defaultValue: "",
  });
  const [sortField, setSortField] = useQueryState("sortField", {
    defaultValue: defaultSortField || "",
  });
  const [sortDirection, setSortDirection] = useQueryState("sortDirection", {
    defaultValue: defaultSortDirection || "",
  });
  const [q, setQ] = useQueryState("q", {
    defaultValue: "",
  });

  const {data, isLoading} = useSWR(
    `${url}?${qs.stringify({page, sortField, sortDirection, limit, type, q})}`,
    fetcher
  );

  const {items, metadata} = React.useMemo(() => {
    return {
      items: data?.items || [],
      metadata: data?.metadata,
    };
  }, [data]);

  const pagesToRender = React.useMemo(() => {
    if (!metadata) {
      return [];
    }

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

  function handleUpdateSort(field: string) {
    setPage("1");
    setSortField(field);
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  }

  function handleUpdateLimit(limit: string) {
    setPage("1");
    setLimit(limit);
  }

  function handleUpdateType(type: string) {
    setPage("1");
    setType(type === "all" ? "" : type);
  }

  function handleChangeSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setPage("1");
    setQ(e.target.value);
  }

  return (
    <div className="grid gap-2">
      <div className="flex gap-2 justify-between">
        <div className="flex gap-2">
          <Input
            placeholder="Search by id or email"
            className="w-48"
            defaultValue={q}
            onChange={debounce(handleChangeSearch, 500)}
          />
          <Select defaultValue={type || "all"} onValueChange={handleUpdateType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="CREDIT">Crédito</SelectItem>
              <SelectItem value="DEBIT">Débito</SelectItem>
              <SelectItem value="TRANSFER">Transferência</SelectItem>
              <SelectItem value="PAYMENT">Pagamento</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select defaultValue={limit} onValueChange={handleUpdateLimit}>
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
                  const isSortable = sortColumns.includes(header.id);
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
      {!isLoading && (
        <>
          <footer className="w-full flex justify-between items-center gap-10">
            <p className="flex-1 text-sm font-bold">
              Página {metadata.page} de {metadata.totalPages} com{" "}
              {metadata.total} resultados
            </p>
            <Pagination className="flex-1 justify-end">
              <PaginationContent>
                <PaginationItem disabled={metadata.page === 1}>
                  <PaginationPrevious href="#" onClick={() => setPage("1")}>
                    Primeira
                  </PaginationPrevious>
                </PaginationItem>
                <PaginationItem disabled={metadata.page === 1}>
                  <PaginationPrevious
                    href="#"
                    onClick={() => setPage((Number(page) - 1).toString())}
                  >
                    Anterior
                  </PaginationPrevious>
                </PaginationItem>
                {pagesToRender?.map((_page) => (
                  <PaginationItem key={_page}>
                    <PaginationLink
                      href="#"
                      onClick={() => setPage(_page.toString())}
                      className={cn({
                        "underline pointer-events-none":
                          page === _page.toString(),
                      })}
                    >
                      {_page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem
                  disabled={metadata.page === metadata.totalPages}
                >
                  <PaginationNext
                    href="#"
                    onClick={() => setPage((Number(page) + 1).toString())}
                  >
                    Próxima
                  </PaginationNext>
                </PaginationItem>
                <PaginationItem
                  disabled={metadata.page === metadata.totalPages}
                >
                  <PaginationNext
                    href="#"
                    onClick={() => setPage(metadata.totalPages.toString())}
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
