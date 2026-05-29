import { create } from "zustand";

interface PredictionState {
  percentile: number | null;
  category: string;
  gender: string;
  year: number;
  setPercentile: (p: number | null) => void;
  setCategory: (c: string) => void;
  setGender: (g: string) => void;
  setYear: (y: number) => void;
  reset: () => void;
}

interface SavedCollege {
  id: string;
  name: string;
  slug: string;
  branchName: string;
  savedAt: Date;
}

interface AppState {
  theme: "light" | "dark";
  savedColleges: SavedCollege[];
  toggleTheme: () => void;
  saveCollege: (college: SavedCollege) => void;
  removeCollege: (id: string) => void;
}

export const usePredictionStore = create<PredictionState>((set) => ({
  percentile: null,
  category: "GOPENS",
  gender: "",
  year: 2024,
  setPercentile: (percentile) => set({ percentile }),
  setCategory: (category) => set({ category }),
  setGender: (gender) => set({ gender }),
  setYear: (year) => set({ year }),
  reset: () =>
    set({ percentile: null, category: "GOPENS", gender: "", year: 2024 }),
}));

export const useAppStore = create<AppState>((set) => ({
  theme: "light",
  savedColleges: [],
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    })),
  saveCollege: (college) =>
    set((state) => ({
      savedColleges: [...state.savedColleges, college],
    })),
  removeCollege: (id) =>
    set((state) => ({
      savedColleges: state.savedColleges.filter((c) => c.id !== id),
    })),
}));
