"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { firestore } from "@/database/firebaseConfig";
import { useRouter } from "next/navigation"

export default function LoginModal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const route = useRouter()

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!email || !password) {
    alert("Email and password required");
    return;
  }

  try {
    const q = query(
      collection(firestore, "registrations"),
      where("email", "==", email)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert("Account not found");
      return;
    }

    const userData = snapshot.docs[0].data();

    if (userData.password !== password) {
      alert("Invalid password");
      return;
    }

    console.log("Login success:", userData);

    // optional
    // setRegistration(userData);
    alert('Success login!')
    route.push("/smartbmi");

  } catch (err) {
    console.error("Login error:", err);
    alert("Login failed");
  }
};


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-teal-700 hover:bg-teal-700 text-white rounded-2xl px-6">
          LOGIN
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white sm:max-w-[400px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Welcome Back
          </DialogTitle>
        </DialogHeader>

        <Card className="border-none shadow-none">
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-green-700 hover:bg-green-800 text-white rounded-xl"
              >
                Sign In
              </Button>

              {/* Register */}
              <p className="text-center text-sm text-gray-600">
                Don’t have an account?{" "}
                <Link
                  href="/new-patient"
                  className="text-teal-700 hover:underline font-medium"
                >
                  Register
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
