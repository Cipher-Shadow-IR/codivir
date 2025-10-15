"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Sun, Moon } from "lucide-react";
import "../globals.css";

const BASE_URL = "https://codivir-backend.onrender.com"; // Render backend


interface EditorComponentProps {
  snippetId?: string | null;
  onSnippetIdChange?: (id: string) => void;
}

export default function EditorComponent({
  snippetId: propSnippetId = null,
  onSnippetIdChange,
}: EditorComponentProps) {
  const defaultTemplates: Record<string, string> = {
  html: `
<html>
  <head>
    <title>HTML Sample</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <style type="text/css">
      h1 { color: #cca3a3; }
    </style>
    <script type="text/javascript">
      alert("I am a sample... edit me and share it with your friends");
    </script>
  </head>
  <body>
    <h1>Heading No.1</h1>
    <input disabled type="button" value="Click me" />
  </body>
</html>`,

  css: `/* CSS Sample */
body { 
  background-color: #f0f0f0;
  font-family: Arial,
  sans-serif; }
h1 {
  color: #cca3a3;
  text-align: center;
}
button {
  background-color: #cca3a3;
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
}`,

  javascript: `// JavaScript Sample
const heading = document.createElement("h1");
heading.textContent = "Hello JavaScript!";
heading.style.color = "#cca3a3";
document.body.appendChild(heading);

const btn = document.createElement("button");
btn.textContent = "Click me";
btn.disabled = true;
document.body.appendChild(btn);`,

  python: `# Python Sample
class Person:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age

    def greet(self):
        print(f"Hello, I am {self.name}, {self.age} years old!")

p = Person("Alice", 25)
p.greet()`,
  dart: `// Dart sample
void main() {
  final name = 'Dart';
  print('Hello from $name!');
}`,

  julia: `# Julia sample
struct Person
  name::String
  age::Int
end

hello(p::Person) = println("Hello, my name is $(p.name) and I'm $(p.age) years old.")

p = Person("Alice", 25)
hello(p)`,

  ruby: `# Ruby sample
class Person
  attr_accessor :name, :age
  def initialize(name, age)
    @name = name
    @age = age
  end

  def greet
    puts "Hello, I'm #{@name}, #{@age} years old."
  end
end

p = Person.new('Alice', 25)
p.greet`,

  java: `// Java sample
public class Main {
  static class Person {
    String name;
    int age;
    Person(String n, int a) { name = n; age = a; }
    void greet() { System.out.println("Hello, I'm " + name + ", " + age + " years old."); }
  }

  public static void main(String[] args) {
    Person p = new Person("Alice", 25);
    p.greet();
  }
}`,

  elixir: `# Elixir sample
defmodule Person do
  defstruct name: "", age: 0

  def greet(%Person{name: name, age: age}) do
    IO.puts("Hello, I'm #{name}, #{age} years old.")
  end
end

p = %Person{name: "Alice", age: 25}
Person.greet(p)`,

  go: `// Go sample
package main

import "fmt"

type Person struct {
  Name string
  Age  int
}

func (p Person) Greet() {
  fmt.Printf("Hello, I'm %s, %d years old.\\n", p.Name, p.Age)
}

func main() {
  p := Person{"Alice", 25}
  p.Greet()
}`,

  php: `<?php
// PHP sample
class Person {
  public $name;
  public $age;
  function __construct($name, $age) {
    $this->name = $name;
    $this->age = $age;
  }
  function greet() {
    echo "Hello, I'm {$this->name}, {$this->age} years old.\\n";
  }
}

$p = new Person("Alice", 25);
$p->greet();
?>`,

  kotlin: `// Kotlin sample
data class Person(val name: String, val age: Int) {
  fun greet() = println("Hello, I'm $name, $age years old.")
}

fun main() {
  val p = Person("Alice", 25)
  p.greet()
}`,

  swift: `// Swift sample
struct Person {
  var name: String
  var age: Int
  func greet() {
    print("Hello, I'm \\(name), \\(age) years old.")
  }
}

let p = Person(name: "Alice", age: 25)
p.greet()`,

  rust: `// Rust sample
struct Person {
  name: String,
  age: u8,
}

impl Person {
  fn greet(&self) {
    println!("Hello, I'm {}, {} years old.", self.name, self.age);
  }
}

fn main() {
  let p = Person { name: String::from("Alice"), age: 25 };
  p.greet();
}`,

  typescript: `// TypeScript sample
type Person = { name: string; age: number };

function greet(p: Person) {
  console.log(\`Hello, I'm \${p.name}, \${p.age} years old.\`);
}

const p: Person = { name: "Alice", age: 25 };
greet(p);`,

  sql: `-- SQL sample (SQLite)
CREATE TABLE IF NOT EXISTS persons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER NOT NULL
);

INSERT INTO persons (name, age) VALUES ('Alice', 25);

SELECT * FROM persons;`
};


  const [codes, setCodes] = useState<Record<string, string>>({
    html: defaultTemplates.html,
    css: defaultTemplates.css,
    javascript: defaultTemplates.javascript,
    typescript: defaultTemplates.typescript,
    python: defaultTemplates.python,
  });

  const [language, setLanguage] = useState("html");
  const [snippetId, setSnippetId] = useState<string | null>(propSnippetId);
  const [isEdited, setIsEdited] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (value?: string) => {
    setCodes((prev) => ({ ...prev, [language]: value || "" }));
    setIsEdited(true);
    setIsTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setIsTyping(false), 2000);
  };

