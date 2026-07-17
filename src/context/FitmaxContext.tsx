"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import { onAuthStateChanged, signInWithRedirect, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

type Goal = "Perder Grasa" | "Recomposición Corporal" | "Subir de Peso Limpio";
type Activity = "Sedentario" | "Ligero" | "Moderado" | "Intenso";

interface UserProfile {
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
  avatar?: string; // Base64 image
}

interface Macros {
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

interface Biometrics {
  bodyFatPercentage: number | null;
  leanMass: number | null;
}

interface FitmaxState {
  isLoaded: boolean;
  profile: UserProfile;
  targetMacros: Macros;
  currentMacros: Macros;
  loggedFoods: FoodLog[];
  biometrics: Biometrics;
  activeTheme: string;
  xp: number;
  streak: number;
  setProfileAndCalculate: (profileData: UserProfile) => void;
  updateAvatar: (base64String: string) => void;
  updateName: (newName: string) => void;
  addFoodLog: (food: FoodLog) => void;
  addXp: (amount: number) => void;
  saveTheme: (theme: string) => void;
  customDiet: any;
  saveDiet: (diet: any) => void;
  resetProgress: () => void; // For testing or new day
  user: User | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  lastResetDate: string;
}

const defaultProfile: UserProfile = {
  name: "", sex: "", age: 0, height: 0, weight: 0, targetWeight: 0, goal: "", activityLevel: ""
};
const defaultMacros: Macros = { protein: 0, carbs: 0, fats: 0, calories: 0 };

const FitmaxContext = createContext<FitmaxState | undefined>(undefined);

export const FitmaxProvider = ({ children }: { children: ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [targetMacros, setTargetMacros] = useState<Macros>(defaultMacros);
  const [currentMacros, setCurrentMacros] = useState<Macros>(defaultMacros);
  const [loggedFoods, setLoggedFoods] = useState<FoodLog[]>([]);
  const [customDiet, setCustomDiet] = useState<any>(null);
  const [xp, setXp] = useState(0); 
  const [streak, setStreak] = useState(0);
  const [bodyFat, setBodyFat] = useState<number | null>(null);
  const [biometrics, setBiometrics] = useState<Biometrics>({ bodyFatPercentage: null, leanMass: null });
  const [activeTheme, setActiveTheme] = useState("light");
  const [user, setUser] = useState<User | null>(null);
  const [lastResetDate, setLastResetDate] = useState(new Date().toDateString());
  const isCloudLoaded = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("fitmax_profile");
    const savedTarget = localStorage.getItem("fitmax_targetMacros");
    const savedCurrent = localStorage.getItem("fitmax_currentMacros");
    const savedLogs = localStorage.getItem("fitmax_loggedFoods");
    const savedDiet = localStorage.getItem("fitmax_customDiet");
    const savedXp = localStorage.getItem("fitmax_xp");
    const savedStreak = localStorage.getItem("fitmax_streak");
    const savedBiometrics = localStorage.getItem("fitmax_biometrics");
    const savedTheme = localStorage.getItem("fitmax_theme");
    const savedResetDate = localStorage.getItem("fitmax_lastResetDate");

    const today = new Date().toDateString();

    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedTarget) setTargetMacros(JSON.parse(savedTarget));
    if (savedDiet) setCustomDiet(JSON.parse(savedDiet));
    if (savedXp) setXp(Number(savedXp));
    if (savedStreak) setStreak(Number(savedStreak));
    if (savedBiometrics) setBiometrics(JSON.parse(savedBiometrics));
    if (savedTheme) {
      setActiveTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    // Check if a new day has started
    if (savedResetDate && savedResetDate !== today) {
      // It's a new day! Reset macros and logs.
      setCurrentMacros(defaultMacros);
      setLoggedFoods([]);
      setLastResetDate(today);
    } else {
      // Same day, load current progress
      if (savedCurrent) setCurrentMacros(JSON.parse(savedCurrent));
      if (savedLogs) setLoggedFoods(JSON.parse(savedLogs));
      if (savedResetDate) setLastResetDate(savedResetDate);
    }
    
    setIsLoaded(true);
  }, []);

