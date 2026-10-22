import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "smartshop:visit-analytics";

type VisitData = {
  total: number;
  byDay: Record<string, number>;
};

export type VisitStats = {
  total: number;
  today: number;
};

function todayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

async function readVisitData(): Promise<VisitData> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return { total: 0, byDay: {} };

  try {
    const parsed = JSON.parse(raw) as Partial<VisitData>;
    return {
      total: typeof parsed.total === "number" ? parsed.total : 0,
      byDay: parsed.byDay && typeof parsed.byDay === "object" ? parsed.byDay : {},
    };
  } catch {
    return { total: 0, byDay: {} };
  }
}

export async function recordVisit() {
  const data = await readVisitData();
  const day = todayKey();
  const nextData: VisitData = {
    total: data.total + 1,
    byDay: { ...data.byDay, [day]: (data.byDay[day] || 0) + 1 },
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
}

export async function getVisitStats(): Promise<VisitStats> {
  const data = await readVisitData();
  return { total: data.total, today: data.byDay[todayKey()] || 0 };
}
