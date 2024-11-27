-- Insert users and return their UUIDs
INSERT INTO users (id, username, email) VALUES
(gen_random_uuid(), 'alice', 'alice@example.com'),
(gen_random_uuid(), 'bob', 'bob@example.com'),
(gen_random_uuid(), 'carol', 'carol@example.com'),
(gen_random_uuid(), 'dave', 'dave@example.com'),
(gen_random_uuid(), 'eve', 'eve@example.com');

-- Insert subforums and return their UUIDs
INSERT INTO subforums (id, name, description, accent) VALUES
(gen_random_uuid(), 'General Discussion', 'A place for general chat and topics.', '#0000FF'),
(gen_random_uuid(), 'Tech Talk', 'Discuss the latest in technology and gadgets.', '#0000FF'),
(gen_random_uuid(), 'Books & Literature', 'Share and discuss your favorite books.', '#0000FF'),
(gen_random_uuid(), 'Gaming', 'Talk about video games and the gaming industry.', '#0000FF'),
(gen_random_uuid(), 'Movies & TV Shows', 'Discuss the latest movies and TV series.', '#0000FF');

-- Insert user_subforum_follows using subqueries to fetch user_id and subforum_id
INSERT INTO user_subforum_follows (user_id, subforum_id) VALUES
((SELECT id FROM users WHERE username = 'alice'), (SELECT id FROM subforums WHERE name = 'General Discussion')),
((SELECT id FROM users WHERE username = 'bob'), (SELECT id FROM subforums WHERE name = 'General Discussion')),
((SELECT id FROM users WHERE username = 'carol'), (SELECT id FROM subforums WHERE name = 'Tech Talk')),
((SELECT id FROM users WHERE username = 'dave'), (SELECT id FROM subforums WHERE name = 'Books & Literature')),
((SELECT id FROM users WHERE username = 'eve'), (SELECT id FROM subforums WHERE name = 'Gaming')),
((SELECT id FROM users WHERE username = 'alice'), (SELECT id FROM subforums WHERE name = 'Movies & TV Shows')),
((SELECT id FROM users WHERE username = 'bob'), (SELECT id FROM subforums WHERE name = 'Tech Talk')),
((SELECT id FROM users WHERE username = 'carol'), (SELECT id FROM subforums WHERE name = 'General Discussion')),
((SELECT id FROM users WHERE username = 'dave'), (SELECT id FROM subforums WHERE name = 'Gaming')),
((SELECT id FROM users WHERE username = 'eve'), (SELECT id FROM subforums WHERE name = 'Books & Literature'));

-- Insert moderators using subqueries to fetch user_id and subforum_id
INSERT INTO moderators (user_id, subforum_id) VALUES
((SELECT id FROM users WHERE username = 'alice'), (SELECT id FROM subforums WHERE name = 'General Discussion')),
((SELECT id FROM users WHERE username = 'bob'), (SELECT id FROM subforums WHERE name = 'Tech Talk')),
((SELECT id FROM users WHERE username = 'carol'), (SELECT id FROM subforums WHERE name = 'Books & Literature')),
((SELECT id FROM users WHERE username = 'dave'), (SELECT id FROM subforums WHERE name = 'Gaming')),
((SELECT id FROM users WHERE username = 'eve'), (SELECT id FROM subforums WHERE name = 'Movies & TV Shows'));

-- Insert posts using subqueries to fetch subforum_id and user_id
INSERT INTO posts (id, subforum_id, user_id, title, content) VALUES
(gen_random_uuid(), (SELECT id FROM subforums WHERE name = 'General Discussion'), (SELECT id FROM users WHERE username = 'alice'), 'Welcome to General Discussion', 'Let''s keep this space friendly and engaging!'),
(gen_random_uuid(), (SELECT id FROM subforums WHERE name = 'Tech Talk'), (SELECT id FROM users WHERE username = 'bob'), 'Latest in Tech', 'Have you guys seen the new VR headset from XCorp?'),
(gen_random_uuid(), (SELECT id FROM subforums WHERE name = 'Books & Literature'), (SELECT id FROM users WHERE username = 'carol'), 'Favorite Books', 'What are your favorite books this year?'),
(gen_random_uuid(), (SELECT id FROM subforums WHERE name = 'Gaming'), (SELECT id FROM users WHERE username = 'dave'), 'Best Games of 2024', 'Let''s discuss the best games released this year.'),
(gen_random_uuid(), (SELECT id FROM subforums WHERE name = 'Movies & TV Shows'), (SELECT id FROM users WHERE username = 'eve'), 'Summer Movie Recommendations', 'What movies are you looking forward to this summer?');

