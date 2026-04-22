import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import clsx from "clsx";
import { usePosts } from "../../hooks/usePosts";

function formatRelative(timestamp) {
  if (!timestamp?.toDate) return "";
  try {
    return formatDistanceToNow(timestamp.toDate(), {
      addSuffix: true,
      locale: nl,
    });
  } catch {
    return "";
  }
}

export function PostList() {
  const { posts, isLoading } = usePosts();
  const { postId } = useParams();
  const navigate = useNavigate();

  if (isLoading && posts.length === 0) {
    return <p className="text-steel text-xs px-6">Laden...</p>;
  }
  if (posts.length === 0) {
    return <p className="text-steel text-xs px-6">Nog geen posts.</p>;
  }

  return (
    <ul className="flex flex-col">
      {posts.map((post) => {
        const active = post.id === postId;
        return (
          <li key={post.id}>
            <button
              onClick={() => navigate(`/editor/${post.id}`)}
              className={clsx(
                "w-full text-left px-6 py-3 font-body transition-colors",
                active
                  ? "bg-darkblue border-l-4 border-orange"
                  : "hover:bg-darkblue"
              )}
            >
              <div className="text-cream truncate">{post.title}</div>
              <div className="text-steel text-xs">
                {formatRelative(post.updatedAt)}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
