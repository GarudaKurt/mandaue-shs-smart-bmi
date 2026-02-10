import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import LoginModal from "./(auth)/sign-in/page";
export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
   
      <div className="w-40 sm:w-56 md:w-72 lg:w-96 mb-4">
        <Image
          src="/img/main.png"
          alt="ConnectiveCare Logo"
          width={500}
          height={500}
          className="w-full h-auto"
          priority
        />
      </div>

      {/* Subtitle */}
      <p className="mt-2 text-gray-600 text-sm sm:text-base md:text-lg">
        Please select your user type to continue
      </p>

      {/* Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link href="/new-patient">
          <Button className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-2xl w-full sm:w-auto">
            NEW PATIENT
          </Button>
        </Link>
          <LoginModal />
      </div>
    </div>
  );
}
