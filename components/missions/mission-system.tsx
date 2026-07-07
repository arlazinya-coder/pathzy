"use client";

import { useMemo, useState } from "react";
import { Card, ProgressBar } from "@/components/ui";
import type { Mission, MissionState } from "@/lib/missions/types";

function difficultyClass(difficulty: Mission["difficulty"]) {
  if (difficulty === "Easy") return "bg-[#39d98a]/15 text-[#9df0c4]";
  if (difficulty === "Medium") return "bg-[#5B8CFF]/18 text-[#c7d6ff]";
  return "bg-[#7B5CFF]/22 text-[#ded6ff]";
}

const levelNames = [
  "Dreamer",
  "Explorer",
  "Builder",
  "Professional",
  "Career Ready",
  "Interview Ready",
  "Rising Professional",
  "Industry Ready",
  "Career Leader",
  "PATHZY Champion"
];

function levelTitle(level: number) {
  return levelNames[Math.min(Math.max(level, 1), 10) - 1] ?? "Dreamer";
}

function nextStreakTarget(days: number) {
  if (days < 1) return "Complete one mission to start your streak.";
  if (days < 5) return `${5 - days} more day${5 - days === 1 ? "" : "s"} to reach your 5-day streak.`;
  if (days < 10) return `${10 - days} more day${10 - days === 1 ? "" : "s"} to reach your 10-day streak.`;
  if (days < 30) return `${30 - days} more days to reach your 30-day streak.`;
  if (days < 100) return `${100 - days} more days to reach your 100-day streak.`;
  return "You are building rare career consistency.";
}

function Confetti({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: 22 }).map((_, index) => (
        <span
          key={index}
          className="absolute top-8 h-2 w-2 animate-[pathzy-confetti_900ms_ease-out_forwards] rounded-sm"
          style={{
            left: `${8 + index * 4}%`,
            background: index % 3 === 0 ? "#5B8CFF" : index % 3 === 1 ? "#39D98A" : "#FFD166",
            animationDelay: `${index * 22}ms`
          }}
        />
      ))}
    </div>
  );
}

