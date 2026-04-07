"use client";

import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import { DataFrame } from "./CartesianChart";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "../ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { Input } from "../ui/input";
import ExpandableWidgetCard from "./expandableWidgetCard";

type Props = {
  title: string;
  description?: string | null;
  data: DataFrame;
};

type TableRowData = Record<string, unknown>;

type SearchableRow = {
  id: number;
  values: TableRowData;
  searchText: string;
};

const TableWidget = (props: Props) => {
  const { data } = props;
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      setSearchTerm(searchInput);
    }, 200);

    return () => {
      window.clearTimeout(debounceTimer);
    };
  }, [searchInput]);

  const rows = useMemo<TableRowData[]>(() => {
    if (!data.fields.length) return [];

    const rowCount = data.fields[0].values.length;

    return Array.from({ length: rowCount }, (_, i) => {
      const row: TableRowData = {};

      for (const field of data.fields) {
        row[field.name] = field.values[i];
      }

      return row;
    });
  }, [data.fields]);

  const searchableRows = useMemo<SearchableRow[]>(() => {
    return rows.map((row, index) => ({
      id: index,
      values: row,
      searchText: data.fields
        .map((field) => String(row[field.name] ?? ""))
        .join(" "),
    }));
  }, [data.fields, rows]);

  const fuse = useMemo(() => {
    return new Fuse(searchableRows, {
      keys: ["searchText"],
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [searchableRows]);

  const filteredRows = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim();

    if (!normalizedSearchTerm) {
      return searchableRows;
    }

    return fuse
      .search(normalizedSearchTerm)
      .map((result: { item: SearchableRow }) => result.item);
  }, [fuse, searchTerm, searchableRows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const visiblePages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (currentPage >= totalPages - 2) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
  }, [currentPage, totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [currentPage, filteredRows, pageSize]);

  return (
    <ExpandableWidgetCard
      title={props.title}
      description={props.description}
      widgetQueryKey={`table-${props.title}`}
      collapsedContentClassName="flex h-full flex-col"
      expandedContentClassName="flex h-full flex-col"
    >
      <div className="flex h-full flex-col">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {searchTerm.trim()
              ? `${filteredRows.length} Treffer von ${rows.length} Einträgen`
              : `${rows.length} Einträge`}
          </p>

          <div className="w-full sm:w-auto sm:min-w-64 sm:max-w-sm">
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setPage(1);
              }}
              placeholder="Tabelle durchsuchen"
              aria-label="Tabelle durchsuchen"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {data.fields.map((field) => (
                  <TableHead key={field.name} className="px-4 py-3">
                    {field.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length > 0 ? (
                paginatedRows.map((row: SearchableRow) => (
                  <TableRow key={row.id}>
                    {data.fields.map((field) => (
                      <TableCell
                        key={`${row.id}-${field.name}`}
                        className="px-4 py-3"
                      >
                        {String(row.values[field.name] ?? "-")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={data.fields.length}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    {rows.length === 0
                      ? "Keine Daten verfügbar"
                      : "Keine Treffer für diese Suche"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {filteredRows.length > pageSize ? (
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              Zeige {(currentPage - 1) * pageSize + 1} bis{" "}
              {Math.min(currentPage * pageSize, filteredRows.length)} von{" "}
              {filteredRows.length} Einträgen
            </p>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    text="Zurück"
                    onClick={(event) => {
                      event.preventDefault();
                      setPage((prev) => Math.max(1, prev - 1));
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {visiblePages.map((pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={pageNumber === currentPage}
                      onClick={(event) => {
                        event.preventDefault();
                        setPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    text="Weiter"
                    onClick={(event) => {
                      event.preventDefault();
                      setPage((prev) => Math.min(totalPages, prev + 1));
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        ) : null}
      </div>
    </ExpandableWidgetCard>
  );
};

export default TableWidget;
