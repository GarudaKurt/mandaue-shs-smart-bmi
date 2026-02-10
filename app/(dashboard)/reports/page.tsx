"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { CalendarIcon, Pencil, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
/* ===================== TYPES ===================== */

type SexValue = "male" | "female" | "other" | "";
type CivilStatusValue = "single" | "married" | "widowed" | "separated" | "";

type RegistrationRecord = {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  sex: SexValue;
  dob?: Date | null;
  mobile: string;
  placeOfBirth: string; // textarea up to 255
  address: string; // textarea up to 255
  nationality: string;
  company: string;
  occupation: string;
  civilStatus: CivilStatusValue;
};

/* ===================== HELPERS ===================== */

const fmtDOB = (d?: Date | null): string => (d ? format(d, "MM/dd/yyyy") : "");
const getYear = (d?: Date | null): string | null =>
  d ? d.getFullYear().toString() : null;
const cap255 = (s: string) => (s?.length > 255 ? s.slice(0, 255) : s);

/* ===================== SAMPLE SEED DATA (client-only) ===================== */

const seed: RegistrationRecord[] = [
  {
    id: 1,
    firstName: "Juan",
    middleName: "Santos",
    lastName: "Dela Cruz",
    sex: "male",
    dob: new Date(1994, 4, 12),
    mobile: "09123456789",
    placeOfBirth:
      "Quezon City, Philippines. Born near the city center with extended details to test wrapping.",
    address:
      "123 Sampaguita St, Barangay Malinis, Quezon City, Metro Manila, Philippines 1101",
    nationality: "Filipino",
    company: "Acme Corp",
    occupation: "Engineer",
    civilStatus: "single",
  },
  {
    id: 2,
    firstName: "Maria",
    middleName: "Lopez",
    lastName: "Santos",
    sex: "female",
    dob: new Date(1990, 0, 30),
    mobile: "09998887777",
    placeOfBirth: "Makati City, Philippines",
    address:
      "456 Mabini Ave, Poblacion, Makati City, Metro Manila, Philippines 1200",
    nationality: "Filipino",
    company: "Globex",
    occupation: "Analyst",
    civilStatus: "married",
  },
];

/* ===================== RESPONSIVE LONG TEXT CELL ===================== */

function ResponsiveLongText({ text }: { text?: string }) {
  const value = (text ?? "").slice(0, 255) || "-";
  return (
    <div
      title={value}
      className="
        whitespace-pre-wrap break-words
        max-w-[18ch] sm:max-w-[28ch] md:max-w-[40ch] lg:max-w-[56ch]
      "
    >
      {value}
    </div>
  );
}

/* ===================== MAIN COMPONENT ===================== */

