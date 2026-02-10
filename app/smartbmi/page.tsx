"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRegistrationStore } from "@/store/useRegistrationStore";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/database/firebaseConfig";
import { v4 as uuidv4 } from "uuid";

export default function SmartBMICards() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [spo2, setSpo2] = useState("");
  const [temperature, setTemperature] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const { registration, setVitals, reset } = useRegistrationStore();

  const handleSubmit = async () => {
    if (!height || !weight || !spo2 || !temperature) {
      setError("Please complete all fields before submitting.");
      return;
    }

    if (!registration) {
      setError("Registration data missing. Please restart.");
      return;
    }

    const vitalsData = {
      height,
      weight,
      spo2,
      temperature,
    };

    setVitals(vitalsData);

    try {
      const uuid = uuidv4();

      await setDoc(doc(firestore, "registrations", uuid), {
        ...registration,
        ...vitalsData,
        createdAt: serverTimestamp(),
      });

      setOpen(true);
      reset(); // clear Zustand after success
    } catch (err) {
      console.error(err);
      setError("Failed to submit data.");
    }
  };

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      handleClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    setHeight("");
    setWeight("");
    setSpo2("");
    setTemperature("");
  };

  const steps = [
    {
      title: "Step 1",
      description: "Weight Scale",
      image: "/img/steps/first.gif",
      placeholder: "Enter weight (kg)",
      value: weight,
      onChange: (e: any) => setWeight(e.target.value),
    },
    {
      title: "Step 2",
      description: "Height Measurement",
      image: "/img/steps/second.gif",
      placeholder: "Enter height (cm)",
      value: height,
      onChange: (e: any) => setHeight(e.target.value),
    },
    {
      title: "Step 3",
      description: "SpO₂",
      image: "/img/steps/third.gif",
      placeholder: "Enter SpO₂ (%)",
      value: spo2,
      onChange: (e: any) => setSpo2(e.target.value),
    },
    {
      title: "Step 4",
      description: "Temperature",
      image: "/img/steps/fourth.gif",
      placeholder: "Enter temperature (°C)",
      value: temperature,
      onChange: (e: any) => setTemperature(e.target.value),
    },
  ];

  return (
    <div className="p-4">
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>
      <h2 className="text-2xl font-bold mb-6 text-center">Smart BMI</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, index) => (
          <Card key={index} className="overflow-hidden bg-white flex flex-col">
            {step.image && (
              <img
                src={step.image}
                alt={step.title}
                className="w-full max-h-[100%] object-cover"
              />
            )}

            <CardHeader>
              <CardTitle>{step.title}</CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-grow" />

            <CardFooter className="flex flex-col items-start gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                {step.description}
              </label>
              <Input
                type="number"
                placeholder={step.placeholder}
                value={step.value}
                onChange={step.onChange}
              />
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
      )}

      {/* Submit button */}
      <div className="flex justify-center mt-6">
        <Button
          onClick={handleSubmit}
          className="px-8 bg-green-700 text-white hover:bg-green-800"
        >
          Submit
        </Button>
      </div>

      {/* Success Modal */}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="text-center bg-white">
          <DialogHeader>
            <DialogTitle className="text-green-600 text-xl">
              ✅ Transaction Done
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            All vitals have been successfully recorded.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
