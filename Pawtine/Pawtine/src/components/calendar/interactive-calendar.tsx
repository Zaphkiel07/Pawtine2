"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import clsx from "clsx";
import { createCalendarRoutineAction } from "@/app/actions/routines";

export type CalendarTask = {
  id: string;
  label: string;
  type: string;
  scheduled_time: string;
};

type Props = {
  tasks: CalendarTask[];
};

export function InteractiveCalendar({ tasks }: Props) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const tasksByDay = useMemo(() => {
    const map = new Map<string, CalendarTask[]>();
    tasks.forEach((task) => {
      const dayKey = format(parseISO(task.scheduled_time), "yyyy-MM-dd");
      if (!map.has(dayKey)) {
        map.set(dayKey, []);
      }
      map.get(dayKey)!.push(task);
    });
    return map;
  }, [tasks]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const selectedKey = format(selectedDate, "yyyy-MM-dd");
  const selectedTasks = tasksByDay.get(selectedKey) ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-500 hover:bg-paw-secondary/20"
            onClick={() => setCurrentMonth((prev) => addMonths(prev, -1))}
          >
            ← Prev
          </button>
          <h2 className="text-lg font-semibold text-paw-primary">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-500 hover:bg-paw-secondary/20"
            onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
          >
            Next →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400">
          {"MTWTFSS".split("").map((day) => (
            <span key={day} className="py-2">
              {day}
            </span>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-2 text-sm">
          {calendarDays.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDay.get(key) ?? [];
            const isSelected = isSameDay(day, selectedDate);

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDate(day)}
                className={clsx(
                  "flex h-24 flex-col rounded-2xl border p-2 text-left transition",
                  isSelected
                    ? "border-paw-primary bg-paw-primary/10"
                    : "border-slate-200 hover:border-paw-primary/80 hover:bg-paw-secondary/10",
                )}
              >
                <span
                  className={clsx(
                    "text-xs font-semibold",
                    isToday(day) ? "text-paw-primary" : "text-slate-500",
                    !isSameMonth(day, currentMonth) && "opacity-40",
                  )}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-1 overflow-hidden text-xs">
                  {dayTasks.slice(0, 2).map((task) => (
                    <p key={task.id} className="truncate rounded-full bg-paw-secondary/20 px-2 py-1 text-paw-primary">
                      {task.label}
                    </p>
                  ))}
                  {dayTasks.length > 2 && (
                    <p className="text-[11px] text-slate-400">+{dayTasks.length - 2} more</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-paw-primary">
            {format(selectedDate, "EEEE, MMM d")}
          </h3>
          <p className="text-xs text-slate-500">
            {selectedTasks.length} task{selectedTasks.length === 1 ? "" : "s"} scheduled
          </p>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {selectedTasks.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No tasks yet — add one using the form below.
            </p>
          ) : (
            selectedTasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-paw-primary/30 bg-paw-primary/5 p-4">
                <p className="text-sm font-semibold text-paw-primary">{task.label}</p>
                <p className="text-xs text-slate-500">{format(parseISO(task.scheduled_time), "h:mm a")}</p>
              </div>
            ))
          )}
        </div>

        <form action={createCalendarRoutineAction} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="text-sm font-semibold text-paw-primary">Add task</h4>
          <input type="hidden" name="date" value={format(selectedDate, "yyyy-MM-dd")} />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600" htmlFor="new-label">
                Label
              </label>
              <input
                id="new-label"
                name="label"
                placeholder="Walk the dog"
                className="w-full rounded-full border border-slate-200 px-3 py-2 text-sm focus:border-paw-primary focus:outline-none focus:ring-2 focus:ring-paw-primary/40"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600" htmlFor="new-type">
                Type
              </label>
              <select
                id="new-type"
                name="type"
                className="w-full rounded-full border border-slate-200 px-3 py-2 text-sm focus:border-paw-primary focus:outline-none focus:ring-2 focus:ring-paw-primary/40"
                defaultValue="walk"
              >
                <option value="feed">Feed</option>
                <option value="walk">Walk</option>
                <option value="water">Water</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600" htmlFor="new-time">
                Time
              </label>
              <input
                id="new-time"
                name="time"
                type="time"
                required
                className="w-full rounded-full border border-slate-200 px-3 py-2 text-sm focus:border-paw-primary focus:outline-none focus:ring-2 focus:ring-paw-primary/40"
              />
            </div>
          </div>
          <button type="submit" className="btn w-full">
            Add to calendar
          </button>
        </form>
      </div>
    </div>
  );
}
