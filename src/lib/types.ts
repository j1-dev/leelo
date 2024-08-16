export interface Subforum {
  id?: string;
  name: string;
  description: string;
  created_at: string;
  accent: string;
}

export interface Post {
  id?: string;
  subforum_id: string;
  user_id: string;
  title: string;
  content: string;
  score: number;
  created_at: string;
}

export interface Comment {
  id?: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  score: number;
  parent_comment?: string;
}
