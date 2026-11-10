USE pettalk;

-- 频道表
CREATE TABLE IF NOT EXISTS `channel` (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(32) NOT NULL COMMENT '频道编码',
  name VARCHAR(30) NOT NULL COMMENT '频道名称',
  description VARCHAR(120) DEFAULT NULL COMMENT '频道简介',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_channel_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `channel` (code, name, description, sort_order) VALUES
  ('cat', '猫咪', '猫咪日常、喂养、健康与救助交流', 1),
  ('dog', '狗狗', '狗狗训练、遛狗、健康与领养交流', 2),
  ('small-pet', '小宠', '仓鼠、兔子、龙猫等小宠交流', 3),
  ('bird', '鸟类', '鹦鹉、文鸟等宠物鸟交流', 4),
  ('aquatic', '水族', '观赏鱼、水草与鱼缸养护交流', 5),
  ('reptile', '爬宠', '守宫、蛇、龟等爬宠交流', 6),
  ('other', '其他', '更多宠物与异宠交流', 7),
  ('cute-kid', '萌娃分享', '分享萌娃日常、成长记录与亲子互动', 8)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  sort_order = VALUES(sort_order);

-- 动态表 post
CREATE TABLE `post` (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '动态id',
  user_id BIGINT NOT NULL COMMENT '发布用户id',
  pet_id BIGINT DEFAULT NULL COMMENT '关联宠物id',
  channel_id BIGINT DEFAULT NULL COMMENT '所属频道id',
  content VARCHAR(1000) DEFAULT NULL COMMENT '文字内容',
  images TEXT DEFAULT NULL COMMENT '图片URL，JSON数组字符串',
  like_count INT NOT NULL DEFAULT 0 COMMENT '点赞数',
  comment_count INT NOT NULL DEFAULT 0 COMMENT '评论数',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_pet (pet_id),
  INDEX idx_post_channel (channel_id),
  INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 频道成员表
CREATE TABLE IF NOT EXISTS channel_member (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  channel_id BIGINT NOT NULL COMMENT '频道id',
  user_id BIGINT NOT NULL COMMENT '用户id',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_channel_member (channel_id, user_id),
  INDEX idx_channel_member_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
