export interface Subforum {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Post {
  id: number;
  subforum_id: number;
  user_id: number;
  title: string;
  content: string;
  score: number;
  created_at: string;
}
