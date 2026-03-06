"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Sun, Moon, Play, Loader2, Share2, Clock, CheckCircle, XCircle } from "lucide-react";
import { 
  useStorage, 
  useMutation, 
  useMyPresence, 
  useUpdateMyPresence, 
  useOthers,
  useStatus 
} from "@/lib/liveblocks";
import { shallow } from "@liveblocks/client";
import "../globals.css";

/* ─── Language Registry ──────────────────────────────────────── */
type LC = { display: string; monaco: string; judge0Id: number | null; group: string; template: string };

const LANGS: Record<string, LC> = {
  /* Web */
  html: { display: "HTML", monaco: "html", judge0Id: null, group: "Web",
    template: `<html>
  <head><title>CODIVIR</title></head>
  <body style="background:#0d0d1a;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
    <h1 style="color:#a78bfa;font-family:sans-serif;font-size:2rem">Hello from CODIVIR ⚡</h1>
  </body>
</html>` },
  css: { display: "CSS", monaco: "css", judge0Id: null, group: "Web",
    template: `/* CSS — styles the HTML pane */
body {
  background: #0d0d1a;
  font-family: 'Segoe UI', sans-serif;
  color: #a78bfa;
}
h1 { font-size: 2rem; text-align: center; margin-top: 40vh; }` },
  javascript: { display: "JavaScript", monaco: "javascript", judge0Id: 63, group: "Web",
    template: `// JavaScript — runs live in the preview pane
const msg = document.createElement('h2');
msg.textContent = '⚡ JS is live!';
msg.style.cssText = 'color:#fbbf24;font-family:sans-serif;text-align:center;margin-top:30vh';
document.body.appendChild(msg);` },
  typescript: { display: "TypeScript", monaco: "typescript", judge0Id: 74, group: "Web",
    template: `type Person = { name: string; age: number };
const greet = ({ name, age }: Person): void => {
  console.log(\`Hello, I'm \${name}, \${age} years old.\`);
};
greet({ name: "Alice", age: 25 });
console.log("Powered by CODIVIR ⚡");` },

  /* Scripting */
  python: { display: "Python", monaco: "python", judge0Id: 71, group: "Scripting",
    template: `class Person:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age

    def greet(self):
        print(f"Hello, I'm {self.name}, {self.age} years old!")

p = Person("Alice", 25)
p.greet()
print("Powered by CODIVIR ⚡")` },
  bash: { display: "Bash", monaco: "shell", judge0Id: 46, group: "Scripting",
    template: `#!/bin/bash
NAME="Alice"; AGE=25
echo "Hello, I'm $NAME, $AGE years old."
echo "Powered by CODIVIR ⚡"
for i in {1..3}; do echo "  → step $i"; done` },

  /* Systems */
  c: { display: "C", monaco: "c", judge0Id: 50, group: "Systems",
    template: `#include <stdio.h>
typedef struct { char name[50]; int age; } Person;
void greet(Person p) {
    printf("Hello, I'm %s, %d years old.\\n", p.name, p.age);
}
int main() {
    Person p = {"Alice", 25};
    greet(p);
    printf("Powered by CODIVIR ⚡\\n");
    return 0;
}` },
  cpp: { display: "C++", monaco: "cpp", judge0Id: 54, group: "Systems",
    template: `#include <iostream>
#include <string>
struct Person {
    std::string name; int age;
    void greet() const {
        std::cout << "Hello, I'm " << name << ", " << age << " years old.\\n";
    }
};
int main() {
    Person{"Alice", 25}.greet();
    std::cout << "Powered by CODIVIR ⚡\\n";
}` },
  rust: { display: "Rust", monaco: "rust", judge0Id: 73, group: "Systems",
    template: `struct Person { name: String, age: u8 }
impl Person {
    fn greet(&self) {
        println!("Hello, I'm {}, {} years old.", self.name, self.age);
    }
}
fn main() {
    Person { name: String::from("Alice"), age: 25 }.greet();
    println!("Powered by CODIVIR ⚡");
}` },
  go: { display: "Go", monaco: "go", judge0Id: 60, group: "Systems",
    template: `package main
import "fmt"
type Person struct{ Name string; Age int }
func (p Person) Greet() { fmt.Printf("Hello, I'm %s, %d years old.\\n", p.Name, p.Age) }
func main() {
    Person{"Alice", 25}.Greet()
    fmt.Println("Powered by CODIVIR ⚡")
}` },

  /* JVM & Mobile */
  java: { display: "Java", monaco: "java", judge0Id: 62, group: "JVM & Mobile",
    template: `public class Main {
    record Person(String name, int age) {
        void greet() { System.out.printf("Hello, I'm %s, %d years old.%n", name, age); }
    }
    public static void main(String[] args) {
        new Person("Alice", 25).greet();
        System.out.println("Powered by CODIVIR ⚡");
    }
}` },
  kotlin: { display: "Kotlin", monaco: "kotlin", judge0Id: 78, group: "JVM & Mobile",
    template: `data class Person(val name: String, val age: Int) {
    fun greet() = println("Hello, I'm $name, $age years old.")
}
fun main() {
    Person("Alice", 25).greet()
    println("Powered by CODIVIR ⚡")
}` },
  csharp: { display: "C#", monaco: "csharp", judge0Id: 51, group: "JVM & Mobile",
    template: `using System;
record Person(string Name, int Age) {
    public void Greet() => Console.WriteLine($"Hello, I'm {Name}, {Age} years old.");
}
class Program {
    static void Main() {
        new Person("Alice", 25).Greet();
        Console.WriteLine("Powered by CODIVIR ⚡");
    }
}` },
  swift: { display: "Swift", monaco: "swift", judge0Id: 83, group: "JVM & Mobile",
    template: `struct Person { var name: String; var age: Int
    func greet() { print("Hello, I'm \\(name), \\(age) years old.") }
}
Person(name: "Alice", age: 25).greet()
print("Powered by CODIVIR ⚡")` },
  dart: { display: "Dart", monaco: "dart", judge0Id: 90, group: "JVM & Mobile",
    template: `class Person {
  final String name; final int age;
  Person(this.name, this.age);
  void greet() => print('Hello, I\\'m $name, $age years old.');
}
void main() {
  Person('Alice', 25).greet();
  print('Powered by CODIVIR ⚡');
}` },

  /* Functional & Data */
  haskell: { display: "Haskell", monaco: "plaintext", judge0Id: 61, group: "Functional & Data",
    template: `main = do
  putStrLn "Hello from Haskell!"
  putStrLn "Powered by CODIVIR ⚡"` },
  elixir: { display: "Elixir", monaco: "plaintext", judge0Id: 57, group: "Functional & Data",
    template: `IO.puts("Hello from Elixir!")
IO.puts("Powered by CODIVIR ⚡")` },
  julia: { display: "Julia", monaco: "julia", judge0Id: 65, group: "Functional & Data",
    template: `println("Hello from Julia!")
println("Powered by CODIVIR ⚡")` },
  sql: { display: "SQL", monaco: "sql", judge0Id: 82, group: "Functional & Data",
    template: `-- SQLite
CREATE TABLE co (name TEXT, val TEXT);
INSERT INTO co VALUES ('CODIVIR', '⚡');
SELECT * FROM co;` },
};