export function MissionSystem({ initialState, canComplete = true }: { initialState: MissionState; canComplete?: boolean }) {
  const [state, setState] = useState(initialState);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [confetti, setConfetti] = useState(false);
  const nextAchievement = useMemo(
    () => state.availableAchievements.find((achievement) => !state.achievements.some((item) => item.achievement_key === achievement.achievement_key)),
    [state.achievements, state.availableAchievements]
  );
  const completedMissions = state.dailyMissions.filter((mission) => mission.completed);
  const suggestedNextMission = state.dailyMissions.find((mission) => !mission.completed) ?? state.weeklyGoal ?? state.dailyMissions[0] ?? null;

  async function complete(mission: Mission) {
    if (!canComplete || mission.completed || busyId) return;

    setBusyId(mission.id);
    setError("");

    try {
      const response = await fetch("/api/missions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId: mission.id })
      });
      const data = await response.json();

      if (!response.ok) {
      throw new Error(data.error ?? "Your progress is safe. Please try again.");
      }

      setState(data);
      setConfetti(true);
      window.setTimeout(() => setConfetti(false), 1100);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Your progress is safe. Please try again.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_.42fr]">
      <Confetti show={confetti} />
      <Card>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
          <h2 className="text-2xl font-black">Today&apos;s Next Step</h2>
            <p className="mt-2 text-white/58">Focused actions based on your career plan, documents, opportunities, and progress.</p>
          </div>
          <span className="w-fit rounded-full bg-[#39d98a]/15 px-4 py-2 text-sm font-extrabold text-[#9df0c4]">{state.progress}% complete</span>
        </div>
        {error ? <p className="mb-4 rounded-[16px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ffc5c5]">{error}</p> : null}
        <div className="grid gap-3">
          {state.dailyMissions.map((mission) => (
            <article key={mission.id} className={`rounded-[22px] border p-4 transition duration-300 ${mission.completed ? "border-[#39d98a]/30 bg-[#39d98a]/8" : "border-white/10 bg-white/7 hover:bg-white/10"}`}>
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${difficultyClass(mission.difficulty)}`}>{mission.difficulty}</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/56">{mission.category}</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/56">{mission.estimated_time}</span>
                  </div>
                  <h3 className="mt-3 text-xl font-black">{mission.title}</h3>
                  <p className="mt-2 leading-7 text-white/60">{mission.description}</p>
                </div>
                <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-end">
                  <strong className="rounded-full blue-purple px-4 py-2 text-sm font-extrabold text-white">{mission.xp_reward} XP</strong>
                  <button
                    disabled={!canComplete || mission.completed || busyId === mission.id}
                    onClick={() => complete(mission)}
                    className="tap-target rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-white/70 transition hover:bg-white/14 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8fb0ff] disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {mission.completed ? "Completed" : busyId === mission.id ? "Saving" : "Mark Complete"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {!canComplete ? (
          <p className="mt-5 rounded-[16px] border border-white/10 bg-white/7 px-4 py-3 text-sm font-bold leading-6 text-white/58">
            Create an account or log in to save your progress and continue your journey.
          </p>
        ) : null}
        <div className="mt-6">
          <ProgressBar value={state.progress} />
        </div>
      </Card>

      <div className="grid gap-5">
        <Card>
          <h2 className="text-2xl font-black">Level {state.level.level}: {levelTitle(state.level.level)}</h2>
          <strong className="mt-4 block text-5xl font-black">{state.level.total_xp}<span className="text-xl text-white/45"> XP</span></strong>
          <p className="mt-2 text-white/58">{state.xpToNextLevel} XP to next level</p>
          <div className="mt-5"><ProgressBar value={Math.round(((250 - state.xpToNextLevel) / 250) * 100)} /></div>
          <p className="mt-4 rounded-[16px] border border-white/10 bg-white/7 px-4 py-3 text-sm font-bold leading-6 text-white/58">{nextStreakTarget(state.level.daily_streak)}</p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-[18px] border border-white/10 bg-white/7 p-3">
              <p className="text-xs font-bold text-white/45">Daily</p>
              <strong className="mt-1 block text-2xl font-black">{state.level.daily_streak}</strong>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/7 p-3">
              <p className="text-xs font-bold text-white/45">Weekly</p>
              <strong className="mt-1 block text-2xl font-black">{state.level.weekly_streak}</strong>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/7 p-3">
              <p className="text-xs font-bold text-white/45">Best</p>
              <strong className="mt-1 block text-2xl font-black">{state.level.longest_streak}</strong>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-black">Weekly goal</h2>
          {state.weeklyGoal ? (
            <div className="mt-4 rounded-[20px] border border-white/10 bg-white/7 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-[#7B5CFF]/22 px-3 py-1 text-xs font-extrabold text-[#ded6ff]">{state.weeklyGoal.xp_reward} XP</span>
                <button
                  disabled={!canComplete || state.weeklyGoal.completed || busyId === state.weeklyGoal.id}
                  onClick={() => state.weeklyGoal && complete(state.weeklyGoal)}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/62 disabled:opacity-50"
                >
                  {state.weeklyGoal.completed ? "Done" : "Complete"}
                </button>
              </div>
              <h3 className="mt-3 font-black">{state.weeklyGoal.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/58">{state.weeklyGoal.description}</p>
            </div>
          ) : null}
        </Card>

        <Card>
          <h2 className="text-2xl font-black">Suggested next step</h2>
          {suggestedNextMission ? (
            <div className="mt-4 rounded-[20px] border border-[#5B8CFF]/22 bg-[#5B8CFF]/10 p-4">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/62">{suggestedNextMission.estimated_time}</span>
              <h3 className="mt-3 font-black">{suggestedNextMission.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/58">{suggestedNextMission.description}</p>
            </div>
          ) : (
            <p className="mt-4 rounded-[18px] border border-white/10 bg-white/7 p-4 text-sm leading-6 text-white/54">You are caught up for today. Review your career plan or ask your Mentor what to do next.</p>
          )}
        </Card>

        <Card>
          <h2 className="text-2xl font-black">Completed steps</h2>
          <div className="mt-4 grid gap-3">
            {completedMissions.length ? (
              completedMissions.map((mission) => (
                <div key={`completed-${mission.id}`} className="rounded-[18px] border border-[#39d98a]/25 bg-[#39d98a]/10 p-4">
                  <strong className="block">{mission.title}</strong>
                  <span className="mt-1 block text-sm text-white/56">+{mission.xp_reward} XP earned</span>
                </div>
              ))
            ) : (
              <p className="rounded-[18px] border border-white/10 bg-white/7 p-4 text-sm leading-6 text-white/54">Complete one step today and your wins will appear here.</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-black">Milestones</h2>
          <div className="mt-4 grid gap-3">
            {state.achievements.slice(0, 4).map((achievement) => (
              <div key={achievement.achievement_key} className="rounded-[18px] border border-[#39d98a]/25 bg-[#39d98a]/10 p-4">
                <strong className="block">{achievement.title}</strong>
                <span className="mt-1 block text-sm text-white/56">{achievement.description}</span>
              </div>
            ))}
            {!state.achievements.length && nextAchievement ? (
              <div className="rounded-[18px] border border-white/10 bg-white/7 p-4">
                <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Next milestone</p>
                <strong className="mt-2 block">{nextAchievement.title}</strong>
                <span className="mt-1 block text-sm text-white/56">{nextAchievement.description}</span>
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
