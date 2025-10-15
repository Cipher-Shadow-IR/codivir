import EditorComponent from "../../components/EditorComponent";

export default async function SnippetPage({
  params,
}: {
  params: Promise<{ id: string }>; // ✅ params is a Promise
}) {
  const { id: snippetId } = await params; // ✅ await before using

  return <EditorComponent initialCode="" snippetId={snippetId} />;
}