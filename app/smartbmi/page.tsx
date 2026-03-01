"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardFooter,
  CardTitle,
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
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { firestore, database } from "@/database/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { v4 as uuidv4 } from "uuid";

const STALE_THRESHOLD_MS = 10_000;

export default function SmartBMICards() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [spo2, setSpo2] = useState("");
  const [temperature, setTemperature] = useState("");
  const [isStale, setIsStale] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const staleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { registration, setVitals, reset } = useRegistrationStore();

  const clearFields = () => {
    setWeight("");
    setHeight("");
    setSpo2("");
    setTemperature("");
    setIsStale(true);
  };

  const resetStaleTimer = () => {
    if (staleTimerRef.current) clearTimeout(staleTimerRef.current);
    setIsStale(false);
    staleTimerRef.current = setTimeout(() => {
      clearFields();
    }, STALE_THRESHOLD_MS);
  };

  useEffect(() => {
    const updatedAtRef = ref(database, "/smartbmi/updatedAt");
    const weightRef = ref(database, "/smartbmi/weight");
    const heightRef = ref(database, "/smartbmi/height");
    const spo2Ref = ref(database, "/smartbmi/spo2");
    const temperatureRef = ref(database, "/smartbmi/temperature");

    const unsubUpdatedAt = onValue(updatedAtRef, (snapshot) => {
      const updatedAt: number | null = snapshot.val();
      if (updatedAt === null) { clearFields(); return; }
      const age = Date.now() - updatedAt;
      if (age > STALE_THRESHOLD_MS) { clearFields(); } else { resetStaleTimer(); }
    });

    const unsubWeight = onValue(weightRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null) setWeight(String(val));
    });
    const unsubHeight = onValue(heightRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null) setHeight(String(val));
    });
    const unsubSpo2 = onValue(spo2Ref, (snapshot) => {
      const val = snapshot.val();
      if (val !== null) setSpo2(String(val));
    });
    const unsubTemperature = onValue(temperatureRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null) setTemperature(String(val));
    });

    return () => {
      unsubUpdatedAt();
      unsubWeight();
      unsubHeight();
      unsubSpo2();
      unsubTemperature();
      if (staleTimerRef.current) clearTimeout(staleTimerRef.current);
    };
  }, []);

  const handleSubmit = async () => {
    setTouched(true);

    if (!height || !weight || !spo2 || !temperature) {
      setError("Please complete all fields before submitting.");
      return;
    }

    if (!registration) {
      setError("Registration data missing. Please restart.");
      return;
    }

    setError(""); 
    const vitalsData = { height, weight, spo2, temperature };
    setVitals(vitalsData);

    try {
      if (registration.docId) {
        await updateDoc(doc(firestore, "registrations", registration.docId), {
          ...vitalsData,
          updatedAt: serverTimestamp(),
        });
      } else {
        const uuid = uuidv4();
        await setDoc(doc(firestore, "registrations", uuid), {
          ...registration,
          ...vitalsData,
          createdAt: serverTimestamp(),
        });
      }

      setOpen(true);
      setTouched(false);
      reset();
    } catch (err) {
      console.error(err);
      setError("Failed to submit data.");
    }
  };

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => handleClose(), 3000);
    return () => clearTimeout(timer);
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    setHeight("");
    setWeight("");
    setSpo2("");
    setTemperature("");
  };

  const fieldClass = (value: string) =>
    touched && !value
      ? "border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500"
      : "";

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
    <div className="px-3 py-3 max-w-3xl mx-auto">
      {/* Back button */}
      <div className="mb-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </Link>
      </div>

      <h2 className="text-lg font-bold mb-3 text-center">Smart BMI</h2>

      {/* Stale warning */}
      {isStale && (
        <p className="text-yellow-600 text-xs text-center mb-3 bg-yellow-50 border border-yellow-200 rounded px-3 py-1.5">
          ⚠️ Waiting for new sensor data...
        </p>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {steps.map((step, index) => (
          <Card
            key={index}
            className={`overflow-hidden rounded-xl bg-white flex flex-col shadow-sm ${
              touched && !step.value ? "ring-2 ring-red-400" : "" // ✅ highlight entire card if empty
            }`}
          >
            {step.image && (
              <img
                src={step.image}
                alt={step.description}
                className="w-full h-48 object-cover"
              />
            )}

            <CardContent className="px-2.5 pt-2 pb-0">
              <p className="text-xs font-semibold text-gray-800">{step.title}</p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {step.description}
              </p>
            </CardContent>

            <CardFooter className="px-2.5 pt-1.5 pb-2.5 flex flex-col items-start gap-1 mt-auto">
              <Input
                type="number"
                placeholder={step.placeholder}
                value={step.value}
                onChange={step.onChange}
                className={`h-7 text-xs px-2 ${fieldClass(step.value)}`} // ✅ red border on empty input
                required
              />
              {/* ✅ Inline per-field error message */}
              {touched && !step.value && (
                <p className="text-[10px] text-red-500 leading-tight">
                  This field is required.
                </p>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-3 text-center">{error}</p>
      )}

      <div className="flex justify-center mt-4">
        <Button
          onClick={handleSubmit}
          className="px-6 h-8 text-xs bg-green-700 text-white hover:bg-green-800"
        >
          Submit
        </Button>
      </div>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="text-center bg-white max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-green-600 text-base">
              ✅ Transaction Done
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            All vitals have been successfully recorded.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}