-- Insert comments using subqueries to fetch post_id and user_id
INSERT INTO comments (id, post_id, user_id, content) VALUES
(gen_random_uuid(), (SELECT id FROM posts WHERE title = 'Welcome to General Discussion'), (SELECT id FROM users WHERE username = 'bob'), 'Thanks for creating this space, Alice!'),
(gen_random_uuid(), (SELECT id FROM posts WHERE title = 'Latest in Tech'), (SELECT id FROM users WHERE username = 'carol'), 'Yes, it looks amazing! I''m thinking of getting one.'),
(gen_random_uuid(), (SELECT id FROM posts WHERE title = 'Favorite Books'), (SELECT id FROM users WHERE username = 'dave'), 'I loved "The Invisible Life of Addie LaRue"!'),
(gen_random_uuid(), (SELECT id FROM posts WHERE title = 'Best Games of 2024'), (SELECT id FROM users WHERE username = 'eve'), 'The new RPG from QGames is a must-play!'),
(gen_random_uuid(), (SELECT id FROM posts WHERE title = 'Summer Movie Recommendations'), (SELECT id FROM users WHERE username = 'alice'), 'I can''t wait to see the new Marvel movie!'),
(gen_random_uuid(), (SELECT id FROM posts WHERE title = 'Welcome to General Discussion'), (SELECT id FROM users WHERE username = 'carol'), 'Looking forward to engaging discussions!'),
(gen_random_uuid(), (SELECT id FROM posts WHERE title = 'Latest in Tech'), (SELECT id FROM users WHERE username = 'dave'), 'I read that the specs are top-notch.'),
(gen_random_uuid(), (SELECT id FROM posts WHERE title = 'Favorite Books'), (SELECT id FROM users WHERE username = 'eve'), 'I''m currently reading "The Midnight Library" and it''s fantastic.'),
(gen_random_uuid(), (SELECT id FROM posts WHERE title = 'Best Games of 2024'), (SELECT id FROM users WHERE username = 'alice'), 'Agreed! The gameplay looks revolutionary.'),
(gen_random_uuid(), (SELECT id FROM posts WHERE title = 'Summer Movie Recommendations'), (SELECT id FROM users WHERE username = 'bob'), 'Marvel movies are always a blast.');

-- Insert post_votes using subqueries to fetch user_id and post_id
INSERT INTO post_votes (user_id, post_id, vote) VALUES
((SELECT id FROM users WHERE username = 'alice'), (SELECT id FROM posts WHERE title = 'Welcome to General Discussion'), 1),
((SELECT id FROM users WHERE username = 'bob'), (SELECT id FROM posts WHERE title = 'Latest in Tech'), 1),
((SELECT id FROM users WHERE username = 'carol'), (SELECT id FROM posts WHERE title = 'Favorite Books'), 1),
((SELECT id FROM users WHERE username = 'dave'), (SELECT id FROM posts WHERE title = 'Best Games of 2024'), 1),
((SELECT id FROM users WHERE username = 'eve'), (SELECT id FROM posts WHERE title = 'Summer Movie Recommendations'), 1),
((SELECT id FROM users WHERE username = 'alice'), (SELECT id FROM posts WHERE title = 'Latest in Tech'), 1),
((SELECT id FROM users WHERE username = 'bob'), (SELECT id FROM posts WHERE title = 'Favorite Books'), 1),
((SELECT id FROM users WHERE username = 'carol'), (SELECT id FROM posts WHERE title = 'Best Games of 2024'), 1),
((SELECT id FROM users WHERE username = 'dave'), (SELECT id FROM posts WHERE title = 'Summer Movie Recommendations'), 1),
((SELECT id FROM users WHERE username = 'eve'), (SELECT id FROM posts WHERE title = 'Welcome to General Discussion'), 1);

-- Insert comment_votes using subqueries to fetch user_id and comment_id
INSERT INTO comment_votes (user_id, comment_id, vote) VALUES
((SELECT id FROM users WHERE username = 'alice'), (SELECT id FROM comments WHERE content = 'Thanks for creating this space, Alice!'), 1),
((SELECT id FROM users WHERE username = 'bob'), (SELECT id FROM comments WHERE content = 'Yes, it looks amazing! I''m thinking of getting one.'), 1),
((SELECT id FROM users WHERE username = 'carol'), (SELECT id FROM comments WHERE content = 'I loved "The Invisible Life of Addie LaRue"!'), 1),
((SELECT id FROM users WHERE username = 'dave'), (SELECT id FROM comments WHERE content = 'The new RPG from QGames is a must-play!'), 1),
((SELECT id FROM users WHERE username = 'eve'), (SELECT id FROM comments WHERE content = 'I can''t wait to see the new Marvel movie!'), 1),
((SELECT id FROM users WHERE username = 'alice'), (SELECT id FROM comments WHERE content = 'Looking forward to engaging discussions!'), 1),
((SELECT id FROM users WHERE username = 'bob'), (SELECT id FROM comments WHERE content = 'I read that the specs are top-notch.'), 1),
((SELECT id FROM users WHERE username = 'carol'), (SELECT id FROM comments WHERE content = 'I''m currently reading "The Midnight Library" and it''s fantastic.'), 1),
((SELECT id FROM users WHERE username = 'dave'), (SELECT id FROM comments WHERE content = 'Agreed! The gameplay looks revolutionary.'), 1),
((SELECT id FROM users WHERE username = 'eve'), (SELECT id FROM comments WHERE content = 'Marvel movies are always a blast.'), 1);
