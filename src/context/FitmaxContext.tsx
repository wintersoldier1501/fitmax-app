"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export type Goal = "Perder Grasa" | "Recomposición Corporal" | "Subir de Peso Limpio";
export type Activity = "Sedentario" | "Ligero" | "Moderado" | "Intenso";
export type Budget = "Económico" | "Estándar" | "Premium";

export interface UserProfile {
  name: string;
  sex: string; // "H" | "M"
  age: number;
  height: number;
  weight: number;
  neck?: number;
  waist?: number;
  hip?: number;
  targetWeight: number;
  goal: Goal | "";
  activityLevel: Activity | "";
  budget?: Budget;
  avatar?: string;
}

export interface Macros {
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
}

export interface FoodLog {
  id: string;
  name: string;
  macros: Macros;
  time: string;
  image?: string;
}

export interface Biometrics {
  bodyFatPercentage: number | null;
  leanMass: number | null;
}

export interface DailyHistoryEntry {
  date: string; // YYYY-MM-DD
  calories: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  waterGlasses: number;
  steps?: number;
  weight?: number;
  workoutsCompleted: number;
  totalVolumeKg: number;
  readinessScore?: number;
}

export interface WeightEntry {
  date: string;
  weight: number;
  bodyFat?: number;
}

export interface ReadinessLog {
  date: string;
  sleepHours: number;
  sleepQuality: number;
  fatigue: number;
  soreness: number;
  score: number;
  note: string;
}

export interface SetRecord {
  weight: number;
  reps: number;
  completed: boolean;
  isPR?: boolean;
}

export interface ExerciseSessionRecord {
  name: string;
  muscle: string;
  sets: SetRecord[];
  best1RM: number;
  baseBodyweightKg?: number;
}

export interface WorkoutSessionLog {
  id: string;
  date: string;
  workoutName: string;
  durationMinutes: number;
  totalVolumeKg: number;
  prsCount: number;
  musclesWorked: string[];
  exercises: ExerciseSessionRecord[];
}

export interface ExercisePR {
  weight: number;
  reps: number;
  best1RM: number;
  date: string;
}

export interface SupplementState {
  date: string;
  creatine: boolean;
  caffeine: boolean;
  omega3: boolean;
  electrolytes: boolean;
}

export type SupplementKey = "creatine" | "caffeine" | "omega3" | "electrolytes";

export interface SocialCalorieBank {
  date: string; // YYYY-MM-DD (valid only for today)
  active: boolean;
  reservedCalories: number;
  eventName: string;
  released: boolean; // false = banked during daytime; true = unlocked for event
}

export interface CardioSessionLog {
  id: string;
  date: string;
  type: "Zona 2" | "Running" | "HIIT" | "Caminata Inclinada";
  durationMin: number;
  distanceKm?: number;
  caloriesBurned: number;
}

export interface PhysiquePhoto {
  id: string;
  date: string;
  weight?: number;
  bodyFatEst?: string;
  notes?: string;
  image: string;
}

export interface ToastItem {
  id: string;
  message: string;
  type: "success" | "xp" | "warning" | "error";
}

export interface LevelUpInfo {
  rankName: string;
  xp: number;
}

interface FitmaxState {
  isLoaded: boolean;
  profile: UserProfile;
  targetMacros: Macros;
  currentMacros: Macros;
  loggedFoods: FoodLog[];
  favoriteMeals: FoodLog[];
  yesterdayFoods: FoodLog[];
  biometrics: Biometrics;
  activeTheme: string;
  xp: number;
  streak: number;
  streakShields: number;
  lastActiveDate: string;
  dailyHistory: DailyHistoryEntry[];
  weightHistory: WeightEntry[];
  workoutHistory: WorkoutSessionLog[];
  exercisePRs: Record<string, ExercisePR>;
  todayReadiness: ReadinessLog | null;
  todaySupplements: SupplementState;
  todaySocialBank: SocialCalorieBank | null;
  creatineStreak: number;
  dailySteps: number;
  stepsGoal: number;
  cardioHistory: CardioSessionLog[];
  trifectaClaimedDate: string;
  physiquePhotos: PhysiquePhoto[];
  toasts: ToastItem[];
  levelUpInfo: LevelUpInfo | null;
  showToast: (message: string, type?: ToastItem["type"]) => void;
  dismissToast: (id: string) => void;
  closeLevelUp: () => void;
  setProfileAndCalculate: (profileData: UserProfile) => void;
  adjustTargetCalories: (delta: number, reason?: string) => void;
  updateAvatar: (base64String: string) => void;
  updateName: (newName: string) => void;
  addFoodLog: (food: FoodLog) => void;
  updateFoodLog: (id: string, updatedMacros: Macros, updatedName?: string) => void;
  removeFoodLog: (id: string) => void;
  exportBackupData: () => string;
  importBackupData: (rawJson: string) => boolean;
  toggleFavoriteMeal: (food: FoodLog) => void;
  repeatYesterdayMeals: () => void;
  waterGlasses: number;
  addWater: () => void;
  removeWater: () => void;
  addXp: (amount: number, label?: string) => void;
  saveTheme: (theme: string) => void;
  customDiet: any;
  saveDiet: (diet: any) => void;
  customWorkoutPlan: any;
  saveWorkoutPlan: (plan: any) => void;
  logWorkoutSession: (session: Omit<WorkoutSessionLog, "id" | "date">) => void;
  getLastExercisePerformance: (exerciseName: string) => SetRecord[] | null;
  saveReadinessLog: (data: Omit<ReadinessLog, "date" | "score">) => void;
  toggleSupplement: (key: SupplementKey) => void;
  activateSocialBank: (reservedCalories: number, eventName?: string) => void;
  releaseSocialBank: () => void;
  cancelSocialBank: () => void;
  updateDailySteps: (steps: number) => void;
  logCardioSession: (session: Omit<CardioSessionLog, "id" | "date">) => void;
  claimDailyTrifecta: () => void;
  addPhysiquePhoto: (photo: Omit<PhysiquePhoto, "id">) => Promise<void>;
  removePhysiquePhoto: (id: string) => void;
  resetProgress: () => void;
  user: User | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  lastResetDate: string;
}

