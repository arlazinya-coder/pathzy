"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, ProgressBar } from "@/components/ui";
import { MarkdownMessage } from "@/components/mentor/markdown-message";
import { PremiumUpgradeCard } from "@/components/upgrade/premium-upgrade-card";
import { appRoutes } from "@/lib/navigation/routes";
import type { MentorConversation, MentorMessage } from "@/lib/mentor/types";

const quickStarts = [
  "Explain my career plan in simple steps",
  "What should I learn this week?",
  "Help me prepare for an interview",
  "Turn my skills into CV bullets",
  "Suggest my next daily mission",
  "Motivate me to keep going"
];

type DraftMessage = MentorMessage & { streaming?: boolean };
type UpgradeResponse = {
  upgradeRequired: true;
  feature: "mentor";
  limit: number;
  plan: "starter";
};

const PROFILE_SETUP_MESSAGE = "PATHZY is still setting up your profile. Please complete your profile or refresh the page.";

const returnTargets = [
  { match: "CV page", label: "Back to CV Builder", href: appRoutes.professionalIdentityCv },
  { match: "Cover letter page", label: "Back to Cover Letter", href: appRoutes.professionalIdentityCoverLetter },
  { match: "Career Plan page", label: "Back to Career Plan", href: appRoutes.roadmap },
  { match: "Opportunities page", label: "Back to Opportunities", href: appRoutes.opportunities },
  { match: "Applications page", label: "Back to Applications", href: appRoutes.applications },
  { match: "Skills page", label: "Back to Skills", href: appRoutes.skills },
  { match: "Professional Profile", label: "Back to Professional Profile", href: appRoutes.professionalIdentity }
];

function friendlyMentorError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("user_profiles") || lower.includes("schema cache") || lower.includes("public.") || lower.includes("relation") || lower.includes("column")) {
    return PROFILE_SETUP_MESSAGE;
  }
  if (lower.includes("openai") || lower.includes("api key") || lower.includes("stream") || lower.includes("token") || lower.includes("credit")) {
    return "We could not complete this action yet. Your progress is safe. Please try again.";
  }
  return message || "We could not complete this action yet. Your progress is safe. Please try again.";
}

