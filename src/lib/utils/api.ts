import { supabase } from "@/lib/utils/supabase";
import { Subforum, Publication, Comment, User } from "@/lib/utils/types";

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
    .from("user_follows_subforum")
    .select("sub_id")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
};

export const fetchPub = async (pubId: string): Promise<Publication | null> => {
  const { data, error } = await supabase
    .from("publications")
    .select("*")
    .eq("id", pubId)
    .single();
  if (error) throw error;
  return data;
};

export const fetchPubs = async (
  subId: string,
): Promise<Publication[] | null> => {
  const { data, error } = await supabase
    .from("publications")
    .select("*")
    .eq("sub_id", subId);
  if (error) throw error;
  return data;
};

export const submitPub = async (pub: Publication) => {
  const { error } = await supabase.from("publications").insert([pub]);
  if (error) throw error;
  fetchPubs(pub.sub_id);
};

export const submitSub = async (sub: Subforum) => {
  const { error } = await supabase.from("subforums").insert([sub]);
  if (error) throw error;
  fetchPubs(sub.id);
};

export const followSub = async (userId: String, subId: String) => {
  const { error } = await supabase
    .from("user_follows_subforum")
    .insert({ user_id: userId, sub_id: subId });
  if (error) throw error;
};

export const unfollowSub = async (userId: String, subId: String) => {
  const { error } = await supabase
    .from("user_follows_subforum")
    .delete()
    .eq("user_id", userId)
    .eq("sub_id", subId);
  if (error) throw error;
};

export const fetchComments = async (
  pubId: string,
  parentCommentId: string | null = null,
): Promise<Comment[]> => {
  let query = supabase.from("comments").select("*").eq("pub_id", pubId);
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
  pubId: string,
  content: string,
  parentCommentId: string | null = null,
): Promise<void> => {
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase.from("comments").insert([
    {
      pub_id: pubId,
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
  const supabaseError = (action: string, error: any) => {
    throw new Error(`Error ${action}: ${error?.message}`);
  };

  // Fetch existing vote and comment score
  const [
    { data: existingVote, error: voteError },
    { data: commentData, error: commentError },
  ] = await Promise.all([
    supabase
      .from("comment_votes")
      .select("*")
      .eq("user_id", userId)
      .eq("comment_id", commentId)
      .single(),
    supabase.from("comments").select("score").eq("id", commentId).single(),
  ]);

  if (voteError && voteError.code !== "PGRST116")
    supabaseError("fetching vote", voteError);
  if (commentError || !commentData)
    supabaseError("fetching comment score", commentError);

  let newScore = commentData.score;

  if (existingVote) {
    const { vote: existingVoteValue } = existingVote;

    if (existingVoteValue === vote) {
      // Remove vote
      const { error: deleteError } = await supabase
        .from("comment_votes")
        .delete()
        .eq("user_id", userId)
        .eq("comment_id", commentId);
      if (deleteError) supabaseError("deleting vote", deleteError);

      newScore -= vote;
    } else {
      // Update vote
      const { error: updateError } = await supabase
        .from("comment_votes")
        .update({ vote })
        .eq("user_id", userId)
        .eq("comment_id", commentId);
      if (updateError) supabaseError("updating vote", updateError);

      newScore += vote * 2; // Reverse previous vote and add new vote
    }
  } else {
    // Insert new vote
    const { error: insertError } = await supabase
      .from("comment_votes")
      .insert([{ user_id: userId, comment_id: commentId, vote }]);
    if (insertError) supabaseError("inserting vote", insertError);

    newScore += vote;
  }

  // Update comment score
  const { error: scoreError } = await supabase
    .from("comments")
    .update({ score: newScore })
    .eq("id", commentId);
  if (scoreError) supabaseError("updating comment score", scoreError);

  return { success: true, newScore };
};
