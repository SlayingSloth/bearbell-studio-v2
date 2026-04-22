import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";
import { POST_FORMATS } from "../lib/brand/tokens";
import { ConfirmDelete } from "../components/modals/ConfirmDelete";

export function EditorPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const {
    currentPost,
    isLoading,
    loadPost,
    clearCurrentPost,
    deletePostAction,
  } = usePosts();
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!postId) return;
    loadPost(postId);
    return () => clearCurrentPost();
  }, [postId, loadPost, clearCurrentPost]);

  async function handleDelete() {
    await deletePostAction(postId);
    setConfirmOpen(false);
    navigate("/");
  }

  if (isLoading) {
    return <div className="p-8 font-body text-steel">Laden...</div>;
  }

  if (!currentPost) {
    return (
      <div className="p-8 flex flex-col gap-3">
        <h1 className="font-display text-4xl tracking-wide text-navy">
          Post niet gevonden
        </h1>
        <Link to="/" className="text-orange underline font-body">
          Terug naar dashboard
        </Link>
      </div>
    );
  }

  const formatLabel =
    POST_FORMATS[currentPost.format]?.label ?? currentPost.format;

  return (
    <div className="p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-navy">
            {currentPost.title}
          </h1>
          <p className="font-body text-steel mt-1">{formatLabel}</p>
        </div>
        <button
          onClick={() => setConfirmOpen(true)}
          className="text-error text-sm hover:underline font-body"
        >
          Verwijderen
        </button>
      </div>

      <ConfirmDelete
        open={confirmOpen}
        title="Post verwijderen?"
        message={`Weet je zeker dat je "${currentPost.title}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