const WEB = ["html", "css", "javascript", "typescript"];
const GROUPS = ["Web", "Scripting", "Systems", "JVM & Mobile", "Functional & Data"];

/* ─── Pane Color Map ─────────────────────────────────────────── */
const COLOR: Record<string, { dot: string; label: string; border: string; bg: string }> = {
  html:       { dot: "bg-orange-400", label: "text-orange-400", border: "border-orange-500/25", bg: "bg-orange-500/8" },
  css:        { dot: "bg-blue-400",   label: "text-blue-400",   border: "border-blue-500/25",   bg: "bg-blue-500/8"   },
  javascript: { dot: "bg-yellow-400", label: "text-yellow-400", border: "border-yellow-500/25", bg: "bg-yellow-500/8" },
  typescript: { dot: "bg-sky-400",    label: "text-sky-400",    border: "border-sky-500/25",    bg: "bg-sky-500/8"    },
  python:     { dot: "bg-green-400",  label: "text-green-400",  border: "border-green-500/25",  bg: "bg-green-500/8"  },
  rust:       { dot: "bg-red-400",    label: "text-red-400",    border: "border-red-500/25",    bg: "bg-red-500/8"    },
  go:         { dot: "bg-cyan-400",   label: "text-cyan-400",   border: "border-cyan-500/25",   bg: "bg-cyan-500/8"   },
  java:       { dot: "bg-amber-500",  label: "text-amber-500",  border: "border-amber-500/25",  bg: "bg-amber-500/8"  },
  kotlin:     { dot: "bg-violet-400", label: "text-violet-400", border: "border-violet-500/25", bg: "bg-violet-500/8" },
  c:          { dot: "bg-blue-300",   label: "text-blue-300",   border: "border-blue-300/25",   bg: "bg-blue-300/8"   },
  cpp:        { dot: "bg-pink-400",   label: "text-pink-400",   border: "border-pink-500/25",   bg: "bg-pink-500/8"   },
  csharp:     { dot: "bg-purple-400", label: "text-purple-400", border: "border-purple-500/25", bg: "bg-purple-500/8" },
  swift:      { dot: "bg-orange-300", label: "text-orange-300", border: "border-orange-300/25", bg: "bg-orange-300/8" },
  ruby:       { dot: "bg-rose-400",   label: "text-rose-400",   border: "border-rose-500/25",   bg: "bg-rose-500/8"   },
  sql:        { dot: "bg-teal-400",   label: "text-teal-400",   border: "border-teal-500/25",   bg: "bg-teal-500/8"   },
};
const lc = (lang: string) =>
  COLOR[lang] ?? { dot: "bg-purple-400", label: "text-purple-400", border: "border-purple-500/25", bg: "bg-purple-500/8" };

