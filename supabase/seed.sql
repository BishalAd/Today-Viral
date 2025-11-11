-- Insert sample profiles
INSERT INTO profiles (id, username, full_name, bio, avatar_url) VALUES
('00000000-0000-0000-0000-000000000001', 'viralcreator', 'Alex Johnson', 'Creating viral content daily 🚀', 'https://example.com/avatar1.jpg'),
('00000000-0000-0000-0000-000000000002', 'trendsetter', 'Sarah Miller', 'Trending videos and memes 📈', 'https://example.com/avatar2.jpg'),
('00000000-0000-0000-0000-000000000003', 'contentking', 'Mike Chen', 'YouTube & TikTok creator 🎬', 'https://example.com/avatar3.jpg'),
('00000000-0000-0000-0000-000000000004', 'reelqueen', 'Emma Davis', 'Instagram Reels specialist ✨', 'https://example.com/avatar4.jpg')
ON CONFLICT (id) DO NOTHING;

-- Insert sample posts
INSERT INTO posts (user_id, title, description, video_url, thumbnail_url, platform, likes_count, comments_count) VALUES
('00000000-0000-0000-0000-000000000001', 'Epic Dance Challenge', 'This went viral on TikTok! #dance #challenge', 'https://example.com/tiktok1.mp4', 'https://example.com/thumb1.jpg', 'tiktok', 15420, 342),
('00000000-0000-0000-0000-000000000002', 'Cooking Hack You Need', 'This changed my life! #cooking #hack', 'https://example.com/instagram1.mp4', 'https://example.com/thumb2.jpg', 'instagram', 8920, 187),
('00000000-0000-0000-0000-000000000003', 'Funny Pets Compilation', 'You will laugh guaranteed! #pets #funny', 'https://example.com/youtube1.mp4', 'https://example.com/thumb3.jpg', 'youtube', 23100, 543),
('00000000-0000-0000-0000-000000000004', 'Travel Reel: Bali', 'Dream destination 🌴 #travel #bali', 'https://example.com/instagram2.mp4', 'https://example.com/thumb4.jpg', 'instagram', 12750, 289),
('00000000-0000-0000-0000-000000000001', 'Prank Gone Wrong', 'Wait for the ending! #prank #comedy', 'https://example.com/tiktok2.mp4', 'https://example.com/thumb5.jpg', 'tiktok', 18700, 421),
('00000000-0000-0000-0000-000000000002', 'Workout Routine', 'Get fit in 15 minutes! #fitness #workout', 'https://example.com/youtube2.mp4', 'https://example.com/thumb6.jpg', 'youtube', 9560, 156)
ON CONFLICT (id) DO NOTHING;

-- Insert sample likes
INSERT INTO likes (user_id, post_id) VALUES
('00000000-0000-0000-0000-000000000001', (SELECT id FROM posts LIMIT 1 OFFSET 0)),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM posts LIMIT 1 OFFSET 1)),
('00000000-0000-0000-0000-000000000003', (SELECT id FROM posts LIMIT 1 OFFSET 2)),
('00000000-0000-0000-0000-000000000004', (SELECT id FROM posts LIMIT 1 OFFSET 3))
ON CONFLICT (user_id, post_id) DO NOTHING;

-- Insert sample comments
INSERT INTO comments (user_id, post_id, content) VALUES
('00000000-0000-0000-0000-000000000001', (SELECT id FROM posts LIMIT 1 OFFSET 0), 'This is amazing! 🔥'),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM posts LIMIT 1 OFFSET 0), 'So talented! 💫'),
('00000000-0000-0000-0000-000000000003', (SELECT id FROM posts LIMIT 1 OFFSET 1), 'Trying this today! 👏'),
('00000000-0000-0000-0000-000000000004', (SELECT id FROM posts LIMIT 1 OFFSET 2), 'Made my day! 😂')
ON CONFLICT (id) DO NOTHING;