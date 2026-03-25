"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import {
  Send,
  ImageIcon,
  Download,
  Sparkles,
  Settings2,
  X,
  Loader2,
  ArrowLeft,
} from "lucide-react";

type ImageSize = "1024x1024" | "1792x1024" | "1024x1792";
type ImageStyle = "vivid" | "natural";
type ImageQuality = "standard" | "hd";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  imageUrl?: string;
  revisedPrompt?: string;
  timestamp: Date;
}

const SIZE_LABELS: Record<ImageSize, string> = {
  "1024x1024": "Square (1024x1024)",
  "1792x1024": "Landscape (1792x1024)",
  "1024x1792": "Portrait (1024x1792)",
};

const STYLE_LABELS: Record<ImageStyle, string> = {
  vivid: "Vivid",
  natural: "Natural",
};

const QUALITY_LABELS: Record<ImageQuality, string> = {
  standard: "Standard",
  hd: "HD",
};

const SUGGESTION_PROMPTS = [
  "A modern minimalist logo for a tech startup",
  "An isometric illustration of a cozy home office",
  "A watercolor painting of a mountain landscape at sunset",
  "A futuristic city skyline with flying cars",
];

export default function ImageGeneratorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content:
        "Welcome! I can help you create images for your presentations and projects. Describe what you need, and I'll generate it using DALL-E 3. You can be as detailed as you like -- mention styles, colors, moods, and compositions.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [size, setSize] = useState<ImageSize>("1024x1024");
  const [style, setStyle] = useState<ImageStyle>("vivid");
  const [quality, setQuality] = useState<ImageQuality>("standard");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const generateId = () => Math.random().toString(36).substring(2, 10);

  async function handleSubmit(e: FormEvent, promptOverride?: string) {
    e.preventDefault();
    const prompt = promptOverride || input.trim();
    if (!prompt || isGenerating) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size, style, quality }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: "assistant",
            content: data.error || "Something went wrong. Please try again.",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: "Here's your generated image:",
          imageUrl: data.url,
          revisedPrompt: data.revisedPrompt,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content:
            "Network error. Please check your connection and try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsGenerating(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  }

  async function handleDownload(url: string) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </a>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary-100 p-1.5">
                <Sparkles className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Image Generator
                </h1>
                <p className="text-xs text-gray-500">
                  Powered by DALL-E 3
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`rounded-lg p-2 transition-colors ${
              showSettings
                ? "bg-primary-100 text-primary-600"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            }`}
          >
            <Settings2 className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-b border-gray-200 bg-white px-4 py-3">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Size:
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value as ImageSize)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {Object.entries(SIZE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Style:
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as ImageStyle)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {Object.entries(STYLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Quality:
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as ImageQuality)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {Object.entries(QUALITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="ml-auto rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary-600 text-white"
                    : msg.role === "system"
                      ? "bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100 text-gray-700"
                      : "bg-white border border-gray-200 text-gray-800"
                }`}
              >
                {msg.role === "system" && (
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary-500" />
                    <span className="text-xs font-medium text-primary-600">
                      Image Agent
                    </span>
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.imageUrl && (
                  <div className="mt-3 space-y-2">
                    <div className="relative overflow-hidden rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={msg.imageUrl}
                        alt={msg.revisedPrompt || "Generated image"}
                        className="h-auto w-full"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(msg.imageUrl!)}
                        className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </button>
                    </div>
                    {msg.revisedPrompt && (
                      <p className="text-xs leading-relaxed text-gray-500 italic">
                        DALL-E interpreted as: &quot;{msg.revisedPrompt}&quot;
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                  <span className="text-sm text-gray-500">
                    Generating your image...
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions (shown when only the welcome message exists) */}
      {messages.length === 1 && (
        <div className="border-t border-gray-100 bg-white px-4 py-3">
          <div className="mx-auto max-w-4xl">
            <p className="mb-2 text-xs font-medium text-gray-500">
              Try one of these:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTION_PROMPTS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={(e) => handleSubmit(e as unknown as FormEvent, suggestion)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                >
                  <ImageIcon className="mr-1 inline h-3 w-3" />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-4 py-4">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-4xl items-end gap-3"
        >
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the image you want to create..."
              rows={1}
              disabled={isGenerating}
              className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ maxHeight: "120px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height =
                  Math.min(target.scrollHeight, 120) + "px";
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
        <p className="mx-auto mt-2 max-w-4xl text-center text-xs text-gray-400">
          Images are generated by OpenAI&apos;s DALL-E 3. Results may vary.
        </p>
      </div>
    </div>
  );
}
