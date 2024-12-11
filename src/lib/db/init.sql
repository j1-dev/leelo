-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW ()
);

-- Create subforums table
CREATE TABLE subforums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW (),
    accent TEXT,
    created_by UUID
);

-- Create user_follows_subforum table with cascading deletes
CREATE TABLE user_follows_subforum (
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    sub_id UUID NOT NULL REFERENCES subforums (id) ON DELETE CASCADE,
    followed_at TIMESTAMPTZ DEFAULT NOW (),
    UNIQUE (user_id, sub_id)
);

-- Create moderators table with cascading deletes
CREATE TABLE moderators (
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    sub_id UUID NOT NULL REFERENCES subforums (id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW (),
    UNIQUE (user_id, sub_id)
);

-- Create publications table with cascading deletes
CREATE TABLE publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    sub_id UUID NOT NULL REFERENCES subforums (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW (),
    img_url TEXT,
);

-- Create comments table with cascading deletes
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    pub_id UUID NOT NULL REFERENCES publications (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    parent_comment UUID REFERENCES comments (id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW ()
);

-- Create publication_votes table with cascading deletes
CREATE TABLE publication_votes (
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    pub_id UUID NOT NULL REFERENCES publications (id) ON DELETE CASCADE,
    vote INTEGER NOT NULL CHECK (vote IN (1, -1)),
    voted_at TIMESTAMPTZ DEFAULT NOW (),
    UNIQUE (user_id, pub_id)
);

-- Create comment_votes table with cascading deletes
CREATE TABLE comment_votes (
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    comment_id UUID NOT NULL REFERENCES comments (id) ON DELETE CASCADE,
    vote INTEGER NOT NULL CHECK (vote IN (1, -1)),
    voted_at TIMESTAMPTZ DEFAULT NOW (),
    UNIQUE (user_id, comment_id)
);
