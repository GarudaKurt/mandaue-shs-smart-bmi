"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";
import { useRegistrationStore } from "@/store/useRegistrationStore";

/* ===================== TYPES ===================== */

type FormData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName: string;
  sex: string;
  dateOfBirth: string;
  mobile: string;
  placeOfBirth: string;
  address: string;
  nationality: string;
  company: string;
  occupation: string;
  civilStatus: string;
  isWalkIn: string;
  height: string;
  weight: string;
  spo2: string;
  temperature: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

/* ===================== HELPERS ===================== */

const REQUIRED_FIELDS: (keyof FormData)[] = [
  "email", "password", "firstName", "lastName", "middleName",
  "sex", "dateOfBirth", "mobile", "placeOfBirth", "address",
  "nationality", "company", "occupation", "civilStatus",
  "isWalkIn", "height", "weight", "spo2", "temperature",
];

const FIELD_LABELS: Record<keyof FormData, string> = {
  email: "Email address",
  password: "Password",
  firstName: "First Name",
  lastName: "Last Name",
  middleName: "Middle Name",
  sex: "Sex",
  dateOfBirth: "Date of Birth",
  mobile: "Mobile Number",
  placeOfBirth: "Place of Birth",
  address: "Current Address",
  nationality: "Nationality",
  company: "Company",
  occupation: "Occupation",
  civilStatus: "Civil Status",
  isWalkIn: "Is Patient Walk-In?",
  height: "Height",
  weight: "Weight",
  spo2: "SpO2",
  temperature: "Temperature",
};

function validate(formData: FormData): FormErrors {
  const errors: FormErrors = {};

  REQUIRED_FIELDS.forEach((field) => {
    if (!formData[field]?.trim()) {
      errors[field] = `${FIELD_LABELS[field]} is required.`;
    }
  });

  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (formData.dateOfBirth?.trim()) {
    const dobRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    if (!dobRegex.test(formData.dateOfBirth)) {
      errors.dateOfBirth = "Please enter a valid date (MM/DD/YYYY).";
    } else {
      const parsed = new Date(formData.dateOfBirth);
      if (isNaN(parsed.getTime()) || parsed > new Date()) {
        errors.dateOfBirth = "Please enter a valid past date.";
      }
    }
  }

  return errors;
}

/* ===================== ERROR MESSAGE COMPONENT ===================== */

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}

/* ===================== COMPONENT ===================== */

