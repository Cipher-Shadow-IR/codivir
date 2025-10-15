"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Sun, Moon, Link as LinkIcon, Code, Monitor } from "lucide-react";
import "../globals.css"; // your CSS file

interface EditorComponentProps {
  initialCode: string;
  snippetId?: string | null;
  onSnippetIdChange?: (id: string) => void;
}

export default function EditorComponent({
  snippetId: propSnippetId = null,
  onSnippetIdChange,
}: EditorComponentProps) {
  // Default Templates for Each Language
  const defaultTemplates: Record<string, string> = {
    html: `<html>
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
button { background-color: #cca3a3; color: white; border: none; padding: 8px 12px; cursor: pointer; }`,
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
  const [showOutput, setShowOutput] = useState(false); // for mobile toggle

  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (value?: string) => {
    setCodes((prev) => ({ ...prev, [language]: value || "" }));
    setIsEdited(true);
    setIsTyping(true);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setIsTyping(false), 2000);
  };

  const handleShare = async () => {
    try {
      const payload = { codes, language, theme: darkMode ? "dark" : "light" };

      const res = await fetch(
        snippetId ? `/api/snippets/${snippetId}` : "/api/snippets",
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
      }

      setIsEdited(false);
    } catch (err) {
      console.error("Error sharing snippet:", err);
    }
  };

  const handleCopyLink = () => {
    if (!snippetId) return;
    navigator.clipboard.writeText(
      `${window.location.origin}/snippet/${snippetId}`
    );
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2000);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);

    if (!isEdited && !codes[newLang]) {
      setCodes((prev) => ({ ...prev, [newLang]: defaultTemplates[newLang] }));
    }
  };

  // Auto-refresh per language
  useEffect(() => {
    if (!snippetId) return;
    const interval = setInterval(async () => {
      if (isTyping) return;

      try {
        const res = await fetch(`/api/snippets/${snippetId}`);
        if (!res.ok) return;
        const data = await res.json();

        // Ensure backend returns codes object
        if (data.codes && data.codes[language] !== codes[language]) {
          setCodes((prev) => ({ ...prev, [language]: data.codes[language] }));
        }
        if (data.language && data.language !== language) {
          setLanguage(data.language);
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
            darkMode
              ? "bg-gray-900 border-gray-700"
              : "bg-gray-100 border-gray-300"
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
            {snippetId && (
              <button className="editor-link-btn" onClick={handleCopyLink}>
                <LinkIcon size={18} />
              </button>
            )}

            <button
              onClick={() => setShowOutput(!showOutput)}
              className="p-2 border rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Toggle Output (Mobile)"
            >
              {showOutput ? <Code size={18} /> : <Monitor size={18} />}
            </button>

            <button
              onClick={handleShare}
              disabled={!isEdited && !!snippetId}
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

        {/* Output Pane */}
{/* Output Pane */}
<div className="output-pane">
  {language === "html" || language === "css" || language === "javascript" ? (
    <iframe
      key={language + codes[language]}
      className="output-iframe"
      sandbox="allow-scripts"
      srcDoc={`
        <html>
          <head>
            <style>${codes.css}</style>
          </head>
          <body>
            ${codes.html}
            <script>${codes.javascript}<\/script>
          </body>
        </html>
      `}
    />
  ) : language === "typescript" ? (
    <iframe
      key={codes.typescript}
      className="output-iframe"
      sandbox="allow-scripts"
      srcDoc={`
        <html>
          <body>
            <script type="module">
              ${codes.typescript.replace(
                /^/,
                "console.log('Running TypeScript output simulation...');"
              )}
            <\/script>
          </body>
        </html>
      `}
    />
  ) : (
    <div className="output-text">
      <pre>{codes.python}</pre>
    </div>
  )}
</div>


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
