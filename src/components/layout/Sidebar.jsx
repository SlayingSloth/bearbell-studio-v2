import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { signOutUser } from "../../lib/firebase/auth";
import { useDriveStore } from "../../stores/driveStore";
import { TAGLINE } from "../../lib/brand/strings";
import { NewPostButton } from "../sidebar/NewPostButton";
import { PostList } from "../sidebar/PostList";

export function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const disconnectDrive = useDriveStore((s) => s.disconnect);

  async function handleLogout() {
    await disconnectDrive();
    await signOutUser();
    navigate("/login");
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="px-6 py-6">
        <h1 className="font-display text-4xl tracking-wide text-cream leading-none">
          BEAR<span className="text-orange">B</span>ELL
        </h1>
        <p className="font-body text-xs tracking-widest text-steel mt-1">
          {TAGLINE}
        </p>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <h2 className="font-body text-xs uppercase tracking-wider text-steel px-6 mb-2">
          Posts
        </h2>
        <NewPostButton />
        <div className="flex-1 overflow-y-auto">
          <PostList />
        </div>
      </div>

      <div className="mt-auto px-6 py-4 border-t border-darkblue">
        <p className="text-xs text-steel truncate">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="mt-2 text-sm text-cream underline font-body"
        >
          Uitloggen
        </button>
      </div>
    </div>
  );
}