const handleShareAndCopy = async () => {
  try {
    // 1️⃣ Share snippet (POST or PUT)
    const payload = { codes, language, theme: darkMode ? "dark" : "light" };
    const res = await fetch(
      snippetId 
        ? `${BASE_URL}/api/snippets/${snippetId}` 
        : `${BASE_URL}/api/snippets`,   // ← use BASE_URL here
      {
        method: snippetId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );


    if (!res.ok) throw new Error("Failed to save snippet");

    const data = await res.json();
    if (data.id) {
      setSnippetId(data.id);
      onSnippetIdChange?.(data.id);

      // 2️⃣ Copy link to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/snippet/${data.id}`);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    }

    setIsEdited(false);
  } catch (err) {
    console.error("Error sharing snippet:", err);
  }
};

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (!codes[newLang]) setCodes((prev) => ({ ...prev, [newLang]: defaultTemplates[newLang] || "" }));
  };

  // Auto-refresh from remote MySQL backend
  useEffect(() => {
    if (!snippetId) return;
    const interval = setInterval(async () => {
      if (isTyping) return;
      try {
        const res = await fetch(`${BASE_URL}/api/snippets/${snippetId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.codes && data.codes[language] !== codes[language]) {
          setCodes((prev) => ({ ...prev, [language]: data.codes[language] }));
        }
        if (data.language && data.language !== language) {
          setLanguage(data.language);
        }
        if (data.theme) {
          setDarkMode(data.theme === "dark");
          document.documentElement.classList.toggle("dark", data.theme === "dark");
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [snippetId, language, isTyping, codes]);


  return (
    <main className="main-bg">
      <div
        className={`editor ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <header
          className={`editor-header ${
            darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-100 border-gray-300"
          }`}
        >
          <Image
            src="/resources/codivirlogo.png"
            alt="CODIVIR Logo"
            width={120}
            height={50}
            className="editor-title"
          />
          <div className="editor-header-right">
            <button
              onClick={handleShareAndCopy}
              disabled={!isEdited} // only clickable if edited
              className={`editor-share-btn ${isEdited ? "active" : "disabled"}`}
            >
              Share
            </button>
          </div>
        </header>


        <Editor
          height="80vh"
          language={language}
          theme={darkMode ? "vs-dark" : "light"}
          value={codes[language]}
          onChange={handleChange}
        />

        <footer
          className={`editor-footer ${
            darkMode
              ? "bg-gray-900 border-gray-700 text-white"
              : "bg-gray-100 border-gray-300 text-gray-800"
          }`}
        >
          <button onClick={toggleTheme} className="footer-theme-btn">
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            {darkMode ? "Dark Mode" : "Light Mode"}
          </button>

          <select
            value={language}
            onChange={handleLanguageChange}
            className="footer-language-select"
          >
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="dart">Dart</option>
            <option value="julia">Julia</option>
            <option value="ruby">Ruby</option>
            <option value="java">Java</option>
            <option value="elixir">Elixir</option>
            <option value="go">Go</option>
            <option value="php">PHP</option>
            <option value="kotlin">Kotlin</option>
            <option value="swift">Swift</option>
            <option value="rust">Rust</option>
            <option value="typescript">TypeScript</option>
            <option value="sql">SQL</option>
          </select>
        </footer>

        {showPopup && (
          <div
            className={`popup-overlay ${
              darkMode ? "bg-black/50" : "bg-white/30"
            }`}
          >
            <div
              className={`popup-content ${
                darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }`}
            >
              <p>✅ Link copied to clipboard!</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