  // Handle Firebase Auth and Cloud Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch cloud data
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.profile) setProfile(data.profile);
          if (data.targetMacros) setTargetMacros(data.targetMacros);
          if (data.currentMacros) setCurrentMacros(data.currentMacros);
          if (data.loggedFoods) setLoggedFoods(data.loggedFoods);
          if (data.customDiet) setCustomDiet(data.customDiet);
          if (data.xp !== undefined) setXp(data.xp);
          if (data.streak !== undefined) setStreak(data.streak);
          if (data.biometrics) setBiometrics(data.biometrics);
          if (data.lastResetDate) setLastResetDate(data.lastResetDate);
          if (data.activeTheme) {
            setActiveTheme(data.activeTheme);
            document.documentElement.setAttribute('data-theme', data.activeTheme);
          }
        }
        isCloudLoaded.current = true;
      } else {
        isCloudLoaded.current = false;
      }
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      console.error("Google login failed", error);
      alert("Error al iniciar sesión: " + error.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    // Optional: clear local state or reload
    window.location.reload();
  };

  // Save to localStorage when state changes (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("fitmax_profile", JSON.stringify(profile));
      localStorage.setItem("fitmax_targetMacros", JSON.stringify(targetMacros));
      localStorage.setItem("fitmax_currentMacros", JSON.stringify(currentMacros));
      localStorage.setItem("fitmax_loggedFoods", JSON.stringify(loggedFoods));
      localStorage.setItem("fitmax_customDiet", JSON.stringify(customDiet));
      localStorage.setItem("fitmax_xp", xp.toString());
      localStorage.setItem("fitmax_streak", streak.toString());
      localStorage.setItem("fitmax_biometrics", JSON.stringify(biometrics));
      localStorage.setItem("fitmax_theme", activeTheme);
      localStorage.setItem("fitmax_lastResetDate", lastResetDate);
      
      // Sync to cloud if user is logged in and cloud is loaded
      if (user && isCloudLoaded.current) {
        setDoc(doc(db, "users", user.uid), {
          profile, targetMacros, currentMacros, loggedFoods, customDiet, xp, streak, biometrics, activeTheme, lastResetDate
        }, { merge: true });
      }
    }
  }, [profile, targetMacros, currentMacros, loggedFoods, customDiet, xp, streak, biometrics, activeTheme, lastResetDate, isLoaded, user]);

  const saveTheme = (theme: string) => {
    setActiveTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

  const setProfileAndCalculate = (profileData: UserProfile) => {
    const updatedProfile = { ...profileData, avatar: profile.avatar };
    setProfile(updatedProfile);
    
    let leanMass: number | null = null;
    let bfValid: number | null = null;

    if (updatedProfile.weight && updatedProfile.height && updatedProfile.neck && updatedProfile.waist) {
      const bf = 495 / (1.0324 - 0.19077 * Math.log10(updatedProfile.waist - updatedProfile.neck) + 0.15456 * Math.log10(updatedProfile.height)) - 450;
      bfValid = Math.max(2, Math.min(bf, 60));
      leanMass = updatedProfile.weight - (updatedProfile.weight * (bfValid / 100));
      
      setBiometrics({
        bodyFatPercentage: Math.round(bfValid * 10) / 10,
        leanMass: Math.round(leanMass * 10) / 10
      });
    }

    if (!updatedProfile.age || !updatedProfile.weight || !updatedProfile.height) return;

    let bmr = 0;
    if (leanMass !== null) {
      // Professional Katch-McArdle Formula (using Lean Body Mass)
      bmr = 370 + (21.6 * leanMass);
    } else {
      // Standard Mifflin-St Jeor Formula
      bmr = 10 * updatedProfile.weight + 6.25 * updatedProfile.height - 5 * updatedProfile.age;
      bmr += updatedProfile.sex === "H" ? 5 : -161;
    }

    const multipliers = { "Sedentario": 1.2, "Ligero": 1.375, "Moderado": 1.55, "Intenso": 1.725 };
    const tdee = bmr * (multipliers[updatedProfile.activityLevel as Activity] || 1.2);

    let calories = tdee;
    if (updatedProfile.goal === 'Perder Grasa') calories = tdee - 500;
    if (updatedProfile.goal === 'Subir de Peso Limpio') calories = tdee + 300;
    // Recomposición Corporal = Maintenance (TDEE)

    const protein = Math.round(updatedProfile.weight * 2.0);
    const fats = Math.round(updatedProfile.weight * 0.9);
    
    const proteinCals = protein * 4;
    const fatsCals = fats * 9;
    const carbsCals = calories - proteinCals - fatsCals;
    const carbs = Math.max(Math.round(carbsCals / 4), 50);

    setTargetMacros({
      calories: Math.round(calories),
      protein,
      carbs,
      fats,
    });
  };

  const updateAvatar = (base64String: string) => {
    setProfile(prev => ({ ...prev, avatar: base64String }));
  };

  const updateName = (newName: string) => {
    setProfile(prev => ({ ...prev, name: newName }));
  };

  const addFoodLog = (food: FoodLog) => {
    setCurrentMacros(prev => ({
      protein: prev.protein + food.macros.protein,
      carbs: prev.carbs + food.macros.carbs,
      fats: prev.fats + food.macros.fats,
      calories: prev.calories + food.macros.calories
    }));
    setLoggedFoods(prev => [food, ...prev]);
    setXp(prev => prev + 50);
  };

  const addXp = (amount: number) => {
    setXp(prev => prev + amount);
  };

  const saveDiet = (diet: any) => {
    setCustomDiet(diet);
  };

  const resetProgress = () => {
    setCurrentMacros(defaultMacros);
    setLoggedFoods([]);
  };

  return (
    <FitmaxContext.Provider value={{ isLoaded, profile, targetMacros, currentMacros, loggedFoods, biometrics, activeTheme, xp, streak, setProfileAndCalculate, updateAvatar, updateName, addFoodLog, addXp, saveTheme, customDiet, saveDiet, resetProgress, user, loginWithGoogle, logout, lastResetDate }}>
      {children}
    </FitmaxContext.Provider>
  );
};

export const useFitmax = () => {
  const context = useContext(FitmaxContext);
  if (context === undefined) throw new Error("useFitmax must be used within a FitmaxProvider");
  return context;
};
