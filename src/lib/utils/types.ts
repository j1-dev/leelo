export interface Subforum {
  id?: string;
  name: string;
  description: string;
  created_at: string;
  accent: string;
}

export interface Publication {
  id?: string;
  sub_id: string;
  user_id: string;
  title: string;
  content: string;
  score: number;
  created_at: string;
  img_id?: string;
}

export interface Comment {
  id?: string;
  pub_id: string;
  user_id: string;
  content: string;
  created_at: string;
  score: number;
  parent_comment?: string;
}

export interface User {
  id?: string;
  username: string;
  email: string;
  profile_pic: string;
  created_at: string;
}