export function MentorChat() {
  const searchParams = useSearchParams();
  const pageContext = searchParams?.get("context") ?? "";
  const returnTarget = returnTargets.find((target) => pageContext.includes(target.match));
  const [conversations, setConversations] = useState<MentorConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DraftMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [upgradeRequired, setUpgradeRequired] = useState<UpgradeResponse | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const progressValue = useMemo(() => Math.min(100, 28 + messages.filter((message) => message.role === "user").length * 12), [messages]);

  async function loadConversation(conversationId?: string | null) {
    setLoading(true);
    setError("");
    setUpgradeRequired(null);

    try {
      const suffix = conversationId ? `?conversationId=${encodeURIComponent(conversationId)}` : "";
      const response = await fetch(`/api/mentor${suffix}`, { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Could not load mentor chat.");
      }

      setConversations(data.conversations ?? []);
      setActiveConversationId(data.activeConversationId ?? null);
      setMessages(data.messages ?? []);
    } catch (caught) {
      setError(friendlyMentorError(caught instanceof Error ? caught.message : "Could not load mentor chat."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadConversation();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streaming]);

  async function sendMessage(value = input) {
    const trimmed = value.trim();
    if (!trimmed || streaming) return;

    const userMessage: DraftMessage = {
      id: `local-user-${Date.now()}`,
      role: "user",
      content: trimmed,
      created_at: new Date().toISOString()
    };
    const assistantMessage: DraftMessage = {
      id: `local-assistant-${Date.now()}`,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
      streaming: true
    };

    setInput("");
    setError("");
    setUpgradeRequired(null);
    setStreaming(true);
    setMessages((current) => [...current, userMessage, assistantMessage]);

    try {
      const response = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, conversationId: activeConversationId, pageContext })
      });

      console.log("[mentor-ui] response received", {
        status: response.status,
        ok: response.ok,
        hasBody: Boolean(response.body),
        contentType: response.headers.get("Content-Type"),
        conversationId: response.headers.get("X-Conversation-Id")
      });

      const contentType = response.headers.get("Content-Type") ?? "";
      if (contentType.includes("application/json")) {
        const data = await response.json();

        if (data?.upgradeRequired) {
          setUpgradeRequired(data as UpgradeResponse);
          setMessages((current) => current.filter((message) => message.id !== userMessage.id && message.id !== assistantMessage.id));
          return;
        }

        if (!response.ok) {
          console.error("[mentor-ui] non-ok mentor response", data);
          throw new Error(friendlyMentorError(data.error ?? "Your Mentor could not reply."));
        }
      }

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}));
        console.error("[mentor-ui] non-ok mentor response", data);
        throw new Error(friendlyMentorError(data.error ?? "Your Mentor could not reply."));
      }

      const conversationId = response.headers.get("X-Conversation-Id");
      if (conversationId) setActiveConversationId(conversationId);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;

        const text = decoder.decode(chunk, { stream: true });
        console.log("[mentor-ui] stream chunk", { length: text.length, preview: text.slice(0, 80) });
        assistantContent += text;
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessage.id ? { ...message, content: assistantContent, streaming: true } : message
          )
        );
      }

      const remainingText = decoder.decode();
      if (remainingText) {
        console.log("[mentor-ui] stream flush", { length: remainingText.length, preview: remainingText.slice(0, 80) });
        assistantContent += remainingText;
      }

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessage.id
            ? { ...message, content: assistantContent || "I could not generate a reply. Try asking again with one clear goal.", streaming: false }
            : message
        )
      );

      const refreshResponse = await fetch("/api/mentor", { cache: "no-store" });
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setConversations(data.conversations ?? []);
      }
    } catch (caught) {
      const message = friendlyMentorError(caught instanceof Error ? caught.message : "Your Mentor could not reply.");
      console.error("[mentor-ui] caught mentor send error", caught);
      setError(message);
      setMessages((current) =>
        current.map((item) => (item.id === assistantMessage.id ? { ...item, content: message, streaming: false } : item))
      );
    } finally {
      setStreaming(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  function startNewChat() {
    setActiveConversationId(null);
    setMessages([]);
    setError("");
    setUpgradeRequired(null);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[.34fr_1fr]">
      <Card className="h-fit">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black">Mentor memory</h2>
          <span className="rounded-full bg-[#39d98a]/15 px-3 py-1 text-xs font-extrabold text-[#9df0c4]">Live support</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-white/58">
          PATHZY uses your Discovery answers, career plan, missions, and progress to give personal guidance.
        </p>
        {returnTarget ? (
          <div className="mt-4 rounded-[18px] border border-[#5B8CFF]/25 bg-[#5B8CFF]/10 p-4">
            <p className="text-sm font-bold text-[#c7d6ff]">You came from {returnTarget.label.replace("Back to ", "")}.</p>
            <Link href={returnTarget.href} className="mt-3 inline-flex rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-extrabold text-white">
              {returnTarget.label}
            </Link>
          </div>
        ) : null}
        <p className="mt-3 rounded-[16px] border border-white/10 bg-white/7 px-4 py-3 text-sm font-bold leading-6 text-white/56">
          Free users get 3 Mentor messages per day.
        </p>
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">
            <span>Job Readiness</span>
            <span>{progressValue}%</span>
          </div>
          <ProgressBar value={progressValue} />
        </div>
        <button onClick={startNewChat} className="mt-5 w-full rounded-full blue-purple px-5 py-3 text-sm font-extrabold text-white">
          New mentor chat
        </button>
        <div className="mt-6">
          <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Previous chats</h3>
          <div className="mt-3 grid gap-2">
            {conversations.length ? (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => loadConversation(conversation.id)}
                  className={`rounded-[18px] border px-4 py-3 text-left text-sm font-bold transition ${
                    conversation.id === activeConversationId
                      ? "border-[#5B8CFF]/60 bg-[#5B8CFF]/16 text-white"
                      : "border-white/10 bg-white/7 text-white/66 hover:bg-white/10"
                  }`}
                >
                  {conversation.title}
                </button>
              ))
            ) : (
              <p className="rounded-[18px] border border-white/10 bg-white/7 p-4 text-sm leading-6 text-white/54">
                Your saved mentor conversations will appear here.
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card className="grid min-h-[680px] grid-rows-[1fr_auto] overflow-hidden">
        <div className="overflow-y-auto pr-1">
          {loading ? (
            <div className="grid h-full place-items-center text-white/58">Loading your mentor...</div>
          ) : upgradeRequired ? (
            <PremiumUpgradeCard onSecondary={() => setUpgradeRequired(null)} />
          ) : messages.length ? (
            <div className="grid content-start gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[92%] rounded-[22px] px-5 py-4 text-sm leading-7 md:text-base ${
                    message.role === "assistant" ? "bg-white/8 text-white/76" : "justify-self-end blue-purple text-white shadow-[0_16px_38px_rgba(91,140,255,.25)]"
                  }`}
                >
                  {message.streaming && !message.content ? (
                    <div className="flex items-center gap-2 text-white/64">
                      <span>PATHZY is thinking</span>
                      <span className="inline-flex gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:120ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:240ms]" />
                      </span>
                    </div>
                  ) : message.role === "assistant" ? (
                    <MarkdownMessage content={message.content} />
                  ) : (
                    message.content
                  )}
                </div>
              ))}
              <div ref={endRef} />
            </div>
          ) : (
            <div className="grid gap-5">
              <div className="rounded-[22px] border border-white/10 bg-white/7 p-5">
                <h2 className="text-2xl font-black">Ask your career mentor anything.</h2>
                <p className="mt-3 leading-7 text-white/62">
                  Try a question about your career plan, CV, interviews, learning plan, side hustle ideas, or your next mission.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {quickStarts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="rounded-[18px] border border-white/10 bg-white/7 px-4 py-3 text-left text-sm font-bold text-white/72 transition hover:bg-white/12"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 border-t border-white/10 pt-5">
          {error ? <p className="mb-3 rounded-[16px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ffc5c5]">{error}</p> : null}
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <textarea
              className="field min-h-[58px]"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="Ask PATHZY what to do next..."
              disabled={streaming || Boolean(upgradeRequired)}
            />
            <button disabled={streaming || Boolean(upgradeRequired) || !input.trim()} className="rounded-full blue-purple px-7 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">
              {streaming ? "Sending" : "Send"}
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
