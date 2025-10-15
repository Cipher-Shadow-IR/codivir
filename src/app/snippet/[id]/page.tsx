import EditorComponent from "../../components/EditorComponent";

export default function SnippetPage({ params }: { params: { id: string } }) {
  const { id: snippetId } = params;

  return <EditorComponent snippetId={snippetId} />;
}
