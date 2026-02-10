import { create } from "zustand";

type RegistrationData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName: string;
  sex: string;
  mobile: string;
  placeOfBirth: string;
  address: string;
  nationality: string;
  company: string;
  occupation: string;
  civilStatus: string;
  isWalkIn: string;
  dateOfBirth: string | null;
};

type VitalsData = {
  height: string;
  weight: string;
  spo2: string;
  temperature: string;
};

type Store = {
  registration: RegistrationData | null;
  vitals: VitalsData | null;
  setRegistration: (data: RegistrationData) => void;
  setVitals: (data: VitalsData) => void;
  reset: () => void;
};

export const useRegistrationStore = create<Store>((set) => ({
  registration: null,
  vitals: null,

  setRegistration: (data) => set({ registration: data }),
  setVitals: (data) => set({ vitals: data }),

  reset: () => set({ registration: null, vitals: null }),
}));
