import { CollaborativeRoom } from "../../components/CollaborativeRoom";
import EditorComponent from "../../components/EditorComponent";

export default async function SnippetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: snippetId } = await params;

  return (
    <CollaborativeRoom roomId={`codivir-snippet-${snippetId}`}>
      <EditorComponent snippetId={snippetId} />
    </CollaborativeRoom>
  );
}
