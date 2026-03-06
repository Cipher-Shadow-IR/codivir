"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Sun, Moon, Play, Loader2, Share2, Clock, CheckCircle, XCircle } from "lucide-react";
import { io, Socket } from "socket.io-client";
import "../globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

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
  ruby: { display: "Ruby", monaco: "ruby", judge0Id: 72, group: "Scripting",
    template: `class Person
  attr_reader :name, :age
  def initialize(name, age) = @name, @age = name, age
  def greet = puts "Hello, I'm #{@name}, #{@age} years old."
end
Person.new("Alice", 25).greet
puts "Powered by CODIVIR ⚡"` },
  lua: { display: "Lua", monaco: "lua", judge0Id: 64, group: "Scripting",
    template: `function greet(name, age)
  print(string.format("Hello, I'm %s, %d years old.", name, age))
end
greet("Alice", 25)
print("Powered by CODIVIR ⚡")` },
  perl: { display: "Perl", monaco: "perl", judge0Id: 85, group: "Scripting",
    template: `#!/usr/bin/perl
use strict; use warnings;
my %p = (name => "Alice", age => 25);
printf "Hello, I'm %s, %d years old.\\n", $p{name}, $p{age};
print "Powered by CODIVIR ⚡\\n";` },
  php: { display: "PHP", monaco: "php", judge0Id: 68, group: "Scripting",
    template: `<?php
class Person {
    public function __construct(public string $name, public int $age) {}
    public function greet(): void {
        echo "Hello, I'm {$this->name}, {$this->age} years old.\\n";
    }
}
(new Person("Alice", 25))->greet();
echo "Powered by CODIVIR ⚡\\n";` },
  bash: { display: "Bash", monaco: "shell", judge0Id: 46, group: "Scripting",
    template: `#!/bin/bash
NAME="Alice"; AGE=25
echo "Hello, I'm $NAME, $AGE years old."
echo "Powered by CODIVIR ⚡"
for i in {1..3}; do echo "  → step $i"; done` },
  r: { display: "R", monaco: "r", judge0Id: 80, group: "Scripting",
    template: `greet <- function(name, age) {
  cat(sprintf("Hello, I'm %s, %d years old.\\n", name, age))
}
greet("Alice", 25)
cat("Powered by CODIVIR ⚡\\n")` },
  coffeescript: { display: "CoffeeScript", monaco: "coffeescript", judge0Id: null, group: "Scripting",
    template: `greet = (name, age) ->
  console.log "Hello, I'm #{name}, #{age} years old."
greet "Alice", 25
console.log "Powered by CODIVIR ⚡"` },

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
  zig: { display: "Zig", monaco: "plaintext", judge0Id: 91, group: "Systems",
    template: `const std = @import("std");
pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("Hello from Zig!\\n", .{});
    try stdout.print("Powered by CODIVIR ⚡\\n", .{});
}` },
  nim: { display: "Nim", monaco: "plaintext", judge0Id: null, group: "Systems",
    template: `type Person = object
  name: string; age: int
proc greet(p: Person) =
  echo "Hello, I'm ", p.name, ", ", p.age, " years old."
let p = Person(name: "Alice", age: 25)
p.greet()
echo "Powered by CODIVIR ⚡"` },

  /* JVM */
  java: { display: "Java", monaco: "java", judge0Id: 62, group: "JVM",
    template: `public class Main {
    record Person(String name, int age) {
        void greet() { System.out.printf("Hello, I'm %s, %d years old.%n", name, age); }
    }
    public static void main(String[] args) {
        new Person("Alice", 25).greet();
        System.out.println("Powered by CODIVIR ⚡");
    }
}` },
  kotlin: { display: "Kotlin", monaco: "kotlin", judge0Id: 78, group: "JVM",
    template: `data class Person(val name: String, val age: Int) {
    fun greet() = println("Hello, I'm $name, $age years old.")
}
fun main() {
    Person("Alice", 25).greet()
    println("Powered by CODIVIR ⚡")
}` },
  scala: { display: "Scala", monaco: "scala", judge0Id: 81, group: "JVM",
    template: `@main def run(): Unit =
  case class Person(name: String, age: Int):
    def greet() = println(s"Hello, I'm $name, $age years old.")
  Person("Alice", 25).greet()
  println("Powered by CODIVIR ⚡")` },
  groovy: { display: "Groovy", monaco: "plaintext", judge0Id: 86, group: "JVM",
    template: `def person = [name: 'Alice', age: 25]
println "Hello, I'm \${person.name}, \${person.age} years old."
println "Powered by CODIVIR ⚡"` },
  clojure: { display: "Clojure", monaco: "clojure", judge0Id: 86, group: "JVM",
    template: `(defn greet [name age]
  (println (str "Hello, I'm " name ", " age " years old.")))
(greet "Alice" 25)
(println "Powered by CODIVIR ⚡")` },

  /* Typed */
  typescript: { display: "TypeScript", monaco: "typescript", judge0Id: 74, group: "Typed",
    template: `type Person = { name: string; age: number };
const greet = ({ name, age }: Person): void => {
  console.log(\`Hello, I'm \${name}, \${age} years old.\`);
};
greet({ name: "Alice", age: 25 });
console.log("Powered by CODIVIR ⚡");` },
  csharp: { display: "C#", monaco: "csharp", judge0Id: 51, group: "Typed",
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
  swift: { display: "Swift", monaco: "swift", judge0Id: 83, group: "Typed",
    template: `struct Person { var name: String; var age: Int
    func greet() { print("Hello, I'm \\(name), \\(age) years old.") }
}
Person(name: "Alice", age: 25).greet()
print("Powered by CODIVIR ⚡")` },
  dart: { display: "Dart", monaco: "dart", judge0Id: 90, group: "Typed",
    template: `class Person {
  final String name; final int age;
  Person(this.name, this.age);
  void greet() => print('Hello, I\\'m $name, $age years old.');
}
void main() {
  Person('Alice', 25).greet();
  print('Powered by CODIVIR ⚡');
}` },

  /* Functional */
  haskell: { display: "Haskell", monaco: "plaintext", judge0Id: 61, group: "Functional",
    template: `data Person = Person { name :: String, age :: Int }
greet :: Person -> String
greet p = "Hello, I'm " ++ name p ++ ", " ++ show (age p) ++ " years old."
main :: IO ()
main = do
  let p = Person "Alice" 25
  putStrLn (greet p)
  putStrLn "Powered by CODIVIR ⚡"` },
  elixir: { display: "Elixir", monaco: "plaintext", judge0Id: 57, group: "Functional",
    template: `defmodule Person do
  defstruct name: "", age: 0
  def greet(%Person{name: n, age: a}), do: IO.puts("Hello, I'm #{n}, #{a} years old.")
end
Person.greet(%Person{name: "Alice", age: 25})
IO.puts("Powered by CODIVIR ⚡")` },
  julia: { display: "Julia", monaco: "julia", judge0Id: 65, group: "Functional",
    template: `struct Person; name::String; age::Int; end
greet(p::Person) = println("Hello, I'm $(p.name), $(p.age) years old.")
greet(Person("Alice", 25))
println("Powered by CODIVIR ⚡")` },
  erlang: { display: "Erlang", monaco: "plaintext", judge0Id: 58, group: "Functional",
    template: `-module(main).
-export([main/0]).
main() ->
    io:format("Hello from Erlang!~n"),
    io:format("Powered by CODIVIR ⚡~n").` },
  ocaml: { display: "OCaml", monaco: "plaintext", judge0Id: 65, group: "Functional",
    template: `let () =
  let name = "Alice" and age = 25 in
  Printf.printf "Hello, I'm %s, %d years old.\\n" name age;
  print_endline "Powered by CODIVIR ⚡"` },
  fsharp: { display: "F#", monaco: "fsharp", judge0Id: 87, group: "Functional",
    template: `type Person = { Name: string; Age: int }
let greet p = printfn "Hello, I'm %s, %d years old." p.Name p.Age
greet { Name = "Alice"; Age = 25 }
printfn "Powered by CODIVIR ⚡"` },

  /* Database */
  sql: { display: "SQL", monaco: "sql", judge0Id: 82, group: "Database",
    template: `-- SQLite
CREATE TABLE persons (id INTEGER PRIMARY KEY, name TEXT, age INTEGER);
INSERT INTO persons VALUES (1, 'Alice', 25);
INSERT INTO persons VALUES (2, 'Bob', 30);
SELECT * FROM persons WHERE age < 28;
SELECT COUNT(*) as total FROM persons;` },

  /* Misc */
  brainfuck: { display: "Brainfuck", monaco: "plaintext", judge0Id: null, group: "Esoteric",
    template: `++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.` },
};

