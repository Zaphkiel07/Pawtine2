import { addDays, addHours, formatISO, startOfDay } from "date-fns";
import { Database } from "@/lib/database.types";

const todayIso = () => formatISO(startOfDay(new Date()), { representation: "date" });

type RoutineRow = Database["public"]["Tables"]["routines"]["Row"];
type HistoryRow = Database["public"]["Tables"]["history"]["Row"];
type UserRow = Database["public"]["Tables"]["users"]["Row"];

type DogRow = Database["public"]["Tables"]["dogs"]["Row"];

type DemoStore = {
  user: UserRow;
  dog: DogRow;
  routines: RoutineRow[];
  history: HistoryRow[];
};

type GlobalWithDemo = typeof globalThis & {
  __pawtineDemoStore?: DemoStore;
};

const globalWithDemo = globalThis as GlobalWithDemo;

function replaceAll(source: string, search: string, replacement: string) {
  return source.split(search).join(replacement);
}

function buildDefaultLabel(
  type: RoutineRow["type"],
  label: string,
  dogName: string,
  previousName?: string | null,
) {
  if (previousName && label.includes(previousName)) {
    return replaceAll(label, previousName, dogName);
  }

  const lower = label.toLowerCase();

  if (type === "feed") {
    if (lower.includes("breakfast")) {
      return `${dogName} breakfast`;
    }
    if (lower.includes("dinner")) {
      return `${dogName} dinner`;
    }
  }

  if (type === "water") {
    if (lower.includes("water")) {
      return `${dogName} water refresh`;
    }
  }

  if (type === "walk") {
    const match = label.match(/walk(?:\s*#\s*(\d+))?/i);
    if (match) {
      const walkNumber = match[1];
      if (walkNumber) {
        return `${dogName} walk #${walkNumber}`;
      }
      return `${dogName} walk`;
    }
  }

  return null;
}

function initStore(): DemoStore {
  const now = new Date();
  const baseDateIso = formatISO(now);

  return {
    user: {
      id: "11111111-1111-1111-1111-111111111111",
      email: "demo@pawtine.dev",
      name: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      created_at: baseDateIso,
    },
    dog: {
      id: "22222222-2222-2222-2222-222222222222",
      user_id: "11111111-1111-1111-1111-111111111111",
      name: "",
      breed: null,
      age_months: null,
      created_at: baseDateIso,
    },
    routines: [
      {
        id: "33333333-3333-3333-3333-333333333333",
        dog_id: "22222222-2222-2222-2222-222222222222",
        type: "feed",
        label: "Luna breakfast",
        scheduled_time: formatISO(addHours(startOfDay(now), 7)),
        status: "active",
        created_at: baseDateIso,
        last_completed_at: null,
      },
      {
        id: "44444444-4444-4444-4444-444444444444",
        dog_id: "22222222-2222-2222-2222-222222222222",
        type: "feed",
        label: "Luna dinner",
        scheduled_time: formatISO(addHours(now, 10)),
        status: "active",
        created_at: baseDateIso,
        last_completed_at: null,
      },
      {
        id: "55555555-5555-5555-5555-555555555555",
        dog_id: "22222222-2222-2222-2222-222222222222",
        type: "water",
        label: "Water refresh",
        scheduled_time: formatISO(addHours(now, 2)),
        status: "active",
        created_at: baseDateIso,
        last_completed_at: null,
      },
      {
        id: "66666666-6666-6666-6666-666666666666",
        dog_id: "22222222-2222-2222-2222-222222222222",
        type: "walk",
        label: "Morning walk",
        scheduled_time: formatISO(addHours(now, 3)),
        status: "active",
        created_at: baseDateIso,
        last_completed_at: null,
      },
      {
        id: "77777777-7777-7777-7777-777777777777",
        dog_id: "22222222-2222-2222-2222-222222222222",
        type: "walk",
        label: "Evening walk",
        scheduled_time: formatISO(addHours(now, 12)),
        status: "active",
        created_at: baseDateIso,
        last_completed_at: null,
      },
    ],
    history: [],
  };
}

function getStore(): DemoStore {
  if (!globalWithDemo.__pawtineDemoStore) {
    globalWithDemo.__pawtineDemoStore = initStore();
  }
  return globalWithDemo.__pawtineDemoStore;
}

export function demoFetchCurrentUserAndDog() {
  const store = getStore();
  return {
    userId: store.user.id,
    dog: store.dog,
  };
}

export function demoFetchAllRoutines(): RoutineRow[] {
  const store = getStore();
  return [...store.routines];
}

export function demoFetchDailyRoutines() {
  const store = getStore();
  const today = todayIso();

  return store.routines
    .filter((routine) => routine.status === "active")
    .map((routine) => ({
      ...routine,
      todayStatus:
        store.history.find(
          (entry) => entry.routine_id === routine.id && entry.occurred_on === today,
        ) ?? null,
    }));
}

export function demoFetchWeeklySummary(weekStart: string) {
  const store = getStore();
  const start = new Date(weekStart);
  const end = addDays(start, 7);

  return store.history
    .filter((entry) => {
      const occurred = new Date(entry.occurred_on);
      return occurred >= start && occurred < end;
    })
    .map((entry) => {
      const routine = store.routines.find((item) => item.id === entry.routine_id);
      return {
        routine_id: entry.routine_id,
        label: routine?.label,
        type: routine?.type,
        status: entry.status,
        day: entry.occurred_on,
      };
    });
}

export function demoFetchMonthlySchedule(start: Date, end: Date) {
  const store = getStore();
  return store.routines.filter((routine) => {
    if (!routine.scheduled_time) {
      return false;
    }
    const scheduled = new Date(routine.scheduled_time);
    return scheduled >= start && scheduled <= end;
  });
}

export function demoMarkRoutineComplete(routineId: string) {
  const store = getStore();
  const today = todayIso();
  const nowIso = formatISO(new Date());
  const routine = store.routines.find((item) => item.id === routineId);
  if (!routine) {
    throw new Error("Routine not found");
  }
  const existing = store.history.find(
    (entry) => entry.routine_id === routineId && entry.occurred_on === today,
  );

  if (existing) {
    existing.status = "done";
    existing.created_at = nowIso;
    routine.last_completed_at = nowIso;
    return existing;
  } else {
    const entry: HistoryRow = {
      id: crypto.randomUUID(),
      routine_id: routineId,
      occurred_on: today,
      status: "done",
      notes: null,
      created_at: nowIso,
    };
    store.history.push(entry);
    routine.last_completed_at = nowIso;
    return entry;
  }
}

export function demoSnoozeRoutine(routineId: string, hours: number) {
  const store = getStore();
  const routine = store.routines.find((item) => item.id === routineId);
  if (!routine) {
    throw new Error("Routine not found");
  }
  routine.scheduled_time = formatISO(addHours(new Date(), hours));
  return routine;
}

export function demoUpdateRoutine(
  routineId: string,
  payload: Partial<Database["public"]["Tables"]["routines"]["Update"]>,
) {
  const store = getStore();
  const routine = store.routines.find((item) => item.id === routineId);
  if (!routine) {
    throw new Error("Routine not found");
  }

  Object.assign(routine, payload);
  return routine;
}

export function demoCreateRoutine(
  payload: Database["public"]["Tables"]["routines"]["Insert"],
) {
  const store = getStore();
  const routine: RoutineRow = {
    id: payload.id ?? crypto.randomUUID(),
    dog_id: payload.dog_id,
    type: payload.type,
    label: payload.label ?? "New routine",
    scheduled_time: payload.scheduled_time,
    status: payload.status ?? "active",
    created_at: payload.created_at ?? formatISO(new Date()),
    last_completed_at: payload.last_completed_at ?? null,
  };

  store.routines.push(routine);
  return routine;
}

export function demoRunOnboarding(payload: {
  dogName: string;
  dogBreed?: string;
  timezone?: string;
  routines: Array<{
    type: Database["public"]["Tables"]["routines"]["Insert"]["type"];
    label: string;
    scheduled_time: string;
  }>;
}) {
  const store = getStore();
  store.dog = {
    ...store.dog,
    name: payload.dogName,
    breed: payload.dogBreed ?? store.dog.breed,
    created_at: formatISO(new Date()),
  };

  store.user = {
    ...store.user,
    name: store.user.name ?? "Pawtine Pal",
    timezone: payload.timezone ?? store.user.timezone,
    created_at: formatISO(new Date()),
  };

  store.routines = payload.routines.map((routine) => ({
    id: crypto.randomUUID(),
    dog_id: store.dog.id,
    type: routine.type,
    label: routine.label,
    scheduled_time: routine.scheduled_time,
    status: "active",
    created_at: formatISO(new Date()),
    last_completed_at: null,
  }));

  store.history = [];

  return { userId: store.user.id, dogId: store.dog.id };
}

export function demoFetchProfile() {
  const store = getStore();
  return {
    user: store.user,
    dog: store.dog,
  };
}

export function demoUpdateProfile(payload: {
  user: Partial<Pick<UserRow, "name" | "timezone">>;
  dog: Partial<Pick<DogRow, "name" | "breed" | "age_months">>;
}) {
  const store = getStore();
  const previousDogName = store.dog.name;

  const nextUser = { ...store.user };
  if (payload.user.name !== undefined) {
    nextUser.name = payload.user.name ?? nextUser.name;
  }
  if (payload.user.timezone !== undefined) {
    nextUser.timezone = payload.user.timezone ?? nextUser.timezone;
  }
  store.user = nextUser;

  const nextDog = { ...store.dog };
  if (payload.dog.name !== undefined) {
    nextDog.name = payload.dog.name ?? nextDog.name;
  }
  if (payload.dog.breed !== undefined) {
    nextDog.breed = payload.dog.breed ?? nextDog.breed;
  }
  if (payload.dog.age_months !== undefined) {
    nextDog.age_months = payload.dog.age_months ?? nextDog.age_months;
  }
  store.dog = nextDog;

  if (store.dog.name) {
    const newName = store.dog.name;
    store.routines = store.routines.map((routine) => {
      const updatedLabel = buildDefaultLabel(
        routine.type,
        routine.label,
        newName,
        previousDogName,
      );
      if (updatedLabel && updatedLabel !== routine.label) {
        return { ...routine, label: updatedLabel };
      }
      return routine;
    });
  }

  return {
    user: store.user,
    dog: store.dog,
  };
}
