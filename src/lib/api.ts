import { supabase } from "./supabase";
import { Subforum, Post, Comment } from "./types";

export const fetchSubs = async () => {
  return await supabase
    .from("subforums")
    .select("*")
    .then((res) => res.data);
};

export const fetchPost = async (postId) => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();
  if (error) throw error;
  return data;
};

export const fetchPosts = async (subId) => {
  return await supabase
    .from("posts")
    .select("*")
    .eq("subforum_id", subId)
    .then((res) => res.data);
};

export const submitPost = async (post: Post) => {
  try {
    const { data, error } = await supabase.from("posts").insert([post]);
  } catch (error) {
    console.log("Error submiting post: ", error);
  }
  fetchPosts(post.subforum_id);
};

export const fetchComments = async (
  postId: string,
  parentCommentId: string | null = null
): Promise<Comment[]> => {
  let query = supabase.from("comments").select("*").eq("post_id", postId);
  if (!!parentCommentId) query = query.eq("parent_comment", parentCommentId);
  query = query.order("created_at", { ascending: true });
  const { data, error } = await query;

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
  return data as Comment[];
};

export const fetchComment = async (
  commentId: string
): Promise<Comment | null> => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("id", commentId)
    .single();

  if (error) {
    console.error("Error fetching comment:", error);
    return null;
  }

  return data as Comment;
};

export async function submitComment(
  userId: string,
  postId: string,
  content: string,
  parentCommentId: string | null = null
): Promise<void> {
  try {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase.from("comments").insert([
      {
        post_id: postId,
        content: content,
        user_id: userId,
        parent_comment: parentCommentId,
      },
    ]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error submitting comment:", error.message);
    throw error;
  }
}