/* ─── Props ──────────────────────────────────────────────────── */
interface EditorComponentProps {
  snippetId?: string | null;
  onSnippetIdChange?: (id: string) => void;
}

type Judge0Response = {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  error?: string | null;
  status?: {
    id?: number | null;
    description?: string | null;
  } | null;
};

const encodeBase64Utf8 = (value: string) => {
  if (typeof window === "undefined") return "";
  return window.btoa(unescape(encodeURIComponent(value)));
};

const decodeBase64Utf8 = (value?: string | null) => {
  if (!value || typeof window === "undefined") return "";
  try {
    return decodeURIComponent(escape(window.atob(value)));
  } catch {
    return value;
  }
};

/* ─── Component ──────────────────────────────────────────────── */
export default function EditorComponent({ snippetId: propSnippetId = null, onSnippetIdChange }: EditorComponentProps) {
  /* State */
  const lastSynced = useRef<Record<string, string>>({});
  /* Liveblocks Storage & Presence */
  const storageCodes = useStorage((root) => {
    return Object.fromEntries(root.codes.entries());
  }, shallow);
  const storageLanguage = useStorage((root) => root.language);

  const setStorageLanguage = useMutation(({ storage }, newLang: string) => {
    storage.set("language", newLang);
  }, []);
  const updateStorageCode = useMutation(({ storage }, lang: string, code: string) => {
    // @ts-ignore
    const map = storage.get("codes");
    if (map) {
      map.set(lang, code);
      console.log(`[Liveblocks] Local update sent: ${lang}`);
    } else {
      console.error("[Liveblocks] codes Map not found in storage!");
    }
  }, []);

  const [myPresence, updateMyPresence] = useMyPresence();
  const others = useOthers();
  const status = useStatus();
  const router = useRouter();

  useEffect(() => {
    console.log("[Liveblocks] Connection status:", status);
  }, [status]);

  /* Local State synced with Storage */
  const [codes, setCodes] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(LANGS).map(([k, v]) => [k, v.template]))
  );
  const [language, setLanguage]   = useState("html");

  useEffect(() => {
    if (storageCodes) {
      setCodes(prev => {
        let changed = false;
        const next = { ...prev };
        for (const [k, v] of Object.entries(storageCodes)) {
          // If remote value is different from local, update local
          if (v !== prev[k]) {
            console.log(`[Liveblocks] Remote update received for ${k}`);
            next[k] = v;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }
  }, [storageCodes]);

  useEffect(() => {
    if (storageLanguage && storageLanguage !== language) {
      setLanguage(storageLanguage);
    }
  }, [storageLanguage, language]);

  const [snippetId, setSnippetId] = useState<string | null>(propSnippetId);

  useEffect(() => {
    console.log("[Liveblocks] Current Room ID:", snippetId ? `codivir-snippet-${snippetId}` : "codivir-scratchpad");
  }, [snippetId]);
  const [isEdited, setIsEdited]   = useState(false);
  const [darkMode, setDarkMode]   = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [username, setUsername]   = useState("");

  useEffect(() => {
    const newName = `Dev_${Math.floor(Math.random() * 900) + 100}`;
    setUsername(newName);
    updateMyPresence({ username: newName });
  }, []); // Run once on mount

  /* Execution state */
  const [output,    setOutput]    = useState<string>("");
  const [stderr,    setStderr]    = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [runCode_,  setRunCode_]  = useState<"idle" | "ok" | "err">("idle");
  const [execMs,    setExecMs]    = useState<number | null>(null);
  const [hasRun,    setHasRun]    = useState(false);

  const typingTimeout  = useRef<NodeJS.Timeout | null>(null);

  const isWebMode = WEB.includes(language);
  const cfg = LANGS[language] || LANGS["html"];

  const readExecutionResult = (data: Judge0Response) => {
    const stdout = decodeBase64Utf8(data.stdout);
    const parts = [
      decodeBase64Utf8(data.stderr),
      decodeBase64Utf8(data.compile_output),
      decodeBase64Utf8(data.message),
      decodeBase64Utf8(data.error),
    ]
      .filter((part): part is string => typeof part === "string" && part.trim().length > 0);

    if (!stdout && !parts.length && data.status?.description && data.status.id !== 3) {
      parts.push(data.status.description);
    }

    return {
      stdout,
      stderr: parts.join("\n"),
      ok: data.status?.id === 3,
    };
  };

  /* ── Code execution via Judge0 ── */
  const runCode = useCallback(async () => {
    if (isWebMode || !cfg || !cfg.judge0Id || isRunning) return;
    setIsRunning(true);
    setHasRun(true);
    setOutput("");
    setStderr("");
    setRunCode_("idle");
    const t0 = Date.now();
    try {
      const res = await fetch("https://ce.judge0.com/submissions?base64_encoded=true&wait=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: encodeBase64Utf8(codes[language] || ""),
          language_id: cfg.judge0Id,
          stdin: encodeBase64Utf8(""),
        }),
      });
      const data: Judge0Response = await res.json();
      setExecMs(Date.now() - t0);

      const result = readExecutionResult(data);
      setOutput(result.stdout);
      setStderr(result.stderr);
      setRunCode_(result.ok ? "ok" : "err");
    } catch {
      setStderr("Network error — check your connection.");
      setRunCode_("err");
      setExecMs(Date.now() - t0);
    } finally {
      setIsRunning(false);
    }
  }, [cfg, codes, isRunning, isWebMode, language]);

  useEffect(() => {
    if (!propSnippetId) return;

    let cancelled = false;

    const loadSnippet = async () => {
      try {
        const res = await fetch(`/api/snippet/${propSnippetId}`);
        if (!res.ok) return;

        const data = await res.json();
        if (cancelled) return;

        if (data.codes && typeof data.codes === "object") {
          setCodes(prev => ({ ...prev, ...data.codes }));
          // Seed storage if empty
          if (storageCodes && Object.keys(storageCodes).length === 0) {
            for (const [l, c] of Object.entries(data.codes as Record<string, string>)) {
              updateStorageCode(l, c);
            }
          }
        }

        if (typeof data.language === "string" && LANGS[data.language]) {
          setLanguage(data.language);
          if (!storageLanguage) setStorageLanguage(data.language);
        } else {
          setLanguage("html");
        }

        if (data.theme === "dark" || data.theme === "light") {
          setDarkMode(data.theme === "dark");
        }
      } catch {
        // Ignore load failures and keep local defaults.
      }
    };

    loadSnippet();

    return () => {
      cancelled = true;
    };
  }, [propSnippetId]);

  /* ── Ctrl+Enter shortcut ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); runCode(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [runCode]);

  /* ── Code change ── */
  const handleChange = (value: string | undefined, lang: string) => {
    const code = value ?? "";
    setCodes(prev => ({ ...prev, [lang]: code }));
    setIsEdited(true);
    
    // Liveblocks Sync
    lastSynced.current[lang] = code;
    updateStorageCode(lang, code);
    updateMyPresence({ isTyping: true, language: lang });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      updateMyPresence({ isTyping: false });
    }, 2000);

    /* clear stale output when code changes */
    setHasRun(false);
  };

  /* ── Share ── */
  const handleShareAndCopy = async () => {
    try {
      const payload = { codes, language, theme: darkMode ? "dark" : "light" };
      const res = await fetch(
        snippetId ? `/api/snippet/${snippetId}` : `/api/snippet`,
        { 
          method: snippetId ? "PUT" : "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify(payload) 
        }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.id) {
        const isNew = !snippetId;
        setSnippetId(data.id);
        onSnippetIdChange?.(data.id);
        navigator.clipboard.writeText(`${window.location.origin}/snippet/${data.id}`);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2500);

        if (isNew) {
          // If it was a scratchpad, redirect to the new snippet URL to join its specific room
          router.push(`/snippet/${data.id}`);
        }
      }
      setIsEdited(false);
    } catch { /* silent */ }
  };

  /* ── Language change ── */
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nl = e.target.value;
    setLanguage(nl);
    setStorageLanguage(nl);
    setHasRun(false);
    setOutput(""); setStderr("");
    updateMyPresence({ language: nl });
  };

  /* ── Room state ── */
  const typer = others
    .filter(other => other.presence?.isTyping && other.presence?.language === language)
    .map(other => other.presence?.username)
    .filter(Boolean)
    .join(", ");

  /* ── Pane header component ── */
  const PaneHeader = ({ lang, label, extra }: { lang: string; label?: string; extra?: React.ReactNode }) => {
    const c = lc(lang);
    
    // Find users currently looking at this language
    const usersInLang = others.filter(other => other.presence?.language === lang);

    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 border-b flex-shrink-0 ${c.bg} ${c.border}`}>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
        <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${c.label}`}>{label ?? LANGS[lang]?.display ?? lang}</span>
        
        <div className="ml-auto flex items-center -space-x-1">
          {usersInLang.map((other) => (
            <div 
              key={other.connectionId}
              title={`${other.presence?.username ?? "Anonymous"}${other.presence?.isTyping ? " (typing...)" : ""}`}
              className={`w-5 h-5 rounded-full border border-[#0c0c1a] flex items-center justify-center text-[10px] font-bold text-white bg-purple-600 transition-all ${other.presence?.isTyping ? "ring-2 ring-purple-400 animate-pulse" : ""}`}
            >
              {(other.presence?.username || "A")[0]}
            </div>
          ))}
        </div>
        {extra}
      </div>
    );
  };

  /* ── Render ── */
  return (
    <main className="h-screen bg-[#070711] flex flex-col text-white overflow-hidden">

      {/* ══ Header ══ */}
      <header className="flex items-center justify-between px-3 sm:px-5 py-2 bg-[#0c0c1a] border-b border-white/8 flex-shrink-0 gap-2 z-20">
        {/* Left: logo + status */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <Image src="/resources/codivirlogo.png" alt="CODIVIR" width={78} height={26} className="object-contain flex-shrink-0" />
          <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
          </span>
          {typer && (
            <span className="flex items-center gap-1.5 text-[11px] text-purple-400 font-mono truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse flex-shrink-0" />
              <span className="truncate max-w-[100px]">{typer} typing…</span>
            </span>
          )}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-mono">
             <span className={`w-1.5 h-1.5 rounded-full ${status === 'connected' ? 'bg-emerald-500' : status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}`} />
             <span className="text-gray-500 capitalize">{status}</span>
          </div>
        </div>

        {/* Center: language selector (styled) */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-1 py-0.5">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${lc(language).dot}`} />
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-transparent text-gray-200 text-xs font-mono outline-none cursor-pointer pr-1 max-w-[120px] sm:max-w-[160px]"
          >
            {GROUPS.map(g => {
              const langs = Object.entries(LANGS).filter(([, v]) => v.group === g);
              if (!langs.length) return null;
              return (
                <optgroup key={g} label={`── ${g} ──`} className="bg-[#1a1a2e] text-gray-400">
                  {langs.map(([id, v]) => (
                    <option key={id} value={id} className="bg-[#0c0c1a] text-gray-200">
                      {v.display}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>

        {/* Right: run + controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Run button — only for non-web runnable languages */}
          {!isWebMode && cfg.judge0Id && (
            <button
              onClick={runCode}
              disabled={isRunning}
              title="Run (Ctrl+Enter)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                isRunning
                  ? "bg-purple-600/40 text-purple-300 cursor-wait"
                  : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40 cursor-pointer"
              }`}
            >
              {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
              <span className="hidden sm:block">{isRunning ? "Running…" : "Run"}</span>
            </button>
          )}
          {/* Theme */}
          <button onClick={() => setDarkMode(d => !d)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 text-gray-400 transition-colors">
            {darkMode ? <Sun size={13} /> : <Moon size={13} />}
          </button>
          {/* User badge */}
          <span className="hidden sm:flex px-2 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-gray-500 font-mono items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{username}
          </span>
          {/* Share */}
          <button
            onClick={handleShareAndCopy}
            disabled={!isEdited}
            title="Share link"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              isEdited
                ? "bg-white/8 hover:bg-white/12 border border-white/15 text-gray-300 cursor-pointer"
                : "bg-white/3 border border-white/5 text-gray-700 cursor-not-allowed"
            }`}
          >
            <Share2 size={12} />
            <span className="hidden sm:block">Share</span>
          </button>
        </div>
      </header>

      {/* Notification bar (Simplified) */}
      {others.length > 0 && (
        <div className="flex items-center justify-center gap-2 py-1.5 bg-purple-600/10 border-b border-purple-500/20 text-purple-300 text-[10px] font-mono flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          {others.length} developer{others.length > 1 ? 's' : ''} collaborating
        </div>
      )}

      {/* ══ Editor Area ══ */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {isWebMode ? (
          /* ── Web Mode: 2×2 grid ── */
          <div className="grid grid-cols-2 grid-rows-2 h-full" style={{ gap: "1px", background: "rgba(255,255,255,0.05)" }}>
            {/* HTML */}
            <div className="flex flex-col bg-[#0c0c1a] overflow-hidden">
              <PaneHeader lang="html" />
              <Editor height="100%" language="html" theme={darkMode ? "vs-dark" : "light"} value={codes.html}
                onChange={v => handleChange(v, "html")}
                options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 8 }, scrollBeyondLastLine: false, wordWrap: "on" }} />
            </div>
            {/* CSS */}
            <div className="flex flex-col bg-[#0c0c1a] overflow-hidden">
              <PaneHeader lang="css" />
              <Editor height="100%" language="css" theme={darkMode ? "vs-dark" : "light"} value={codes.css}
                onChange={v => handleChange(v, "css")}
                options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 8 }, scrollBeyondLastLine: false, wordWrap: "on" }} />
            </div>
            {/* JS */}
            <div className="flex flex-col bg-[#0c0c1a] overflow-hidden">
              <PaneHeader lang="javascript" />
              <Editor height="100%" language="javascript" theme={darkMode ? "vs-dark" : "light"} value={codes.javascript}
                onChange={v => handleChange(v, "javascript")}
                options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 8 }, scrollBeyondLastLine: false, wordWrap: "on" }} />
            </div>
            {/* Live Preview */}
            <div className="flex flex-col bg-[#0c0c1a] overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-emerald-500/8 border-emerald-500/25 flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">Live Preview</span>
              </div>
              <iframe title="Live Preview" className="flex-1 w-full border-none bg-white" sandbox="allow-scripts"
                srcDoc={`<html><head><style>${codes.css}</style></head><body>${codes.html}<script>${codes.javascript}<\/script></body></html>`}
              />
            </div>
          </div>
        ) : (
          /* ── Single language: editor LEFT, terminal RIGHT ── */
          <div className="flex h-full" style={{ gap: "1px", background: "rgba(255,255,255,0.05)" }}>
            {/* Editor pane — 55% */}
            <div className="flex flex-col bg-[#0c0c1a] overflow-hidden" style={{ width: "55%" }}>
              <PaneHeader lang={language} />
              <Editor
                height="100%"
                language={cfg.monaco}
                theme={darkMode ? "vs-dark" : "light"}
                value={codes[language]}
                onChange={v => handleChange(v, language)}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  padding: { top: 10 },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  lineNumbers: "on",
                  renderLineHighlight: "line",
                  smoothScrolling: true,
                }}
              />
            </div>

            {/* Terminal / Output pane — 45% */}
            <div className="flex flex-col bg-[#080810] overflow-hidden" style={{ width: "45%" }}>
              {/* Terminal header */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/8 bg-[#0c0c1a] flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500">Output</span>
                  {/* Status badge */}
                  {runCode_ === "ok"  && <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono"><CheckCircle size={10} />exited 0</span>}
                  {runCode_ === "err" && <span className="flex items-center gap-1 text-[10px] text-red-400 font-mono"><XCircle size={10} />error</span>}
                  {execMs !== null && (
                    <span className="flex items-center gap-1 text-[10px] text-gray-600 font-mono"><Clock size={9} />{execMs}ms</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {/* Keyboard hint */}
                  <span className="hidden sm:flex items-center gap-1 text-[9px] text-gray-700 font-mono">
                    <kbd className="px-1 py-0.5 bg-white/5 rounded text-gray-600">Ctrl</kbd>
                    <kbd className="px-1 py-0.5 bg-white/5 rounded text-gray-600">↵</kbd>
                  </span>
                  {cfg.judge0Id && (
                    <button onClick={runCode} disabled={isRunning || !cfg.judge0Id}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-all ${
                        isRunning ? "text-purple-400 cursor-wait" : "text-purple-400 hover:text-white hover:bg-purple-600/30 cursor-pointer"
                      }`}
                    >
                      {isRunning ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} fill="currentColor" />}
                      {isRunning ? "running" : "run"}
                    </button>
                  )}
                </div>
              </div>

              {/* Terminal body */}
              <div className="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed">
                {!hasRun && !isRunning && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
                    <Play size={28} className="text-purple-400" />
                    <p className="text-gray-500 text-xs text-center">
                      {cfg.judge0Id
                        ? `Press Run or Ctrl+Enter\nto execute ${cfg.display}`
                        : `${cfg.display} runs live in the preview pane →`}
                    </p>
                  </div>
                )}
                {isRunning && (
                  <div className="flex items-center gap-2 text-purple-400">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-xs">Executing {cfg.display}…</span>
                  </div>
                )}
                {hasRun && !isRunning && (
                  <>
                    {/* stdout */}
                    {output && (
                      <pre className="text-gray-200 whitespace-pre-wrap break-words text-xs sm:text-sm">{output}</pre>
                    )}
                    {/* stderr */}
                    {stderr && (
                      <pre className="text-red-400 whitespace-pre-wrap break-words text-xs sm:text-sm mt-2">{stderr}</pre>
                    )}
                    {/* Empty output */}
                    {!output && !stderr && (
                      <span className="text-gray-600 text-xs italic">No output produced.</span>
                    )}
                  </>
                )}
              </div>

              {/* Terminal status line */}
              <div className="flex items-center justify-between px-3 py-1 border-t border-white/5 bg-[#0a0a14] flex-shrink-0">
                <span className="text-[9px] text-gray-700 font-mono">judge0 · {cfg.display}</span>
                <span className="text-[9px] text-gray-700 font-mono">{username}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ Share Toast ══ */}
      {showPopup && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full shadow-2xl text-sm font-medium animate-none">
          <CheckCircle size={14} />
          Link copied to clipboard!
        </div>
      )}
    </main>
  );
}
