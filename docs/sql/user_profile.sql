USE pettalk;

-- 个人主页封面图增量迁移
SET @column_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user' AND COLUMN_NAME = 'cover'
);
SET @ddl = IF(
  @column_exists = 0,
  'ALTER TABLE `user` ADD COLUMN cover VARCHAR(255) DEFAULT NULL COMMENT ''个人主页背景图''',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
