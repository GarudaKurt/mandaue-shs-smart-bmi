"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft } from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation"
import { useRegistrationStore } from "@/store/useRegistrationStore";


const Registration = () => {
  const [date, setDate] = useState<Date | undefined>();
  const route = useRouter();
  const setRegistration = useRegistrationStore((s) => s.setRegistration);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    middleName: "",
    sex: "",
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
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  setRegistration({
    ...formData,
    dateOfBirth: date ? date.toISOString() : null,
  });

  route.push("/smartbmi");
};

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
        className="bg-white shadow-md rounded-lg p-8 w-full max-w-4xl"
      >
        <h2 className="text-2xl font-bold text-center mb-6">
          Registration Form
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            <div>
              <Label>Email address</Label>
              <Input
                id="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Middle Name</Label>
              <Input
                id="middleName"
                value={formData.middleName}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Sex</Label>
              <Select
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, sex: value }))
                }
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
                    variant="outline"
                    className={cn(
                      "w-full justify-between text-left font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    {date ? format(date, "PPP") : "Pick a date"}
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            <div>
              <Label>Mobile Number</Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Place of Birth</Label>
              <Input
                id="placeOfBirth"
                value={formData.placeOfBirth}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Current Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Nationality</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Occupation</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Civil Status</Label>
              <Select
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, civilStatus: value }))
                }
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
        </div>
        {/* Walk-in Radio Buttons */}
        <div className="mt-6 space-y-2">
          <Label className="text-base font-medium">Is Patient Walk-In?</Label>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isWalkIn"
                value="yes"
                checked={formData.isWalkIn === "yes"}
                onChange={() =>
                  setFormData((prev) => ({ ...prev, isWalkIn: "yes" }))
                }
                className="h-4 w-4 accent-green-600"
              />
              Yes
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isWalkIn"
                value="no"
                checked={formData.isWalkIn === "no"}
                onChange={() =>
                  setFormData((prev) => ({ ...prev, isWalkIn: "no" }))
                }
                className="h-4 w-4 accent-green-600"
              />
              No
            </label>
          </div>
        </div>

        <p className="text-red-500 italic text-center mt-6">
          ⚠️ Review your information before proceeding!
        </p>

        <div className="flex justify-center mt-6">
          <Button
            type="submit"
            className="bg-green-600 text-white hover:bg-green-700 px-8 py-3"
          >
            REGISTER
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Registration;