const Registration = () => {
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const route = useRouter();
  const setRegistration = useRegistrationStore((s) => s.setRegistration);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    middleName: "",
    sex: "",
    dateOfBirth: "",
    mobile: "",
    placeOfBirth: "",
    address: "",
    nationality: "",
    company: "",
    occupation: "",
    civilStatus: "",
    isWalkIn: "",
    height: "",
    weight: "",
    spo2: "",
    temperature: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const updated = { ...formData, [id]: value };
    setFormData(updated);
    if (submitted) setErrors(validate(updated));
  };

  // Auto-inserts slashes: digits only → MM/DD/YYYY
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/\D/g, "").slice(0, 8);
    let formatted = digits;
    if (digits.length >= 3) formatted = digits.slice(0, 2) + "/" + digits.slice(2);
    if (digits.length >= 5) formatted = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
    const updated = { ...formData, dateOfBirth: formatted };
    setFormData(updated);
    if (submitted) setErrors(validate(updated));
  };

  const handleSelectChange = (field: keyof FormData) => (value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (submitted) setErrors(validate(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorEl = document.querySelector("[data-error='true']");
      firstErrorEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setRegistration({
      ...formData,
      dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
    });

    route.push("/smartbmi");
  };

  const err = (field: keyof FormData) => (submitted ? errors[field] : undefined);

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white shadow-md rounded-lg p-8 w-full max-w-4xl"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Registration Form</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            <div data-error={!!err("email")}>
              <Label>Email address <span className="text-red-500">*</span></Label>
              <Input id="email" type="email" value={formData.email} onChange={handleChange}
                className={cn(err("email") && "border-red-500 focus-visible:ring-red-500")} />
              <FieldError message={err("email")} />
            </div>

            <div data-error={!!err("password")}>
              <Label>Password <span className="text-red-500">*</span></Label>
              <Input id="password" type="password" value={formData.password} onChange={handleChange}
                className={cn(err("password") && "border-red-500 focus-visible:ring-red-500")} />
              <FieldError message={err("password")} />
            </div>

            <div data-error={!!err("firstName")}>
              <Label>First Name <span className="text-red-500">*</span></Label>
              <Input id="firstName" value={formData.firstName} onChange={handleChange}
                className={cn(err("firstName") && "border-red-500 focus-visible:ring-red-500")} />
              <FieldError message={err("firstName")} />
            </div>

            <div data-error={!!err("lastName")}>
              <Label>Last Name <span className="text-red-500">*</span></Label>
              <Input id="lastName" value={formData.lastName} onChange={handleChange}
                className={cn(err("lastName") && "border-red-500 focus-visible:ring-red-500")} />
              <FieldError message={err("lastName")} />
            </div>

            <div data-error={!!err("middleName")}>
              <Label>Middle Name <span className="text-red-500">*</span></Label>
              <Input id="middleName" value={formData.middleName} onChange={handleChange}
                className={cn(err("middleName") && "border-red-500 focus-visible:ring-red-500")} />
              <FieldError message={err("middleName")} />
            </div>

            <div data-error={!!err("sex")}>
              <Label>Sex <span className="text-red-500">*</span></Label>
              <Select onValueChange={handleSelectChange("sex")} value={formData.sex}>
                <SelectTrigger className={cn(err("sex") && "border-red-500 focus:ring-red-500")}>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FieldError message={err("sex")} />
            </div>

            <div data-error={!!err("dateOfBirth")}>
              <Label>Date of Birth <span className="text-red-500">*</span></Label>
              <Input
                id="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleDobChange}
                placeholder="MM/DD/YYYY"
                maxLength={10}
                className={cn(err("dateOfBirth") && "border-red-500 focus-visible:ring-red-500")}
              />
              <FieldError message={err("dateOfBirth")} />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            <div data-error={!!err("mobile")}>
              <Label>Mobile Number <span className="text-red-500">*</span></Label>
              <Input id="mobile" value={formData.mobile} onChange={handleChange}
                className={cn(err("mobile") && "border-red-500 focus-visible:ring-red-500")} />
              <FieldError message={err("mobile")} />
            </div>

            <div data-error={!!err("placeOfBirth")}>
              <Label>Place of Birth <span className="text-red-500">*</span></Label>
              <Input id="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange}
                className={cn(err("placeOfBirth") && "border-red-500 focus-visible:ring-red-500")} />
              <FieldError message={err("placeOfBirth")} />
            </div>

            <div data-error={!!err("address")}>
              <Label>Current Address <span className="text-red-500">*</span></Label>
              <Input id="address" value={formData.address} onChange={handleChange}
                className={cn(err("address") && "border-red-500 focus-visible:ring-red-500")} />
              <FieldError message={err("address")} />
            </div>

            <div data-error={!!err("nationality")}>
              <Label>Nationality <span className="text-red-500">*</span></Label>
              <Input id="nationality" value={formData.nationality} onChange={handleChange}
                className={cn(err("nationality") && "border-red-500 focus-visible:ring-red-500")} />
              <FieldError message={err("nationality")} />
            </div>

            <div data-error={!!err("company")}>
              <Label>Company <span className="text-red-500">*</span></Label>
              <Input id="company" value={formData.company} onChange={handleChange}
                className={cn(err("company") && "border-red-500 focus-visible:ring-red-500")} />
              <FieldError message={err("company")} />
            </div>

            <div data-error={!!err("occupation")}>
              <Label>Occupation <span className="text-red-500">*</span></Label>
              <Input id="occupation" value={formData.occupation} onChange={handleChange}
                className={cn(err("occupation") && "border-red-500 focus-visible:ring-red-500")} />
              <FieldError message={err("occupation")} />
            </div>

            <div data-error={!!err("civilStatus")}>
              <Label>Civil Status <span className="text-red-500">*</span></Label>
              <Select onValueChange={handleSelectChange("civilStatus")} value={formData.civilStatus}>
                <SelectTrigger className={cn(err("civilStatus") && "border-red-500 focus:ring-red-500")}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                  <SelectItem value="separated">Separated</SelectItem>
                </SelectContent>
              </Select>
              <FieldError message={err("civilStatus")} />
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2" data-error={!!err("isWalkIn")}>
          <Label className="text-base font-medium">
            Is Patient Walk-In? <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="isWalkIn" value="yes"
                checked={formData.isWalkIn === "yes"}
                onChange={() => handleSelectChange("isWalkIn")("yes")}
                className="h-4 w-4 accent-green-600" />
              Yes
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="isWalkIn" value="no"
                checked={formData.isWalkIn === "no"}
                onChange={() => handleSelectChange("isWalkIn")("no")}
                className="h-4 w-4 accent-green-600" />
              No
            </label>
          </div>
          <FieldError message={err("isWalkIn")} />
        </div>

        <p className="text-red-500 italic text-center mt-6">
          ⚠️ Review your information before proceeding!
        </p>

        <div className="flex justify-center mt-6">
          <Button type="submit" className="bg-green-600 text-white hover:bg-green-700 px-8 py-3">
            REGISTER
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Registration;