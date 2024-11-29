import { supabase } from "./supabase";
import { Subforum, Post, Comment, User } from "./types";

export const fetchUserName = async (userId: string): Promise<string> => {
  const { data, error } = await supabase
    .from("users")
    .select("username")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data.username as string;
};

export const fetchUserQuery = async (
  userId: string,
  query: string,
): Promise<Partial<User>> => {
  const { data, error } = await supabase
    .from("users")
    .select(query)
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data as Partial<User>;
};

export const fetchUser = async (
  userId: string,
): Promise<User | Partial<User>> => {
  return await fetchUserQuery(userId, "*");
};

export const fetchSub = async (subId: string): Promise<Subforum | null> => {
  const { data, error } = await supabase
    .from("subforums")
    .select("*")
    .eq("id", subId)
    .single();
  if (error) throw error;
  return data;
};

export const fetchSubs = async (): Promise<Subforum[]> => {
  const { data, error } = await supabase.from("subforums").select("*");
  if (error) throw error;
  return data;
};

export const fetchFollowedSubs = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_subforum_follows")
    .select("subforum_id")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
};

export const fetchPost = async (postId: string): Promise<Post | null> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();
  if (error) throw error;
  return data;
};

export const fetchPosts = async (subId: string): Promise<Post[] | null> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("subforum_id", subId);
  if (error) throw error;
  return data;
};

export const submitPost = async (post: Post) => {
  const { error } = await supabase.from("posts").insert([post]);
  if (error) throw error;
  fetchPosts(post.subforum_id);
};

export const submitSub = async (sub: Subforum) => {
  const { error } = await supabase.from("subforums").insert([sub]);
  if (error) throw error;
  fetchPosts(sub.id);
};

export const followSub = async (userId: String, subId: String) => {
  const { error } = await supabase
    .from("user_subforum_follows")
    .insert({ user_id: userId, subforum_id: subId });
  if (error) throw error;
};

export const unfollowSub = async (userId: String, subId: String) => {
  const { error } = await supabase
    .from("user_subforum_follows")
    .delete()
    .eq("user_id", userId)
    .eq("subforum_id", subId);
  if (error) throw error;
};

export const fetchComments = async (
  postId: string,
  parentCommentId: string | null = null,
): Promise<Comment[]> => {
  let query = supabase.from("comments").select("*").eq("post_id", postId);
  if (!!parentCommentId) query = query.eq("parent_comment", parentCommentId);
  query = query.order("score", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data as Comment[];
};

export const fetchComment = async (
  commentId: string,
): Promise<Comment | null> => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("id", commentId)
    .single();

  if (error) {
    throw error;
  }

  return data as Comment;
};

export const fetchCommentVote = async (commentId: string, userId: string) => {
  const { data, error } = await supabase
    .from("comment_votes")
    .select("vote")
    .eq("user_id", userId)
    .eq("comment_id", commentId)
    .single();

  if (error && error.code !== "PGRST116") {
    // code PGRST116 means no rows found
    throw new Error(`Error fetching vote: ${error.message}`);
  }

  return data;
};

export const submitComment = async (
  userId: string,
  postId: string,
  content: string,
  parentCommentId: string | null = null,
): Promise<void> => {
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
};

export const voteComment = async (
  userId: string,
  commentId: string,
  vote: number,
) => {
  // Step 1: Check if the user has already voted on the comment
  const { data: existingVote, error: voteFetchError } = await supabase
    .from("comment_votes")
    .select("*")
    .eq("user_id", userId)
    .eq("comment_id", commentId)
    .single();

  if (voteFetchError && voteFetchError.code !== "PGRST116") {
    // code PGRST116 means no rows found
    throw new Error(`Error fetching vote: ${voteFetchError.message}`);
  }

  // Step 2: Fetch the current score of the comment
  const { data: commentData, error: commentFetchError } = await supabase
    .from("comments")
    .select("score")
    .eq("id", commentId)
    .single();

  if (commentFetchError || !commentData) {
    throw new Error(
      `Error fetching comment score: ${commentFetchError?.message}`,
    );
  }

  let newScore = commentData.score;

  if (existingVote) {
    if (existingVote.vote === vote) {
      // Step 3: Remove the existing vote and subtract its value from the comment score
      const { error: deleteVoteError } = await supabase
        .from("comment_votes")
        .delete()
        .eq("user_id", userId)
        .eq("comment_id", commentId);

      if (deleteVoteError) {
        throw new Error(`Error deleting vote: ${deleteVoteError.message}`);
      }

      // Update the comment score
      newScore -= vote;
    } else {
      // Step 4: Update the existing vote and adjust the comment score by the difference (vote * 2)
      const { error: updateVoteError } = await supabase
        .from("comment_votes")
        .update({ vote })
        .eq("user_id", userId)
        .eq("comment_id", commentId);

      if (updateVoteError) {
        throw new Error(`Error updating vote: ${updateVoteError.message}`);
      }

      // Adjust the score by adding vote * 2 (reversing previous vote and adding the new one)
      newScore += vote * 2;
    }
  } else {
    // Step 5: Insert a new vote and add the vote value to the comment score
    const { error: insertVoteError } = await supabase
      .from("comment_votes")
      .insert([{ user_id: userId, comment_id: commentId, vote }]);

    if (insertVoteError) {
      throw new Error(`Error inserting vote: ${insertVoteError.message}`);
    }

    // Update the comment score
    newScore += vote;
  }

  // Step 6: Update the comment score in the comments table
  const { error: updateScoreError } = await supabase
    .from("comments")
    .update({ score: newScore })
    .eq("id", commentId);

  if (updateScoreError) {
    throw new Error(
      `Error updating comment score: ${updateScoreError.message}`,
    );
  }

  return { success: true, newScore };
};
