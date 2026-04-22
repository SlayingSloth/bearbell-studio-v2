import { useEffect } from "react";
import { usePostStore } from "../stores/postStore";
import { useAuth } from "./useAuth";

/**
 * Exposes the post list and post-related actions. On mount (or when uid
 * changes), triggers a one-time load if the store is empty.
 */
export function usePosts() {
  const { user } = useAuth();
  const uid = user?.uid;

  const posts = usePostStore((s) => s.posts);
  const currentPost = usePostStore((s) => s.currentPost);
  const isLoading = usePostStore((s) => s.isLoading);
  const error = usePostStore((s) => s.error);
  const loadPosts = usePostStore((s) => s.loadPosts);
  const createAndNavigate = usePostStore((s) => s.createAndNavigate);
  const loadPost = usePostStore((s) => s.loadPost);
  const clearCurrentPost = usePostStore((s) => s.clearCurrentPost);
  const deletePostAction = usePostStore((s) => s.deletePostAction);

  useEffect(() => {
    if (!uid) return;
    const state = usePostStore.getState();
    if (state.posts.length > 0 || state.isLoading) return;
    loadPosts(uid);
  }, [uid, loadPosts]);

  return {
    uid,
    posts,
    currentPost,
    isLoading,
    error,
    createAndNavigate,
    loadPost,
    clearCurrentPost,
    deletePostAction,
  };
}
