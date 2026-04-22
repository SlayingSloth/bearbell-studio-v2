import { useParams } from "react-router-dom";

export function EditorPlaceholder() {
  const { postId } = useParams();
  return (
    <div className="p-8">
      <h1 className="font-display text-4xl tracking-wide text-navy">
        Editor: {postId}
      </h1>
    </div>
  );
}
