import { create } from "zustand";
import { Timestamp } from "firebase/firestore";
import {
  createPost,
  deletePost,
  getPost,
  listPostsForUser,
} from "../lib/firebase/firestore";

export const usePostStore = create((set, get) => ({
  posts: [],
  currentPost: null,
  isLoading: false,
  error: null,

  async loadPosts(uid) {
    set({ isLoading: true, error: null });
    try {
      const posts = await listPostsForUser(uid);
      set({ posts, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err?.message || "Posts laden mislukt.",
      });
    }
  },

  async createAndNavigate(uid, { title, format }, navigate) {
    const postId = await createPost(uid, { title, format });
    const now = Timestamp.now();
    const optimistic = {
      id: postId,
      ownerId: uid,
      title,
      status: "draft",
      format,
      createdAt: now,
      updatedAt: now,
      tags: [],
      slideOrder: [],
      slides: {},
      shareToken: null,
      thumbnailDataUrl: null,
    };
    set({ posts: [optimistic, ...get().posts] });
    navigate(`/editor/${postId}`);
  },

  async loadPost(postId) {
    set({ isLoading: true, currentPost: null, error: null });
    try {
      const post = await getPost(postId);
      set({ currentPost: post, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err?.message || "Post laden mislukt.",
      });
    }
  },

  clearCurrentPost() {
    set({ currentPost: null });
  },

  async deletePostAction(postId) {
    await deletePost(postId);
    set({
      posts: get().posts.filter((p) => p.id !== postId),
      currentPost:
        get().currentPost?.id === postId ? null : get().currentPost,
    });
  },
}));

if (import.meta.env.DEV) {
  window.__postStore = usePostStore;
}
