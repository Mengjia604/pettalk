-- 评论表 comment
CREATE TABLE `comment` (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '评论id',
  post_id BIGINT NOT NULL COMMENT '帖子id',
  user_id BIGINT NOT NULL COMMENT '评论用户id',
  content VARCHAR(512) NOT NULL COMMENT '评论内容',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_post (post_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 关注表 follow
CREATE TABLE `follow` (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  follower_id BIGINT NOT NULL COMMENT '粉丝id（关注人）',
  followee_id BIGINT NOT NULL COMMENT '被关注人',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_follower_followee (follower_id, followee_id),
  INDEX idx_follower (follower_id),
  INDEX idx_followee (followee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 帖子点赞表 post_like
CREATE TABLE `post_like` (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id BIGINT NOT NULL COMMENT '帖子id',
  user_id BIGINT NOT NULL COMMENT '点赞用户id',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_post_user (post_id, user_id),
  INDEX idx_post (post_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
