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

export const fetchUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) throw error;
  return data;
};

export const fetchModerators = async (subId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("moderators")
      .select("user_id")
      .eq("sub_id", subId);

    if (error) {
      throw new Error(`Error fetching moderators: ${error.message}`);
    }

    return data.map((moderator) => moderator.user_id);
  } catch (error) {
    console.error("Error fetching moderators:", error);
    throw error;
  }
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

export const fetchFollowedSubs = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_follows_subforum")
    .select("sub_id")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
};

export const deleteSub = async (subId: string): Promise<void> => {
  const { error } = await supabase.from("subforums").delete().eq("id", subId);

  if (error) {
    throw new Error(`Error deleting subforum: ${error.message}`);
  }
};

export const submitSub = async (sub: Subforum) => {
  const { data, error } = await supabase
    .from("subforums")
    .insert([sub])
    .select("id")
    .single();
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

export const fetchFollowedPubs = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("user_follows_subforum")
      .select("sub_id")
      .eq("user_id", userId);

    if (error)
      throw new Error(`Error fetching followed subforums: ${error.message}`);
    if (!data || data.length === 0) return []; // No followed subforums

    const subforumIds = data.map((follow) => follow.sub_id);

    const { data: publications, error: pubsError } = await supabase
      .from("publications")
      .select(
        `
        *,
        subforums(accent)
      `,
      )
      .in("sub_id", subforumIds)
      .order("created_at", { ascending: false });

    if (pubsError)
      throw new Error(`Error fetching publications: ${pubsError.message}`);
    return publications.map((pub) => ({
      pub: {
        id: pub.id,
        sub_id: pub.sub_id,
        user_id: pub.user_id,
        title: pub.title,
        content: pub.content,
        score: pub.score,
        created_at: pub.created_at,
        img_url: pub.img_url,
      },
      accent: pub.subforums.accent,
    }));
  } catch (error) {
    console.error("Error fetching followed publications:", error);
    throw error;
  }
};

export const submitPub = async (pub: Publication) => {
  const { data, error } = await supabase.from("publications").insert([pub]);
  if (error) throw error;
  return data;
};

export const deletePub = async (pubId: string): Promise<void> => {
  // First, delete comments associated with the publication
  const { error: commentsError } = await supabase
    .from("comments")
    .delete()
    .eq("pub_id", pubId);

  if (commentsError) {
    throw new Error(`Error deleting comments: ${commentsError.message}`);
  }

  // Then, delete the publication itself
  const { error } = await supabase
    .from("publications")
    .delete()
    .eq("id", pubId);

  if (error) {
    throw new Error(`Error deleting publication: ${error.message}`);
  }
};

export const calculateScore = async (publicationId) => {
  try {
    // Query the votes table for the specific publication ID and calculate the score
    const { data, error } = await supabase
      .from("votes") // Your table name
      .select("vote", { count: "exact" }) // Select the 'vote' column and enable counting
      .eq("publication_id", publicationId); // Filter for the publication ID

    if (error) {
      throw error;
    }

    // Calculate the score by summing the votes
    const score = data.reduce((total, vote) => total + vote.vote, 0);

    return score;
  } catch (error) {
    console.error("Error calculating score:", error.message);
    return null;
  }
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

export const fetchPublicationVote = async (pubId: string, userId: string) => {
  const { data, error } = await supabase
    .from("publication_votes")
    .select("vote")
    .eq("user_id", userId)
    .eq("pub_id", pubId)
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

export const deleteComment = async (commentId: string): Promise<void> => {
  // First, delete any child comments (if any)
  const { error: childCommentsError } = await supabase
    .from("comments")
    .delete()
    .eq("parent_comment", commentId);

  if (childCommentsError) {
    throw new Error(
      `Error deleting child comments: ${childCommentsError.message}`,
    );
  }

  // Then, delete the comment itself
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    throw new Error(`Error deleting comment: ${error.message}`);
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

export const votePublication = async (
  userId: string,
  pubId: string,
  vote: number,
) => {
  const supabaseError = (action: string, error: any) => {
    throw new Error(`Error ${action}: ${error?.message}`);
  };

  // Fetch existing vote and comment score
  const [
    { data: existingVote, error: voteError },
    { data: pubData, error: pubError },
  ] = await Promise.all([
    supabase
      .from("publication_votes")
      .select("*")
      .eq("user_id", userId)
      .eq("pub_id", pubId)
      .single(),
    supabase.from("publications").select("score").eq("id", pubId).single(),
  ]);

  if (voteError && voteError.code !== "PGRST116")
    supabaseError("fetching vote", voteError);
  if (pubError || !pubData) supabaseError("fetching comment score", pubError);

  let newScore = pubData.score;

  if (existingVote) {
    const { vote: existingVoteValue } = existingVote;

    if (existingVoteValue === vote) {
      // Remove vote
      const { error: deleteError } = await supabase
        .from("publication_votes")
        .delete()
        .eq("user_id", userId)
        .eq("pub_id", pubId);
      if (deleteError) supabaseError("deleting vote", deleteError);

      newScore -= vote;
    } else {
      // Update vote
      const { error: updateError } = await supabase
        .from("publication_votes")
        .update({ vote })
        .eq("user_id", userId)
        .eq("pub_id", pubId);
      if (updateError) supabaseError("updating vote", updateError);

      newScore += vote * 2; // Reverse previous vote and add new vote
    }
  } else {
    // Insert new vote
    const { error: insertError } = await supabase
      .from("publication_votes")
      .insert([{ user_id: userId, pub_id: pubId, vote }]);
    if (insertError) supabaseError("inserting vote", insertError);

    newScore += vote;
  }

  // Update comment score
  const { error: scoreError } = await supabase
    .from("publications")
    .update({ score: newScore })
    .eq("id", pubId);
  if (scoreError) supabaseError("updating comment score", scoreError);

  return { success: true, newScore };
};

export const relativeTime = (isoDate: string): string => {
  const now = new Date();
  const date = new Date(isoDate);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const seconds = 1;
  const minute = 60;
  const hour = 60 * 60;
  const day = 60 * 60 * 24;
  const week = 60 * 60 * 24 * 7;
  const month = 60 * 60 * 24 * 30;
  const year = 60 * 60 * 24 * 365;

  if (diffInSeconds < minute) {
    return `${Math.max(Math.floor(diffInSeconds / seconds), 1)}s ago`;
  } else if (diffInSeconds < hour) {
    return `${Math.max(Math.floor(diffInSeconds / minute), 1)}m ago`;
  } else if (diffInSeconds < day) {
    return `${Math.max(Math.floor(diffInSeconds / hour), 1)}h ago`;
  } else if (diffInSeconds < week) {
    return `${Math.max(Math.floor(diffInSeconds / day), 1)} day ago`;
  } else if (diffInSeconds < month) {
    return `${Math.max(Math.floor(diffInSeconds / week), 1)} week ago`;
  } else if (diffInSeconds < year) {
    return `${Math.max(Math.floor(diffInSeconds / month), 1)} month ago`;
  } else {
    return `${Math.max(Math.floor(diffInSeconds / year), 1)} year ago`;
  }
};