export default function RegistrationTable() {
  const [data, setData] = useState<RegistrationRecord[]>(seed);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filter by Year (DOB year)
  const [yearFilter, setYearFilter] = useState<string>("all");

  // Add/Edit Sheet State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState<RegistrationRecord | null>(null);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sex, setSex] = useState<SexValue>("");
  const [dob, setDob] = useState<Date | undefined>();
  const [mobile, setMobile] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [nationality, setNationality] = useState("");
  const [company, setCompany] = useState("");
  const [occupation, setOccupation] = useState("");
  const [civilStatus, setCivilStatus] = useState<CivilStatusValue>("");
  const [personQuery, setPersonQuery] = useState("");

  // Years available in data for the year filter
  const availableYears = useMemo(() => {
    const yrs = Array.from(
      new Set(
        data.map((r) => getYear(r.dob)).filter((y): y is string => Boolean(y)),
      ),
    ).sort((a, b) => Number(a) - Number(b));
    return yrs;
  }, [data]);

  // Apply year filter
  const filtered = useMemo(() => {
    if (yearFilter === "all") return data;
    return data.filter((r) => getYear(r.dob) === yearFilter);
  }, [data, yearFilter]);

  /* ===================== TABLE COLUMNS ===================== */

  const columns: ColumnDef<RegistrationRecord>[] = [
    { accessorKey: "firstName", header: "First Name" },
    { accessorKey: "middleName", header: "Middle Name" },
    { accessorKey: "lastName", header: "Last Name" },
    {
      accessorKey: "sex",
      header: "Sex",
      cell: ({ row }) => {
        const v = row.original.sex;
        if (!v) return "-";
        return v === "male" ? "Male" : v === "female" ? "Female" : "Other";
      },
    },
    {
      accessorKey: "dob",
      header: "Date of Birth",
      cell: ({ row }) => fmtDOB(row.original.dob),
    },
    { accessorKey: "mobile", header: "Mobile" },

    // ✅ Responsive, multi-line (textarea) columns
    {
      accessorKey: "placeOfBirth",
      header: "Place of Birth",
      cell: ({ row }) => (
        <ResponsiveLongText text={row.original.placeOfBirth} />
      ),
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => <ResponsiveLongText text={row.original.address} />,
    },

    { accessorKey: "nationality", header: "Nationality" },
    { accessorKey: "company", header: "Company" },
    { accessorKey: "occupation", header: "Occupation" },
    {
      accessorKey: "civilStatus",
      header: "Civil Status",
      cell: ({ row }) => {
        const v = row.original.civilStatus;
        const map: Record<CivilStatusValue, string> = {
          single: "Single",
          married: "Married",
          widowed: "Widowed",
          separated: "Separated",
          "": "-",
        };
        return map[v] || "-";
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex gap-1 justify-center">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              const r = row.original;
              setEditing(r);
              setFirstName(r.firstName);
              setMiddleName(r.middleName);
              setLastName(r.lastName);
              setSex(r.sex);
              setDob(r.dob || undefined);
              setMobile(r.mobile);
              setPlaceOfBirth(r.placeOfBirth);
              setAddress(r.address);
              setNationality(r.nationality);
              setCompany(r.company);
              setOccupation(r.occupation);
              setCivilStatus(r.civilStatus);
              setIsEditOpen(true);
            }}
          >
            <Pencil className="h-4 w-4 text-blue-600" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setData((prev) => prev.filter((x) => x.id !== row.original.id));
            }}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: filtered,
    columns,
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  /* ===================== HANDLERS ===================== */

  const resetForm = () => {
    setEditing(null);
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setSex("");
    setDob(undefined);
    setMobile("");
    setPlaceOfBirth("");
    setAddress("");
    setNationality("");
    setCompany("");
    setOccupation("");
    setCivilStatus("");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: RegistrationRecord = {
      id: editing ? editing.id : Math.max(0, ...data.map((d) => d.id)) + 1,
      firstName,
      middleName,
      lastName,
      sex,
      dob: dob || null,
      mobile,
      placeOfBirth: cap255(placeOfBirth),
      address: cap255(address),
      nationality,
      company,
      occupation,
      civilStatus,
    };

    if (editing) {
      setData((prev) => prev.map((x) => (x.id === editing.id ? payload : x)));
    } else {
      setData((prev) => [payload, ...prev]);
      setPageIndex(0); // show the new row
    }

    setIsEditOpen(false);
    resetForm();
  };

  /* ===================== RENDER ===================== */

  return (
    <div className="w-full p-3 bg-[#F3F3F3]">
      {/* HEADER & CONTROLS */}
      <div className="absolute top-4 left-4 mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>
      <div className="flex justify-between items-center mt-4 mb-4">
        <h1 className="text-2xl font-semibold">Registrations</h1>

        <div className="flex gap-4 flex-wrap items-center">
          {/* FILTER BY YEAR (DOB YEAR) */}
          <Select
            value={yearFilter}
            onValueChange={(v) => {
              setYearFilter(v);
              setPageIndex(0);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter year" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All</SelectItem>
              {availableYears.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* PERSON SEARCH */}
          <div className="w-[200px]">
            <Input
              value={personQuery}
              onChange={(e) => {
                setPersonQuery(e.target.value);
                setPageIndex(0);
              }}
              placeholder="Search person…"
            />
          </div>

          {/* ROWS PER PAGE (retain) */}
          <Select
            value={pageSize === filtered.length ? "all" : pageSize.toString()}
            onValueChange={(val) => {
              setPageIndex(0);
              if (val === "all") setPageSize(filtered.length || 1);
              else setPageSize(Number(val));
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Rows per page" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>

          {/* ADD / EDIT SHEET */}
          <Sheet
            open={isEditOpen}
            onOpenChange={(o) => {
              setIsEditOpen(o);
              if (!o) resetForm();
            }}
          >
            <SheetTrigger asChild>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  resetForm();
                  setIsEditOpen(true);
                }}
              >
                Add New
              </Button>
            </SheetTrigger>

            <SheetContent className="bg-white max-h-[100vh] overflow-y-auto w-full sm:max-w-2xl">
              <SheetHeader>
                <SheetTitle>{editing ? "Edit" : "Add"} Registration</SheetTitle>
                <SheetDescription>
                  Fill in all fields as needed
                </SheetDescription>
              </SheetHeader>

              {/* FORM LAYOUT */}
              <form className="mt-4 space-y-4" onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                        className="bg-white hover:border-blue-700"
                      />
                    </div>

                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                        className="hover:border-blue-700"
                      />
                    </div>

                    <div>
                      <Label htmlFor="middleName">Middle Name</Label>
                      <Input
                        id="middleName"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        placeholder="Enter middle name"
                        className="hover:border-blue-700"
                      />
                    </div>

                    <div>
                      <Label htmlFor="sex">Sex</Label>
                      <Select
                        value={sex}
                        onValueChange={(v: SexValue) => setSex(v)}
                      >
                        <SelectTrigger id="sex">
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <Label>Date of Birth</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full justify-between text-left font-normal",
                              !dob && "text-muted-foreground",
                            )}
                          >
                            {dob ? format(dob, "PPP") : "Pick a date"}
                            <CalendarIcon className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 bg-white"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={dob}
                            onSelect={setDob}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="mobile">Mobile Number</Label>
                      <Input
                        id="mobile"
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="09XXXXXXXXX"
                        className="hover:border-blue-700"
                      />
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-4">
                    {/* ✅ textarea with 255 char limit */}
                    <div>
                      <Label htmlFor="placeOfBirth">Place of Birth</Label>
                      <textarea
                        id="placeOfBirth"
                        value={placeOfBirth}
                        onChange={(e) => setPlaceOfBirth(e.target.value)}
                        maxLength={255}
                        rows={3}
                        placeholder="Enter place of birth"
                        className="w-full border rounded p-2 bg-white hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {placeOfBirth.length}/255
                      </p>
                    </div>

                    {/* ✅ textarea with 255 char limit */}
                    <div>
                      <Label htmlFor="address">Current Address</Label>
                      <textarea
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        maxLength={255}
                        rows={3}
                        placeholder="Enter current address"
                        className="w-full border rounded p-2 bg-white hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {address.length}/255
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        placeholder="Enter nationality"
                        className="hover:border-blue-700"
                      />
                    </div>

                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Enter company"
                        className="hover:border-blue-700"
                      />
                    </div>

                    <div>
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        placeholder="Enter occupation"
                        className="hover:border-blue-700"
                      />
                    </div>

                    <div>
                      <Label htmlFor="civilStatus">Civil Status</Label>
                      <Select
                        value={civilStatus}
                        onValueChange={(v: CivilStatusValue) =>
                          setCivilStatus(v)
                        }
                      >
                        <SelectTrigger id="civilStatus">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="widowed">Widowed</SelectItem>
                          <SelectItem value="separated">Separated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Warning text */}
                <p className="text-red-500 italic text-center mt-2">
                  ⚠️ Review your information before saving!
                </p>

                {/* Save/Cancel */}
                <div className="mt-4 space-y-2">
                  <Button
                    type="submit"
                    className="w-full bg-black hover:bg-[#2C2C2C] text-white"
                  >
                    {editing ? "Update" : "Save"}
                  </Button>

                  <Button
                    type="button"
                    className="w-full bg-gray-200 hover:bg-gray-300 text-black"
                    onClick={() => {
                      setIsEditOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <Table className="w-full bg-white table-fixed rounded-lg">
          <TableHeader>
            {table.getHeaderGroups().map((g) => (
              <TableRow key={g.id}>
                {g.headers.map((h) => (
                  <TableHead key={h.id} className="bg-[#2C2C2C] text-white">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-4"
                >
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const key = (cell.column.columnDef as any).accessorKey as
                      | string
                      | undefined;
                    const isLong = key === "placeOfBirth" || key === "address";
                    return (
                      <TableCell
                        key={cell.id}
                        className={
                          isLong
                            ? "align-top whitespace-normal"
                            : "whitespace-nowrap"
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      <div className="mt-4">
        <Pagination className="flex bg-[#F3F3F3] justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => table.previousPage()} />
            </PaginationItem>

            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink onClick={() => table.setPageIndex(i)}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext onClick={() => table.nextPage()} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
