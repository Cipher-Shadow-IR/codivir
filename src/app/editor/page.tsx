"use client";
import EditorComponent from "../components/EditorComponent";
import "../globals.css";

import { CollaborativeRoom } from "../components/CollaborativeRoom";

export default function EditorPage() {
  return (
    <CollaborativeRoom roomId="codivir-scratchpad">
      <EditorComponent />
    </CollaborativeRoom>
  );
}