export const RANKS = [
  "Hierro I",
  "Hierro II",
  "Hierro III",
  "Bronce I",
  "Plata",
  "Oro",
  "Titán",
  "Leyenda Fitmax"
];

const defaultProfile: UserProfile = {
  name: "",
  sex: "",
  age: 0,
  height: 0,
  weight: 0,
  targetWeight: 0,
  goal: "",
  activityLevel: "",
  budget: "Económico"
};

const defaultMacros: Macros = { protein: 0, carbs: 0, fats: 0, calories: 0 };

const defaultSupplements = (dateISO: string): SupplementState => ({
  date: dateISO,
  creatine: false,
  caffeine: false,
  omega3: false,
  electrolytes: false
});

const FitmaxContext = createContext<FitmaxState | undefined>(undefined);

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getLocalISODate(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function diffDaysISO(fromISO: string, toISO: string): number {
  if (!fromISO || !toISO) return 999;
  const from = new Date(`${fromISO}T00:00:00`);
  const to = new Date(`${toISO}T00:00:00`);
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function compressThumbnail(dataUrl: string, maxDim = 180, quality = 0.55): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !dataUrl.startsWith("data:image")) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height >= width && height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const webp = canvas.toDataURL("image/webp", quality);
      if (webp.startsWith("data:image/webp")) {
        resolve(webp);
      } else {
        resolve(canvas.toDataURL("image/jpeg", quality));
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export const FitmaxProvider = ({ children }: { children: ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [targetMacros, setTargetMacros] = useState<Macros>(defaultMacros);
  const [currentMacros, setCurrentMacros] = useState<Macros>(defaultMacros);
  const [loggedFoods, setLoggedFoods] = useState<FoodLog[]>([]);
  const [favoriteMeals, setFavoriteMeals] = useState<FoodLog[]>([]);
  const [yesterdayFoods, setYesterdayFoods] = useState<FoodLog[]>([]);
  const [customDiet, setCustomDiet] = useState<any>(null);
  const [customWorkoutPlan, setCustomWorkoutPlan] = useState<any>(null);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [streakShields, setStreakShields] = useState(1);
  const [lastActiveDate, setLastActiveDate] = useState("");
  const [biometrics, setBiometrics] = useState<Biometrics>({ bodyFatPercentage: null, leanMass: null });
  const [activeTheme, setActiveTheme] = useState("light");
  const [user, setUser] = useState<User | null>(null);
  const [lastResetDate, setLastResetDate] = useState(new Date().toDateString());
  const [waterGlasses, setWaterGlasses] = useState(0);

  const [dailyHistory, setDailyHistory] = useState<DailyHistoryEntry[]>([]);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSessionLog[]>([]);
  const [exercisePRs, setExercisePRs] = useState<Record<string, ExercisePR>>({});
  const [todayReadiness, setTodayReadiness] = useState<ReadinessLog | null>(null);

  const [todaySupplements, setTodaySupplements] = useState<SupplementState>(() => defaultSupplements(getLocalISODate()));
  const [todaySocialBank, setTodaySocialBank] = useState<SocialCalorieBank | null>(null);
  const [socialXpDate, setSocialXpDate] = useState("");
  const [creatineStreak, setCreatineStreak] = useState(0);
  const [lastCreatineDate, setLastCreatineDate] = useState("");
  const [dailySteps, setDailySteps] = useState(0);
  const [stepsGoal] = useState(10000);
  const [stepsXpDate, setStepsXpDate] = useState("");
  const [cardioHistory, setCardioHistory] = useState<CardioSessionLog[]>([]);
  const [trifectaClaimedDate, setTrifectaClaimedDate] = useState("");
  const [physiquePhotos, setPhysiquePhotos] = useState<PhysiquePhoto[]>([]);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [levelUpInfo, setLevelUpInfo] = useState<LevelUpInfo | null>(null);

  const isCloudLoaded = useRef(false);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastItem["type"] = "success") => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }, []);

  const closeLevelUp = useCallback(() => {
    setLevelUpInfo(null);
  }, []);

  // Load from localStorage on mount & perform midnight history archiving
  useEffect(() => {
    const todayStr = new Date().toDateString();
    const todayISO = getLocalISODate();

    const savedProfile = safeParse<UserProfile>(localStorage.getItem("fitmax_profile"), defaultProfile);
    const savedTarget = safeParse<Macros>(localStorage.getItem("fitmax_targetMacros"), defaultMacros);
    const savedCurrent = safeParse<Macros>(localStorage.getItem("fitmax_currentMacros"), defaultMacros);
    const savedLogs = safeParse<FoodLog[]>(localStorage.getItem("fitmax_loggedFoods"), []);
    const savedFavorites = safeParse<FoodLog[]>(localStorage.getItem("fitmax_favoriteMeals"), []);
    let savedYesterday = safeParse<FoodLog[]>(localStorage.getItem("fitmax_yesterdayFoods"), []);
    const savedDiet = safeParse<any>(localStorage.getItem("fitmax_customDiet"), null);
    const savedWorkoutPlan = safeParse<any>(localStorage.getItem("fitmax_customWorkoutPlan"), null);
    const savedXp = Number(localStorage.getItem("fitmax_xp") || 0);
    const savedStreak = Number(localStorage.getItem("fitmax_streak") || 0);
    const savedShieldsRaw = localStorage.getItem("fitmax_streakShields");
    const savedShields = savedShieldsRaw !== null ? Number(savedShieldsRaw) : 1;
    const savedLastActive = localStorage.getItem("fitmax_lastActiveDate") || "";
    const savedBiometrics = safeParse<Biometrics>(localStorage.getItem("fitmax_biometrics"), { bodyFatPercentage: null, leanMass: null });
    const savedTheme = localStorage.getItem("fitmax_theme") || "light";
    const savedResetDate = localStorage.getItem("fitmax_lastResetDate");
    const savedWater = Number(localStorage.getItem("fitmax_water") || 0);

    let savedDailyHistory = safeParse<DailyHistoryEntry[]>(localStorage.getItem("fitmax_dailyHistory"), []);
    const savedWeightHistory = safeParse<WeightEntry[]>(localStorage.getItem("fitmax_weightHistory"), []);
    const savedWorkoutHistory = safeParse<WorkoutSessionLog[]>(localStorage.getItem("fitmax_workoutHistory"), []);
    const savedExercisePRs = safeParse<Record<string, ExercisePR>>(localStorage.getItem("fitmax_exercisePRs"), {});
    const savedReadiness = safeParse<ReadinessLog | null>(localStorage.getItem("fitmax_todayReadiness"), null);

    const savedSupps = safeParse<SupplementState>(localStorage.getItem("fitmax_todaySupplements"), defaultSupplements(todayISO));
    const savedSocialBank = safeParse<SocialCalorieBank | null>(localStorage.getItem("fitmax_socialBank"), null);
    const savedSocialXpDate = localStorage.getItem("fitmax_socialXpDate") || "";
    const savedCreatineStreak = Number(localStorage.getItem("fitmax_creatineStreak") || 0);
    const savedLastCreatineDate = localStorage.getItem("fitmax_lastCreatineDate") || "";
    const savedSteps = Number(localStorage.getItem("fitmax_dailySteps") || 0);
    const savedStepsXpDate = localStorage.getItem("fitmax_stepsXpDate") || "";
    const savedCardio = safeParse<CardioSessionLog[]>(localStorage.getItem("fitmax_cardioHistory"), []);
    const savedTrifecta = localStorage.getItem("fitmax_trifectaClaimedDate") || "";
    const savedPhotos = safeParse<PhysiquePhoto[]>(localStorage.getItem("fitmax_physiquePhotos"), []);

    setProfile(savedProfile);
    setTargetMacros(savedTarget);
    setFavoriteMeals(savedFavorites);
    setCustomDiet(savedDiet);
    setCustomWorkoutPlan(savedWorkoutPlan);
    setXp(isNaN(savedXp) ? 0 : savedXp);
    setStreak(isNaN(savedStreak) ? 0 : savedStreak);
    setStreakShields(isNaN(savedShields) ? 1 : savedShields);
    setLastActiveDate(savedLastActive);
    setBiometrics(savedBiometrics);
    setWeightHistory(savedWeightHistory);
    setWorkoutHistory(savedWorkoutHistory);
    setExercisePRs(savedExercisePRs);
    setSocialXpDate(savedSocialXpDate);
    setCreatineStreak(isNaN(savedCreatineStreak) ? 0 : savedCreatineStreak);
    setLastCreatineDate(savedLastCreatineDate);
    setStepsXpDate(savedStepsXpDate);
    setCardioHistory(savedCardio);
    setTrifectaClaimedDate(savedTrifecta);
    setPhysiquePhotos(savedPhotos);

    setActiveTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    if (savedResetDate && savedResetDate !== todayStr) {
      const prevDateObj = new Date(savedResetDate);
      const prevISO = !isNaN(prevDateObj.getTime()) ? getLocalISODate(prevDateObj) : getLocalISODate(new Date(Date.now() - 86400000));
      const dayWorkouts = savedWorkoutHistory.filter((w) => w.date === prevISO);

      if (savedCurrent.calories > 0 || savedWater > 0 || savedSteps > 0 || dayWorkouts.length > 0) {
        const archivedEntry: DailyHistoryEntry = {
          date: prevISO,
          calories: savedCurrent.calories,
          targetCalories: savedTarget.calories || 2000,
          protein: savedCurrent.protein,
          carbs: savedCurrent.carbs,
          fats: savedCurrent.fats,
          waterGlasses: savedWater,
          steps: savedSteps,
          weight: savedProfile.weight || undefined,
          workoutsCompleted: dayWorkouts.length,
          totalVolumeKg: dayWorkouts.reduce((acc, w) => acc + (w.totalVolumeKg || 0), 0),
          readinessScore: savedReadiness?.date === prevISO ? savedReadiness.score : undefined
        };
        savedDailyHistory = [
          ...savedDailyHistory.filter((e) => e.date !== prevISO),
          archivedEntry
        ].slice(-90);
      }

      if (savedLogs.length > 0) {
        savedYesterday = savedLogs.slice(0, 12);
        localStorage.setItem("fitmax_yesterdayFoods", JSON.stringify(savedYesterday));
      }

      setCurrentMacros(defaultMacros);
      setLoggedFoods([]);
      setWaterGlasses(0);
      setDailySteps(0);
      setTodayReadiness(null);
      setTodaySupplements(defaultSupplements(todayISO));
      setTodaySocialBank(null);
      setLastResetDate(todayStr);
      localStorage.removeItem("fitmax_water");
      localStorage.removeItem("fitmax_dailySteps");
      localStorage.removeItem("fitmax_todayReadiness");
      localStorage.removeItem("fitmax_socialBank");
    } else {
      setCurrentMacros(savedCurrent);
      setLoggedFoods(savedLogs);
      setWaterGlasses(isNaN(savedWater) ? 0 : savedWater);
      setDailySteps(isNaN(savedSteps) ? 0 : savedSteps);
      if (savedResetDate) setLastResetDate(savedResetDate);
      if (savedReadiness && savedReadiness.date === todayISO) {
        setTodayReadiness(savedReadiness);
      }
      if (savedSupps && savedSupps.date === todayISO) {
        setTodaySupplements(savedSupps);
      } else {
        setTodaySupplements(defaultSupplements(todayISO));
      }
      if (savedSocialBank && savedSocialBank.date === todayISO) {
        setTodaySocialBank(savedSocialBank);
      }
    }

    setYesterdayFoods(savedYesterday);
    setDailyHistory(savedDailyHistory);
    setIsLoaded(true);

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  // Handle Firebase Auth and Cloud Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const todayISO = getLocalISODate();
            if (data.profile) setProfile(data.profile);
            if (data.targetMacros) setTargetMacros(data.targetMacros);
            if (data.currentMacros) setCurrentMacros(data.currentMacros);
            if (data.loggedFoods) setLoggedFoods(data.loggedFoods);
            if (data.favoriteMeals) setFavoriteMeals(data.favoriteMeals);
            if (data.yesterdayFoods) setYesterdayFoods(data.yesterdayFoods);
            if (data.customDiet) setCustomDiet(data.customDiet);
            if (data.customWorkoutPlan) setCustomWorkoutPlan(data.customWorkoutPlan);
            if (data.xp !== undefined) setXp(data.xp);
            if (data.streak !== undefined) setStreak(data.streak);
            if (data.streakShields !== undefined) setStreakShields(data.streakShields);
            if (data.lastActiveDate) setLastActiveDate(data.lastActiveDate);
            if (data.waterGlasses !== undefined) setWaterGlasses(data.waterGlasses);
            if (data.dailySteps !== undefined) setDailySteps(data.dailySteps);
            if (data.creatineStreak !== undefined) setCreatineStreak(data.creatineStreak);
            if (data.lastCreatineDate) setLastCreatineDate(data.lastCreatineDate);
            if (data.cardioHistory) setCardioHistory(data.cardioHistory);
            if (data.trifectaClaimedDate) setTrifectaClaimedDate(data.trifectaClaimedDate);
            if (data.biometrics) setBiometrics(data.biometrics);
            if (data.dailyHistory) setDailyHistory(data.dailyHistory);
            if (data.weightHistory) setWeightHistory(data.weightHistory);
            if (data.workoutHistory) setWorkoutHistory(data.workoutHistory);
            if (data.exercisePRs) setExercisePRs(data.exercisePRs);
            if (data.todayReadiness && data.todayReadiness.date === todayISO) setTodayReadiness(data.todayReadiness);
            if (data.todaySupplements && data.todaySupplements.date === todayISO) setTodaySupplements(data.todaySupplements);
            if (data.todaySocialBank && data.todaySocialBank.date === todayISO) setTodaySocialBank(data.todaySocialBank);
            if (data.lastResetDate) setLastResetDate(data.lastResetDate);
            if (data.activeTheme) {
              setActiveTheme(data.activeTheme);
              document.documentElement.setAttribute("data-theme", data.activeTheme);
            }
          }
          isCloudLoaded.current = true;
        } catch (err) {
          console.error("Cloud fetch error:", err);
        }
      } else {
        isCloudLoaded.current = false;
      }
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast("Sesión iniciada con Google", "success");
    } catch (error: any) {
      if (error?.code === "auth/popup-blocked" || error?.code === "auth/cancelled-popup-request") {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr: any) {
          console.error("Google redirect failed", redirectErr);
        }
      }
      console.error("Google login failed", error);
      showToast("No se pudo iniciar sesión con Google", "error");
    }
  };

  const logout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  // Persist state to localStorage & Firestore (physiquePhotos stay strictly local to respect Firestore 1MB doc limit)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("fitmax_profile", JSON.stringify(profile));
      localStorage.setItem("fitmax_targetMacros", JSON.stringify(targetMacros));
      localStorage.setItem("fitmax_currentMacros", JSON.stringify(currentMacros));
      localStorage.setItem("fitmax_loggedFoods", JSON.stringify(loggedFoods.slice(0, 60)));
      localStorage.setItem("fitmax_favoriteMeals", JSON.stringify(favoriteMeals.slice(0, 20)));
      localStorage.setItem("fitmax_yesterdayFoods", JSON.stringify(yesterdayFoods.slice(0, 12)));
      localStorage.setItem("fitmax_customDiet", JSON.stringify(customDiet));
      localStorage.setItem("fitmax_customWorkoutPlan", JSON.stringify(customWorkoutPlan));
      localStorage.setItem("fitmax_xp", xp.toString());
      localStorage.setItem("fitmax_streak", streak.toString());
      localStorage.setItem("fitmax_streakShields", streakShields.toString());
      localStorage.setItem("fitmax_lastActiveDate", lastActiveDate);
      localStorage.setItem("fitmax_biometrics", JSON.stringify(biometrics));
      localStorage.setItem("fitmax_theme", activeTheme);
      localStorage.setItem("fitmax_lastResetDate", lastResetDate);
      localStorage.setItem("fitmax_water", waterGlasses.toString());
      localStorage.setItem("fitmax_dailySteps", dailySteps.toString());
      localStorage.setItem("fitmax_stepsXpDate", stepsXpDate);
      localStorage.setItem("fitmax_todaySupplements", JSON.stringify(todaySupplements));
      localStorage.setItem("fitmax_socialXpDate", socialXpDate);
      if (todaySocialBank) {
        localStorage.setItem("fitmax_socialBank", JSON.stringify(todaySocialBank));
      } else {
        localStorage.removeItem("fitmax_socialBank");
      }
      localStorage.setItem("fitmax_creatineStreak", creatineStreak.toString());
      localStorage.setItem("fitmax_lastCreatineDate", lastCreatineDate);
      localStorage.setItem("fitmax_cardioHistory", JSON.stringify(cardioHistory.slice(0, 40)));
      localStorage.setItem("fitmax_trifectaClaimedDate", trifectaClaimedDate);
      localStorage.setItem("fitmax_dailyHistory", JSON.stringify(dailyHistory.slice(-90)));
      localStorage.setItem("fitmax_weightHistory", JSON.stringify(weightHistory.slice(-90)));
      localStorage.setItem("fitmax_workoutHistory", JSON.stringify(workoutHistory.slice(-40)));
      localStorage.setItem("fitmax_exercisePRs", JSON.stringify(exercisePRs));
      localStorage.setItem("fitmax_physiquePhotos", JSON.stringify(physiquePhotos.slice(0, 12)));
      if (todayReadiness) {
        localStorage.setItem("fitmax_todayReadiness", JSON.stringify(todayReadiness));
      }

      if (user && isCloudLoaded.current) {
        setDoc(
          doc(db, "users", user.uid),
          {
            profile,
            targetMacros,
            currentMacros,
            loggedFoods: loggedFoods.slice(0, 35),
            favoriteMeals: favoriteMeals.slice(0, 15),
            yesterdayFoods: yesterdayFoods.slice(0, 10),
            customDiet,
            customWorkoutPlan,
            xp,
            streak,
            streakShields,
            lastActiveDate,
            waterGlasses,
            dailySteps,
            todaySupplements,
            todaySocialBank,
            creatineStreak,
            lastCreatineDate,
            cardioHistory: cardioHistory.slice(0, 30),
            trifectaClaimedDate,
            biometrics,
            activeTheme,
            lastResetDate,
            dailyHistory: dailyHistory.slice(-60),
            weightHistory: weightHistory.slice(-60),
            workoutHistory: workoutHistory.slice(-30),
            exercisePRs,
            todayReadiness
          },
          { merge: true }
        ).catch((err) => console.warn("Cloud sync error:", err));
      }
    } catch (storageErr) {
      console.warn("Storage quota warning:", storageErr);
    }
  }, [
    profile,
    targetMacros,
    currentMacros,
    loggedFoods,
    favoriteMeals,
    yesterdayFoods,
    customDiet,
    customWorkoutPlan,
    xp,
    streak,
    streakShields,
    lastActiveDate,
    waterGlasses,
    dailySteps,
    stepsXpDate,
    todaySupplements,
    todaySocialBank,
    socialXpDate,
    creatineStreak,
    lastCreatineDate,
    cardioHistory,
    trifectaClaimedDate,
    biometrics,
    activeTheme,
    lastResetDate,
    dailyHistory,
    weightHistory,
    workoutHistory,
    exercisePRs,
    physiquePhotos,
    todayReadiness,
    isLoaded,
    user
  ]);

  const addXp = useCallback((amount: number, label?: string) => {
    setXp((prev) => {
      const next = prev + amount;
      const prevRankIdx = Math.min(Math.floor(prev / 200), RANKS.length - 1);
      const nextRankIdx = Math.min(Math.floor(next / 200), RANKS.length - 1);
      if (nextRankIdx > prevRankIdx) {
        setLevelUpInfo({ rankName: RANKS[nextRankIdx], xp: next });
      }
      if (Math.floor(next / 500) > Math.floor(prev / 500)) {
        setStreakShields((s) => s + 1);
        showToast("🛡️ ¡Ganaste +1 Escudo de Racha!", "success");
      }
      return next;
    });
    showToast(`+${amount} XP${label ? ` • ${label}` : ""}`, "xp");
  }, [showToast]);

  const registerDailyActivity = useCallback(() => {
    const todayISO = getLocalISODate();
    if (lastActiveDate === todayISO) return;

    const gap = diffDaysISO(lastActiveDate, todayISO);
    if (!lastActiveDate) {
      setStreak(1);
      setLastActiveDate(todayISO);
      showToast("🔥 ¡Día 1 de Racha iniciado!", "success");
    } else if (gap === 1) {
      setStreak((prev) => {
        const next = prev + 1;
        showToast(`🔥 ¡Racha aumentada a ${next} días!`, "success");
        return next;
      });
      setLastActiveDate(todayISO);
    } else if (gap === 2 && streakShields > 0) {
      setStreakShields((s) => Math.max(0, s - 1));
      setStreak((prev) => prev + 1);
      setLastActiveDate(todayISO);
      showToast("🛡️ Escudo Criogénico usado: ¡Tu racha sigue viva!", "warning");
    } else {
      setStreak(1);
      setLastActiveDate(todayISO);
    }
  }, [lastActiveDate, streakShields, showToast]);

  const saveTheme = (theme: string) => {
    setActiveTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
    showToast("Tema visual aplicado", "success");
  };

  const setProfileAndCalculate = (profileData: UserProfile) => {
    const updatedProfile: UserProfile = {
      ...profileData,
      avatar: profileData.avatar ?? profile.avatar,
      budget: profileData.budget ?? profile.budget ?? "Económico"
    };
    setProfile(updatedProfile);

    let leanMass: number | null = null;
    let bfValid: number | null = null;

    if (updatedProfile.weight && updatedProfile.height && updatedProfile.neck && updatedProfile.waist) {
      let bf = 0;
      if (updatedProfile.sex === "M" && updatedProfile.hip && updatedProfile.waist + updatedProfile.hip - updatedProfile.neck > 0) {
        bf =
          495 /
            (1.29579 -
              0.35004 * Math.log10(updatedProfile.waist + updatedProfile.hip - updatedProfile.neck) +
              0.221 * Math.log10(updatedProfile.height)) -
          450;
      } else if (updatedProfile.waist - updatedProfile.neck > 0) {
        bf =
          495 /
            (1.0324 -
              0.19077 * Math.log10(updatedProfile.waist - updatedProfile.neck) +
              0.15456 * Math.log10(updatedProfile.height)) -
          450;
      }

      if (bf > 0) {
        bfValid = Math.max(3, Math.min(bf, 60));
        leanMass = updatedProfile.weight - updatedProfile.weight * (bfValid / 100);
        setBiometrics({
          bodyFatPercentage: Math.round(bfValid * 10) / 10,
          leanMass: Math.round(leanMass * 10) / 10
        });
      }
    }

    if (updatedProfile.weight > 0) {
      const todayISO = getLocalISODate();
      setWeightHistory((prev) => {
        const filtered = prev.filter((w) => w.date !== todayISO);
        return [
          ...filtered,
          {
            date: todayISO,
            weight: updatedProfile.weight,
            bodyFat: bfValid ? Math.round(bfValid * 10) / 10 : undefined
          }
        ].slice(-90);
      });
    }

    if (!updatedProfile.age || !updatedProfile.weight || !updatedProfile.height) return;

    let bmr = 0;
    if (leanMass !== null) {
      bmr = 370 + 21.6 * leanMass;
    } else {
      bmr = 10 * updatedProfile.weight + 6.25 * updatedProfile.height - 5 * updatedProfile.age;
      bmr += updatedProfile.sex === "H" ? 5 : -161;
    }

    const multipliers: Record<Activity, number> = {
      Sedentario: 1.2,
      Ligero: 1.375,
      Moderado: 1.55,
      Intenso: 1.725
    };
    const tdee = bmr * (multipliers[updatedProfile.activityLevel as Activity] || 1.2);

    let calories = tdee;
    if (updatedProfile.goal === "Perder Grasa") calories = tdee - 500;
    if (updatedProfile.goal === "Subir de Peso Limpio") calories = tdee + 300;

    const protein = Math.round(updatedProfile.weight * 2.0);
    const fats = Math.round(updatedProfile.weight * 0.9);
    const carbsCals = calories - protein * 4 - fats * 9;
    const carbs = Math.max(Math.round(carbsCals / 4), 50);

    setTargetMacros({
      calories: Math.round(calories),
      protein,
      carbs,
      fats
    });
  };

  const adjustTargetCalories = (delta: number, reason?: string) => {
    setTargetMacros((prev) => {
      const nextCals = Math.max(1200, (prev.calories || 2000) + delta);
      const carbDelta = Math.round(delta / 4);
      const nextCarbs = Math.max(40, (prev.carbs || 150) + carbDelta);
      return {
        ...prev,
        calories: nextCals,
        carbs: nextCarbs
      };
    });
    showToast(reason || `Objetivo calórico ajustado (${delta > 0 ? "+" : ""}${delta} kcal)`, "success");
  };

  const updateAvatar = async (base64String: string) => {
    const compressed = await compressThumbnail(base64String, 220, 0.65);
    setProfile((prev) => ({ ...prev, avatar: compressed }));
    showToast("Foto de perfil actualizada", "success");
  };

  const updateName = (newName: string) => {
    setProfile((prev) => ({ ...prev, name: newName }));
    showToast("Nombre actualizado", "success");
  };

  const addFoodLog = async (food: FoodLog) => {
    let finalImage = food.image;
    if (finalImage && finalImage.startsWith("data:image")) {
      finalImage = await compressThumbnail(finalImage, 160, 0.5);
    }
    const cleanFood: FoodLog = { ...food, image: finalImage };
    setCurrentMacros((prev) => ({
      protein: prev.protein + cleanFood.macros.protein,
      carbs: prev.carbs + cleanFood.macros.carbs,
      fats: prev.fats + cleanFood.macros.fats,
      calories: prev.calories + cleanFood.macros.calories
    }));
    setLoggedFoods((prev) => [cleanFood, ...prev]);
    addXp(50, "Comida registrada");
    registerDailyActivity();
  };

  const removeFoodLog = (id: string) => {
    const foodToRemove = loggedFoods.find((f) => f.id === id);
    if (foodToRemove) {
      setCurrentMacros((prev) => ({
        protein: Math.max(0, prev.protein - foodToRemove.macros.protein),
        carbs: Math.max(0, prev.carbs - foodToRemove.macros.carbs),
        fats: Math.max(0, prev.fats - foodToRemove.macros.fats),
        calories: Math.max(0, prev.calories - foodToRemove.macros.calories)
      }));
      setLoggedFoods((prev) => prev.filter((f) => f.id !== id));
      showToast(`Eliminado: ${foodToRemove.name}`, "warning");
    }
  };

  const updateFoodLog = (id: string, updatedMacros: Macros, updatedName?: string) => {
    const existing = loggedFoods.find((f) => f.id === id);
    if (!existing) return;

    const p = Math.max(0, Math.round(updatedMacros.protein || 0));
    const c = Math.max(0, Math.round(updatedMacros.carbs || 0));
    const f = Math.max(0, Math.round(updatedMacros.fats || 0));
    const cal = Math.max(0, Math.round(updatedMacros.calories || p * 4 + c * 4 + f * 9));
    const nextMacros: Macros = { protein: p, carbs: c, fats: f, calories: cal };

    setCurrentMacros((prev) => ({
      protein: Math.max(0, prev.protein - existing.macros.protein + nextMacros.protein),
      carbs: Math.max(0, prev.carbs - existing.macros.carbs + nextMacros.carbs),
      fats: Math.max(0, prev.fats - existing.macros.fats + nextMacros.fats),
      calories: Math.max(0, prev.calories - existing.macros.calories + nextMacros.calories)
    }));

    setLoggedFoods((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, name: updatedName?.trim() || item.name, macros: nextMacros }
          : item
      )
    );
    showToast("✏️ Comida y macros actualizados", "success");
  };

  const toggleFavoriteMeal = (food: FoodLog) => {
    const norm = food.name.toLowerCase().trim();
    const exists = favoriteMeals.some((f) => f.name.toLowerCase().trim() === norm);
    if (exists) {
      setFavoriteMeals((prev) => prev.filter((f) => f.name.toLowerCase().trim() !== norm));
      showToast("Quitado de Favoritos", "warning");
    } else {
      const cleanCopy: FoodLog = {
        id: `fav_${Date.now()}`,
        name: food.name,
        macros: { ...food.macros },
        time: food.time
      };
      setFavoriteMeals((prev) => [cleanCopy, ...prev].slice(0, 20));
      showToast("⭐ Guardado en Comidas Favoritas", "success");
    }
  };

  const repeatYesterdayMeals = () => {
    if (yesterdayFoods.length === 0) {
      showToast("No hay comidas guardadas de ayer para repetir", "warning");
      return;
    }
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    let addP = 0;
    let addC = 0;
    let addF = 0;
    let addCal = 0;
    const cloned = yesterdayFoods.map((f, idx) => {
      addP += f.macros.protein;
      addC += f.macros.carbs;
      addF += f.macros.fats;
      addCal += f.macros.calories;
      return { ...f, id: `${Date.now()}_${idx}`, time: nowTime };
    });

    setCurrentMacros((prev) => ({
      protein: prev.protein + addP,
      carbs: prev.carbs + addC,
      fats: prev.fats + addF,
      calories: prev.calories + addCal
    }));
    setLoggedFoods((prev) => [...cloned, ...prev]);
    addXp(50, `Ayer repetido (${cloned.length} comidas)`);
    registerDailyActivity();
  };

  const addWater = () => {
    setWaterGlasses((prev) => {
      const next = prev + 1;
      localStorage.setItem("fitmax_water", next.toString());
      if (next === 4) registerDailyActivity();
      return next;
    });
    addXp(10, "Hidratación");
  };

  const removeWater = () => {
    setWaterGlasses((prev) => {
      const next = Math.max(0, prev - 1);
      localStorage.setItem("fitmax_water", next.toString());
      return next;
    });
  };

  const saveDiet = (diet: any) => setCustomDiet(diet);
  const saveWorkoutPlan = (plan: any) => setCustomWorkoutPlan(plan);

  const logWorkoutSession = (session: Omit<WorkoutSessionLog, "id" | "date">) => {
    const todayISO = getLocalISODate();
    const newLog: WorkoutSessionLog = {
      ...session,
      id: Date.now().toString(),
      date: todayISO
    };

    setWorkoutHistory((prev) => [newLog, ...prev].slice(0, 40));

    if (session.exercises && session.exercises.length > 0) {
      setExercisePRs((prev) => {
        const next = { ...prev };
        for (const ex of session.exercises) {
          const baseBw = ex.baseBodyweightKg || 0;
          const completedSets = ex.sets.filter((s) => s.completed && baseBw + s.weight > 0 && s.reps > 0);
          if (completedSets.length === 0) continue;
          let topSet = completedSets[0];
          let topLoad = baseBw + topSet.weight;
          let top1RM = topLoad * (1 + topSet.reps / 30);
          for (const s of completedSets) {
            const load = baseBw + s.weight;
            const est = load * (1 + s.reps / 30);
            if (est > top1RM) {
              top1RM = est;
              topLoad = load;
              topSet = s;
            }
          }
          const existing = next[ex.name];
          if (!existing || top1RM > existing.best1RM) {
            next[ex.name] = {
              weight: Math.round(topLoad * 10) / 10,
              reps: topSet.reps,
              best1RM: Math.round(top1RM * 10) / 10,
              date: todayISO
            };
          }
        }
        return next;
      });
    }

    const totalXp = 100 + (session.prsCount || 0) * 25;
    addXp(totalXp, session.prsCount > 0 ? `Entreno + ${session.prsCount} PR 🏆` : "Sesión completada");
    registerDailyActivity();
  };

  const getLastExercisePerformance = (exerciseName: string): SetRecord[] | null => {
    const normalized = exerciseName.toLowerCase().trim();
    for (const session of workoutHistory) {
      const match = session.exercises.find((e) => e.name.toLowerCase().trim() === normalized);
      if (match && match.sets.length > 0) return match.sets;
    }
    return null;
  };

  const saveReadinessLog = (data: Omit<ReadinessLog, "date" | "score">) => {
    const todayISO = getLocalISODate();
    const sleepScore = Math.min(100, (data.sleepHours / 8) * 50 + data.sleepQuality * 5);
    const fatigueComponent = (11 - data.fatigue) * 10;
    const sorenessComponent = (11 - data.soreness) * 10;
    const score = Math.round(
      Math.max(10, Math.min(100, sleepScore * 0.4 + fatigueComponent * 0.35 + sorenessComponent * 0.25))
    );

    const entry: ReadinessLog = { ...data, date: todayISO, score };
    const alreadyLoggedToday = todayReadiness?.date === todayISO;
    setTodayReadiness(entry);
    if (!alreadyLoggedToday) {
      addXp(25, "Recuperación evaluada");
    } else {
      showToast(`Disposición actualizada: ${score}%`, "success");
    }
  };

  const toggleSupplement = (key: SupplementKey) => {
    const todayISO = getLocalISODate();
    setTodaySupplements((prev) => {
      const base = prev.date === todayISO ? prev : defaultSupplements(todayISO);
      const nextVal = !base[key];
      const nextState = { ...base, date: todayISO, [key]: nextVal };

      if (key === "creatine" && nextVal && lastCreatineDate !== todayISO) {
        const gap = diffDaysISO(lastCreatineDate, todayISO);
        setCreatineStreak((cs) => (!lastCreatineDate || gap <= 2 ? cs + 1 : 1));
        setLastCreatineDate(todayISO);
        addXp(15, "Creatina 5g ✓");
      } else if (nextVal) {
        showToast(`Suplemento marcado ✓`, "success");
      }
      return nextState;
    });
  };

  const activateSocialBank = (reservedCalories: number, eventName = "Cena / Evento Social") => {
    const todayISO = getLocalISODate();
    const cleanReserve = Math.max(300, Math.min(1800, Math.round(reservedCalories)));
    setTodaySocialBank({
      date: todayISO,
      active: true,
      reservedCalories: cleanReserve,
      eventName: eventName.trim() || "Cena / Evento Social",
      released: false
    });
    if (socialXpDate !== todayISO) {
      setSocialXpDate(todayISO);
      addXp(25, "Escudo Social activado 🛡️");
    } else {
      showToast(`🛡️ ${cleanReserve} kcal blindadas para hoy`, "success");
    }
  };

  const releaseSocialBank = () => {
    const todayISO = getLocalISODate();
    setTodaySocialBank((prev) =>
      prev && prev.date === todayISO ? { ...prev, released: true } : prev
    );
    showToast("🥂 ¡Colchón liberado! Usa el Escáner de Menú para pedir con maestría", "success");
  };

  const cancelSocialBank = () => {
    setTodaySocialBank(null);
    localStorage.removeItem("fitmax_socialBank");
    showToast("Reserva social desactivada", "warning");
  };

  const updateDailySteps = (steps: number) => {
    const cleanSteps = Math.max(0, Math.round(steps));
    const todayISO = getLocalISODate();
    setDailySteps(cleanSteps);
    if (cleanSteps >= stepsGoal && stepsXpDate !== todayISO) {
      setStepsXpDate(todayISO);
      addXp(40, `Meta ${stepsGoal.toLocaleString()} pasos 🏃`);
      registerDailyActivity();
    }
  };

  const logCardioSession = (session: Omit<CardioSessionLog, "id" | "date">) => {
    const todayISO = getLocalISODate();
    const entry: CardioSessionLog = {
      ...session,
      id: Date.now().toString(),
      date: todayISO
    };
    setCardioHistory((prev) => [entry, ...prev].slice(0, 40));
    addXp(60, `Cardio ${session.type}`);
    registerDailyActivity();
  };

  const claimDailyTrifecta = () => {
    const todayISO = getLocalISODate();
    if (trifectaClaimedDate === todayISO) {
      showToast("Ya reclamaste tu Cofre Trifecta de hoy", "warning");
      return;
    }
    setTrifectaClaimedDate(todayISO);
    setStreakShields((s) => s + 1);
    addXp(150, "Cofre Trifecta +1 Escudo 🏆");
  };

  const addPhysiquePhoto = async (photo: Omit<PhysiquePhoto, "id">) => {
    const compressed = await compressThumbnail(photo.image, 380, 0.58);
    const newPhoto: PhysiquePhoto = {
      ...photo,
      id: Date.now().toString(),
      image: compressed
    };
    setPhysiquePhotos((prev) => [newPhoto, ...prev].slice(0, 12));
    addXp(75, "Progreso físico guardado 📸");
  };

  const removePhysiquePhoto = (id: string) => {
    setPhysiquePhotos((prev) => prev.filter((p) => p.id !== id));
    showToast("Foto eliminada de tu bóveda", "warning");
  };

  const resetProgress = () => {
    setCurrentMacros(defaultMacros);
    setLoggedFoods([]);
    setWaterGlasses(0);
    setDailySteps(0);
    localStorage.removeItem("fitmax_water");
    localStorage.removeItem("fitmax_dailySteps");
    showToast("Registro diario reiniciado", "warning");
  };

  const exportBackupData = (): string => {
    return JSON.stringify(
      {
        version: "fitmax-backup-v1",
        exportedAt: new Date().toISOString(),
        profile,
        targetMacros,
        currentMacros,
        loggedFoods,
        favoriteMeals,
        customDiet,
        customWorkoutPlan,
        xp,
        streak,
        streakShields,
        biometrics,
        activeTheme,
        dailyHistory,
        weightHistory,
        workoutHistory,
        exercisePRs,
        cardioHistory
      },
      null,
      2
    );
  };

  const importBackupData = (rawJson: string): boolean => {
    try {
      const data = JSON.parse(rawJson);
      if (!data || typeof data !== "object" || (data.version !== "fitmax-backup-v1" && !data.profile)) {
        showToast("Archivo de respaldo inválido", "error");
        return false;
      }

      if (data.profile) setProfile(data.profile);
      if (data.targetMacros) setTargetMacros(data.targetMacros);
      if (data.currentMacros) setCurrentMacros(data.currentMacros);
      if (Array.isArray(data.loggedFoods)) setLoggedFoods(data.loggedFoods);
      if (Array.isArray(data.favoriteMeals)) setFavoriteMeals(data.favoriteMeals);
      if (data.customDiet !== undefined) setCustomDiet(data.customDiet);
      if (data.customWorkoutPlan !== undefined) setCustomWorkoutPlan(data.customWorkoutPlan);
      if (typeof data.xp === "number") setXp(data.xp);
      if (typeof data.streak === "number") setStreak(data.streak);
      if (typeof data.streakShields === "number") setStreakShields(data.streakShields);
      if (data.biometrics) setBiometrics(data.biometrics);
      if (Array.isArray(data.dailyHistory)) setDailyHistory(data.dailyHistory);
      if (Array.isArray(data.weightHistory)) setWeightHistory(data.weightHistory);
      if (Array.isArray(data.workoutHistory)) setWorkoutHistory(data.workoutHistory);
      if (data.exercisePRs) setExercisePRs(data.exercisePRs);
      if (Array.isArray(data.cardioHistory)) setCardioHistory(data.cardioHistory);
      if (typeof data.activeTheme === "string" && data.activeTheme) {
        setActiveTheme(data.activeTheme);
        document.documentElement.setAttribute("data-theme", data.activeTheme);
      }

      showToast("📦 Respaldo Fitmax restaurado con éxito", "success");
      return true;
    } catch {
      showToast("Archivo de respaldo inválido", "error");
      return false;
    }
  };

  return (
    <FitmaxContext.Provider
      value={{
        isLoaded,
        profile,
        targetMacros,
        currentMacros,
        loggedFoods,
        favoriteMeals,
        yesterdayFoods,
        biometrics,
        activeTheme,
        xp,
        streak,
        streakShields,
        lastActiveDate,
        dailyHistory,
        weightHistory,
        workoutHistory,
        exercisePRs,
        todayReadiness,
        todaySupplements,
        todaySocialBank,
        creatineStreak,
        dailySteps,
        stepsGoal,
        cardioHistory,
        trifectaClaimedDate,
        physiquePhotos,
        toasts,
        levelUpInfo,
        showToast,
        dismissToast,
        closeLevelUp,
        setProfileAndCalculate,
        adjustTargetCalories,
        updateAvatar,
        updateName,
        addFoodLog,
        updateFoodLog,
        removeFoodLog,
        exportBackupData,
        importBackupData,
        toggleFavoriteMeal,
        repeatYesterdayMeals,
        waterGlasses,
        addWater,
        removeWater,
        addXp,
        saveTheme,
        customDiet,
        saveDiet,
        customWorkoutPlan,
        saveWorkoutPlan,
        logWorkoutSession,
        getLastExercisePerformance,
        saveReadinessLog,
        toggleSupplement,
        activateSocialBank,
        releaseSocialBank,
        cancelSocialBank,
        updateDailySteps,
        logCardioSession,
        claimDailyTrifecta,
        addPhysiquePhoto,
        removePhysiquePhoto,
        resetProgress,
        user,
        loginWithGoogle,
        logout,
        lastResetDate
      }}
    >
      {children}
    </FitmaxContext.Provider>
  );
};

export const useFitmax = () => {
  const context = useContext(FitmaxContext);
  if (context === undefined) throw new Error("useFitmax must be used within a FitmaxProvider");
  return context;
};
