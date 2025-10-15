"use client";
import EditorComponent from "./components/EditorComponent";
import "./globals.css";


export default function HomePage() {
  const defaultHTML = `
<html>
  <head>
    <title>HTML Sample</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <style type="text/css">
      h1 {
        color: #cca3a3;
      }
    </style>
    <script type="text/javascript">
      alert("I am a sample... edit me and share it with your friends");
    </script>
  </head>
  <body>
    <h1>Heading No.1</h1>
    <input disabled type="button" value="Click me" />
  </body>
</html>
  `;

  return <EditorComponent initialCode={defaultHTML} />;
}