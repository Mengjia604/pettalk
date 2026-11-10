USE pettalk;

-- 频道表：只保留频道大类，不细分品种
CREATE TABLE IF NOT EXISTS channel (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(32) NOT NULL COMMENT '频道编码',
  name VARCHAR(30) NOT NULL COMMENT '频道名称',
  description VARCHAR(120) DEFAULT NULL COMMENT '频道简介',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_channel_code (code)
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

INSERT INTO channel (code, name, description, sort_order) VALUES
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

-- 已有数据库增量迁移：post.channel_id
SET @column_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'post' AND COLUMN_NAME = 'channel_id'
);
SET @ddl = IF(
  @column_exists = 0,
  'ALTER TABLE post ADD COLUMN channel_id BIGINT DEFAULT NULL COMMENT ''所属频道id''',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'post' AND INDEX_NAME = 'idx_post_channel'
);
SET @ddl = IF(
  @index_exists = 0,
  'ALTER TABLE post ADD INDEX idx_post_channel (channel_id)',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
