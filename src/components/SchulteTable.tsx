"use client";

import { useState, useCallback, useEffect, useRef } from "react";

const STORAGE_KEY = "schulte-table-times";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function loadTimes(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTime(ms: number) {
  const times = loadTimes();
  times.push(ms);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(times));
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const cent = Math.floor((ms % 1000) / 10);
  if (m > 0) {
    return `${m}:${sec.toString().padStart(2, "0")}.${cent.toString().padStart(2, "0")}`;
  }
  return `${sec}.${cent.toString().padStart(2, "0")}`;
}

const createOrderedCells = (n: number) =>
  Array.from({ length: n * n }, (_, i) => i + 1);

export default function SchulteTable({ size = 5 }: { size?: number }) {
  const totalCells = size * size;
  const [cells, setCells] = useState<number[]>(() => createOrderedCells(size));

  useEffect(() => {
    setCells(shuffleArray(createOrderedCells(size)));
  }, [size]);
  const [nextTarget, setNextTarget] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const lowestMs = times.length > 0 ? Math.min(...times) : null;
  const isPlaying = startTime !== null && !completed;

  useEffect(() => {
    setTimes(loadTimes());
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    intervalRef.current = setInterval(() => {
      setElapsedMs(Date.now() - (startTime ?? Date.now()));
    }, 50);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, startTime]);

  const handleCellClick = useCallback(
    (value: number) => {
      if (completed) return;
      if (value !== nextTarget) return;

      if (startTime === null) setStartTime(Date.now());

      if (value === totalCells) {
        const ms = Date.now() - (startTime ?? Date.now());
        setCompleted(true);
        setElapsedMs(ms);
        saveTime(ms);
        setTimes((prev) => [...prev, ms]);
      } else {
        setNextTarget((n) => n + 1);
      }
    },
    [nextTarget, completed, totalCells, startTime]
  );

  const generate = useCallback(() => {
    setCells(shuffleArray(createOrderedCells(size)));
    setNextTarget(1);
    setCompleted(false);
    setStartTime(null);
    setElapsedMs(0);
  }, [size]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-950 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden">
        {/* Header */}
        <header className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-6 py-4">
          <h1 className="text-xl font-bold text-foreground text-center">
            Schulte Table
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-1">
            Find and click numbers 1 → {totalCells} in order
          </p>
        </header>

        {/* Stats bar */}
        <div className="flex items-center justify-between gap-4 px-6 py-3 bg-zinc-50/50 dark:bg-zinc-800/30 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col items-center min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Time
            </span>
            <span className="text-lg font-mono font-semibold tabular-nums text-foreground">
              {formatTime(elapsedMs)}
            </span>
          </div>
          <div className="flex flex-col items-center min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Progress
            </span>
            <span className="text-lg font-semibold text-foreground">
              {nextTarget - 1}/{totalCells}
            </span>
          </div>
          <div className="flex flex-col items-center min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Best
            </span>
            <span className="text-lg font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              {lowestMs !== null ? formatTime(lowestMs) : "—"}
            </span>
          </div>
        </div>

        {/* Game area */}
        <div className="p-6">
          <div
            className="grid gap-0.5 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
              width: "min(100%, 260px)",
            }}
          >
            {cells.map((value, index) => (
              <button
                key={`${index}-${value}`}
                onClick={() => handleCellClick(value)}
                disabled={completed || value < nextTarget}
                className={`
                  aspect-square flex items-center justify-center rounded-md
                  text-sm font-semibold transition-all duration-150
                  select-none
                  ${
                    value < nextTarget
                      ? "bg-emerald-500/40 text-emerald-800 dark:text-emerald-200 scale-95"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }
                  ${completed ? "cursor-default" : "cursor-pointer"}
                `}
              >
                {value}
              </button>
            ))}
          </div>

          {/* Victory overlay */}
          {completed && (
            <div className="mt-6 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 dark:border-emerald-500/40 p-4 text-center">
              <p className="text-emerald-700 dark:text-emerald-300 font-semibold text-lg">
                Completed!
              </p>
              <p className="text-foreground font-mono text-2xl font-bold mt-1">
                {formatTime(elapsedMs)}
              </p>
              {lowestMs !== null && elapsedMs <= lowestMs && (
                <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium mt-1">
                  New best time!
                </p>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={generate}
              className="rounded-full bg-foreground px-6 py-2.5 text-background text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            >
              {completed ? "Play Again" : "New Game"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