const WEB = ["html", "css", "javascript"];
const GROUPS = ["Web", "Scripting", "Systems", "JVM", "Typed", "Functional", "Database", "Esoteric"];

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
  cpp:        { dot: "bg-pink-400",   label: "text-pink-400",   border: "border-pink-500/25",   bg: "bg-pink-500/8"   },
  c:          { dot: "bg-blue-300",   label: "text-blue-300",   border: "border-blue-300/25",   bg: "bg-blue-300/8"   },
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
  const [codes, setCodes] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(LANGS).map(([k, v]) => [k, v.template]))
  );
  const [language, setLanguage]   = useState("html");
  const [snippetId, setSnippetId] = useState<string | null>(propSnippetId);
  const [isEdited, setIsEdited]   = useState(false);
  const [isTyping, setIsTyping]   = useState(false);
  const [darkMode, setDarkMode]   = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [typer, setTyper]         = useState<string | null>(null);
  const [username, setUsername]   = useState("");
  const [presence, setPresence]   = useState<Record<string, string>>({});

  useEffect(() => {
    setUsername(`Dev_${Math.floor(Math.random() * 900) + 100}`);
  }, []);
  const [notification, setNotification] = useState<string | null>(null);

  /* Execution state */
  const [output,    setOutput]    = useState<string>("");
  const [stderr,    setStderr]    = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [runCode_,  setRunCode_]  = useState<"idle" | "ok" | "err">("idle");
  const [execMs,    setExecMs]    = useState<number | null>(null);
  const [hasRun,    setHasRun]    = useState(false);

  const socketRef      = useRef<Socket | null>(null);
  const typingTimeout  = useRef<NodeJS.Timeout | null>(null);
  const presenceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const isWebMode = WEB.includes(language);
  const cfg        = LANGS[language];

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
    if (isWebMode || !cfg.judge0Id || isRunning) return;
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
          source_code: encodeBase64Utf8(codes[language]),
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
        const res = await fetch(`${BASE_URL}/api/snippets/${propSnippetId}`);
        if (!res.ok) return;

        const data = await res.json();
        if (cancelled) return;

        if (data.codes && typeof data.codes === "object") {
          setCodes(prev => ({ ...prev, ...data.codes }));
        }

        if (typeof data.language === "string" && LANGS[data.language]) {
          setLanguage(data.language);
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
    setIsTyping(true);
    if (socketRef.current && snippetId) {
      socketRef.current.emit("code-change", { id: snippetId, language: lang, code });
      socketRef.current.emit("typing", { id: snippetId, username, language: lang });
    }
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setIsTyping(false), 2000);
    /* clear stale output when code changes */
    setHasRun(false);
  };

  /* ── Share ── */
  const handleShareAndCopy = async () => {
    try {
      const payload = { codes, language, theme: darkMode ? "dark" : "light" };
      const res = await fetch(
        snippetId ? `${BASE_URL}/api/snippets/${snippetId}` : `${BASE_URL}/api/snippets`,
        { method: snippetId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.id) {
        setSnippetId(data.id);
        onSnippetIdChange?.(data.id);
        navigator.clipboard.writeText(`${window.location.origin}/snippet/${data.id}`);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2500);
      }
      setIsEdited(false);
    } catch { /* silent */ }
  };

  /* ── Language change ── */
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nl = e.target.value;
    setLanguage(nl);
    setHasRun(false);
    setOutput(""); setStderr("");
  };

  /* ── Socket ── */
  useEffect(() => {
    socketRef.current = io(BASE_URL);
    socketRef.current.on("connect", () => {
      if (snippetId) socketRef.current?.emit("join-snippet", snippetId);
    });
    socketRef.current.on("code-update", (data) => {
      if (isTyping && data.language === language) return;
      setCodes(prev => ({ ...prev, [data.language]: data.code }));
      if (!isWebMode && data.language !== language) {
        setNotification(`Someone edited ${data.language.toUpperCase()}`);
        setTimeout(() => setNotification(null), 3000);
      }
    });
    socketRef.current.on("user-typing", (data: { username: string; language: string }) => {
      setPresence(prev => ({ ...prev, [data.language]: data.username }));
      if (presenceTimers.current[data.language]) clearTimeout(presenceTimers.current[data.language]);
      presenceTimers.current[data.language] = setTimeout(() => {
        setPresence(prev => { const s = { ...prev }; delete s[data.language]; return s; });
      }, 3000);
    });
    return () => { socketRef.current?.disconnect(); };
  }, [snippetId, language, isTyping, isWebMode]);

  useEffect(() => {
    if (snippetId && socketRef.current) socketRef.current.emit("join-snippet", snippetId);
  }, [snippetId]);

  /* ── Pane header component ── */
  const PaneHeader = ({ lang, label, extra }: { lang: string; label?: string; extra?: React.ReactNode }) => {
    const c = lc(lang);
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 border-b flex-shrink-0 ${c.bg} ${c.border}`}>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
        <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${c.label}`}>{label ?? LANGS[lang]?.display ?? lang}</span>
        {presence[lang] && (
          <span className="ml-auto flex items-center gap-1 text-[10px] bg-purple-600/80 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
            <span className="w-1 h-1 rounded-full bg-white" />{presence[lang]}
          </span>
        )}
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
              <span className="truncate">{typer} typing…</span>
            </span>
          )}
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

      {/* Notification bar */}
      {notification && (
        <div className="flex items-center justify-center gap-2 py-1.5 bg-purple-600/20 border-b border-purple-500/30 text-purple-300 text-xs font-mono flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          {notification}
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
