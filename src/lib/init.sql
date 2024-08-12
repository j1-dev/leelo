-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subforums table
CREATE TABLE subforums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_subforum_follows table
CREATE TABLE user_subforum_follows (
    user_id UUID NOT NULL REFERENCES users(id),
    subforum_id UUID NOT NULL REFERENCES subforums(id),
    followed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, subforum_id)
);

-- Create moderators table
CREATE TABLE moderators (
    user_id UUID NOT NULL REFERENCES users(id),
    subforum_id UUID NOT NULL REFERENCES subforums(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, subforum_id)
);

-- Create posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subforum_id UUID NOT NULL REFERENCES subforums(id),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id),
    user_id UUID NOT NULL REFERENCES users(id),
    parent_comment_id UUID REFERENCES comments(id),
    content TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create post_votes table
CREATE TABLE post_votes (
    user_id UUID NOT NULL REFERENCES users(id),
    post_id UUID NOT NULL REFERENCES posts(id),
    vote INTEGER NOT NULL CHECK (vote IN (1, -1)),
    voted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, post_id)
);

-- Create comment_votes table
CREATE TABLE comment_votes (
    user_id UUID NOT NULL REFERENCES users(id),
    comment_id UUID NOT NULL REFERENCES comments(id),
    vote INTEGER NOT NULL CHECK (vote IN (1, -1)),
    voted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, comment_id)
);
