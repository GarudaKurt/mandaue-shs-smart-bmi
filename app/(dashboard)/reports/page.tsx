"use client";

import * as React from "react";
import { useMemo, useState, useEffect } from "react";
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

import { CalendarIcon, Pencil, Trash2, Loader2 } from "lucide-react";
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

// 🔥 Firestore imports
import { firestore } from "@/database/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";

/* ===================== TYPES ===================== */

type SexValue = "male" | "female" | "other" | "";
type CivilStatusValue = "single" | "married" | "widowed" | "separated" | "";

type RegistrationRecord = {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  sex: SexValue;
  dob?: Date | null;
  mobile: string;
  placeOfBirth: string;
  address: string;
  nationality: string;
  company: string;
  occupation: string;
  civilStatus: CivilStatusValue;
  spo2: string;
  temperature: string;
  height: string;
  weight: string;
};

/* ===================== HELPERS ===================== */

const fmtDOB = (d?: Date | null): string => (d ? format(d, "MM/dd/yyyy") : "");
const getYear = (d?: Date | null): string | null =>
  d ? d.getFullYear().toString() : null;
const cap255 = (s: string) => (s?.length > 255 ? s.slice(0, 255) : s);

const toDate = (val: unknown): Date | null => {
  if (!val) return null;
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  if (typeof val === "string") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

/* ===================== RESPONSIVE LONG TEXT CELL ===================== */

function ResponsiveLongText({
  text,
  maxLen = 255,
}: {
  text?: string;
  maxLen?: number;
}) {
  const value = (text ?? "").slice(0, maxLen) || "-";
  return (
    <div
      title={value}
      className="whitespace-pre-wrap break-words max-w-[18ch] sm:max-w-[28ch] md:max-w-[40ch] lg:max-w-[56ch]"
    >
      {value}
    </div>
  );
}

/* ===================== COLLECTION NAME ===================== */
const COLLECTION = "registrations";

// Columns whose cells should wrap (align-top + whitespace-normal)
const RESPONSIVE_COLS = new Set([
  "placeOfBirth",
  "address",
  "company",
  "occupation",
  "mobile", // ← same treatment as occupation
]);

/* ===================== MAIN COMPONENT ===================== */

export default function RegistrationTable() {
  const [data, setData] = useState<RegistrationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState<RegistrationRecord | null>(null);
  const [personQuery, setPersonQuery] = useState("");

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
  const [spo2, setSpo2] = useState("");
  const [temperature, setTemperature] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  /* ===================== FETCH FROM FIRESTORE ===================== */

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(firestore, COLLECTION),
        orderBy("createdAt", "desc"),
      );
      const snapshot = await getDocs(q);
      const records: RegistrationRecord[] = snapshot.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          firstName: raw.firstName ?? "",
          middleName: raw.middleName ?? "",
          lastName: raw.lastName ?? "",
          sex: (raw.sex ?? "") as SexValue,
          dob: toDate(raw.dateOfBirth ?? raw.dob),
          mobile: raw.mobile ?? "",
          placeOfBirth: raw.placeOfBirth ?? "",
          address: raw.address ?? "",
          nationality: raw.nationality ?? "",
          company: raw.company ?? "",
          occupation: raw.occupation ?? "",
          civilStatus: (raw.civilStatus ?? "") as CivilStatusValue,
          spo2: raw.spo2 ?? "",
          temperature: raw.temperature ?? "",
          height: raw.height ?? "",
          weight: raw.weight ?? "",
        };
      });
      setData(records);
    } catch (err) {
      console.error("Error fetching records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  /* ===================== DERIVED DATA ===================== */

  const availableYears = useMemo(() => {
    const yrs = Array.from(
      new Set(
        data.map((r) => getYear(r.dob)).filter((y): y is string => Boolean(y)),
      ),
    ).sort((a, b) => Number(a) - Number(b));
    return yrs;
  }, [data]);

  const filtered = useMemo(() => {
    let result = data;

    if (yearFilter !== "all") {
      result = result.filter((r) => getYear(r.dob) === yearFilter);
    }

    if (personQuery.trim()) {
      const q = personQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.firstName.toLowerCase().includes(q) ||
          r.middleName.toLowerCase().includes(q) ||
          r.lastName.toLowerCase().includes(q),
      );
    }

    return result;
  }, [data, yearFilter, personQuery]);

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
    {
      // ← now uses ResponsiveLongText, same as occupation
      accessorKey: "mobile",
      header: "Mobile",
      cell: ({ row }) => (
        <ResponsiveLongText text={row.original.mobile} maxLen={20} />
      ),
    },
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
    {
      accessorKey: "company",
      header: "Company",
      cell: ({ row }) => (
        <ResponsiveLongText text={row.original.company} maxLen={100} />
      ),
    },
    {
      accessorKey: "occupation",
      header: "Occupation",
      cell: ({ row }) => (
        <ResponsiveLongText text={row.original.occupation} maxLen={100} />
      ),
    },
    {
      accessorKey: "civilStatus",
      header: "Civil Status",
      cell: ({ row }) => {
        const map: Record<CivilStatusValue, string> = {
          single: "Single",
          married: "Married",
          widowed: "Widowed",
          separated: "Separated",
          "": "-",
        };
        return map[row.original.civilStatus] || "-";
      },
    },
    {
      accessorKey: "spo2",
      header: "SpO2",
      cell: ({ row }) => row.original.spo2 || "-",
    },
    {
      accessorKey: "temperature",
      header: "Temperature",
      cell: ({ row }) => row.original.temperature || "-",
    },
    {
      accessorKey: "height",
      header: "Height",
      cell: ({ row }) => row.original.height || "-",
    },
    {
      accessorKey: "weight",
      header: "Weight",
      cell: ({ row }) => row.original.weight || "-",
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex gap-1 justify-center">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => openEdit(row.original)}
          >
            <Pencil className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleDelete(row.original.id)}
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

  /* ===================== CRUD HANDLERS ===================== */

  const openEdit = (r: RegistrationRecord) => {
    setEditing(r);
    setFirstName(r.firstName);
    setMiddleName(r.middleName);
    setLastName(r.lastName);
    setSex(r.sex);
    setDob(r.dob ?? undefined);
    setMobile(r.mobile);
    setPlaceOfBirth(r.placeOfBirth);
    setAddress(r.address);
    setNationality(r.nationality);
    setCompany(r.company);
    setOccupation(r.occupation);
    setCivilStatus(r.civilStatus);
    setIsEditOpen(true);
    setSpo2(r.spo2);
    setTemperature(r.temperature);
    setHeight(r.height);
    setWeight(r.weight);
  };

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
    setSpo2("");
    setTemperature("");
    setHeight("");
    setWeight("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      firstName,
      middleName,
      lastName,
      sex,
      dateOfBirth: dob ? dob.toISOString() : null,
      mobile,
      placeOfBirth: cap255(placeOfBirth),
      address: cap255(address),
      nationality,
      company,
      occupation,
      civilStatus,
      spo2,
      temperature,
      height,
      weight,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editing) {
        const ref = doc(firestore, COLLECTION, editing.id);
        await updateDoc(ref, payload);
      } else {
        await addDoc(collection(firestore, COLLECTION), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setPageIndex(0);
      }
      await fetchRecords();
      setIsEditOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error saving record:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await deleteDoc(doc(firestore, COLLECTION, id));
      setData((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting record:", err);
    }
  };

  /* ===================== RENDER ===================== */

  return (
    <div className="w-full p-3 bg-white">
      {/* BACK LINK */}
      <div className="absolute top-4 left-4 mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      {/* HEADER & CONTROLS */}
      <div className="flex justify-between items-center mt-4 mb-4">
        <h4 className="text-xl font-semibold">Patient Records</h4>

        <div className="flex gap-4 flex-wrap items-center">
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

          {/* YEAR FILTER */}
          {availableYears.length > 0 && (
            <Select
              value={yearFilter}
              onValueChange={(v) => {
                setYearFilter(v);
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Years</SelectItem>
                {availableYears.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* ROWS PER PAGE */}
          <Select
            value={pageSize === filtered.length ? "all" : pageSize.toString()}
            onValueChange={(val) => {
              setPageIndex(0);
              setPageSize(val === "all" ? filtered.length || 1 : Number(val));
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
                <SheetDescription>Fill in all fields as needed</SheetDescription>
              </SheetHeader>

              <form className="mt-4 space-y-4" onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="s_firstName">First Name</Label>
                      <Input
                        id="s_firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                        className="hover:border-blue-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="s_lastName">Last Name</Label>
                      <Input
                        id="s_lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                        className="hover:border-blue-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="s_middleName">Middle Name</Label>
                      <Input
                        id="s_middleName"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        placeholder="Enter middle name"
                        className="hover:border-blue-700"
                      />
                    </div>
                    <div>
                      <Label>Sex</Label>
                      <Select
                        value={sex}
                        onValueChange={(v: SexValue) => setSex(v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                        <PopoverContent className="w-auto p-0 bg-white" align="start">
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
                      <Label htmlFor="s_mobile">Mobile Number</Label>
                      <Input
                        id="s_mobile"
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
                    <div>
                      <Label htmlFor="s_placeOfBirth">Place of Birth</Label>
                      <textarea
                        id="s_placeOfBirth"
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
                    <div>
                      <Label htmlFor="s_address">Current Address</Label>
                      <textarea
                        id="s_address"
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
                      <Label htmlFor="s_nationality">Nationality</Label>
                      <Input
                        id="s_nationality"
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        placeholder="Enter nationality"
                        className="hover:border-blue-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="s_company">Company</Label>
                      <textarea
                        id="s_company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        maxLength={100}
                        rows={2}
                        placeholder="Enter company"
                        className="w-full border rounded p-2 bg-white hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {company.length}/100
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="s_occupation">Occupation</Label>
                      <textarea
                        id="s_occupation"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        maxLength={100}
                        rows={2}
                        placeholder="Enter occupation"
                        className="w-full border rounded p-2 bg-white hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {occupation.length}/100
                      </p>
                    </div>
                    <div>
                      <Label>Civil Status</Label>
                      <Select
                        value={civilStatus}
                        onValueChange={(v: CivilStatusValue) => setCivilStatus(v)}
                      >
                        <SelectTrigger>
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

                  {/* Vital Signs — spans full width of the 2-col grid */}
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-semibold text-gray-700 border-t pt-4 mb-3">
                      Vital Signs
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="s_spo2">SpO2 (%)</Label>
                        <Input
                          id="s_spo2"
                          value={spo2}
                          onChange={(e) => setSpo2(e.target.value)}
                          placeholder="e.g. 98"
                          className="hover:border-blue-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="s_temperature">Temperature (°C)</Label>
                        <Input
                          id="s_temperature"
                          value={temperature}
                          onChange={(e) => setTemperature(e.target.value)}
                          placeholder="e.g. 36.6"
                          className="hover:border-blue-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="s_height">Height (cm)</Label>
                        <Input
                          id="s_height"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          placeholder="e.g. 165"
                          className="hover:border-blue-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="s_weight">Weight (kg)</Label>
                        <Input
                          id="s_weight"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="e.g. 60"
                          className="hover:border-blue-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-red-500 italic text-center mt-2">
                  ⚠️ Review your information before saving!
                </p>

                <div className="mt-4 space-y-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-black hover:bg-[#2C2C2C] text-white"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {editing ? "Updating…" : "Saving…"}
                      </span>
                    ) : editing ? (
                      "Update"
                    ) : (
                      "Save"
                    )}
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

      {/* LOADING STATE */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-gray-500">Loading records…</span>
        </div>
      ) : (
        <>
          {/* TABLE
              - outer div: overflow-x-auto enables horizontal scrolling
              - Table: w-max lets columns size to content; min-w-full fills
                the container when there's enough room               */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table className="w-max min-w-full bg-[#F3F3F3]">
              <TableHeader>
                {table.getHeaderGroups().map((g) => (
                  <TableRow key={g.id}>
                    {g.headers.map((h) => (
                      <TableHead
                        key={h.id}
                        className="bg-[#2C2C2C] text-white whitespace-nowrap"
                      >
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
                      className="text-center py-8 text-gray-400"
                    >
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        const key = (cell.column.columnDef as any)
                          .accessorKey as string | undefined;
                        const isResponsive = key
                          ? RESPONSIVE_COLS.has(key)
                          : false;
                        return (
                          <TableCell
                            key={cell.id}
                            className={
                              isResponsive
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
            <Pagination className="flex bg-white justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => table.previousPage()} />
                </PaginationItem>
                {Array.from({ length: table.getPageCount() }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={pageIndex === i}
                      onClick={() => table.setPageIndex(i)}
                    >
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
        </>
      )}
    </div>
  );
}