USE pettalk;

ALTER TABLE `post`
  ADD INDEX `idx_post_create_time_id` (`create_time`, `id`),
  ADD INDEX `idx_post_user_create_time_id` (`user_id`, `create_time`, `id`);

ALTER TABLE `comment`
  ADD INDEX `idx_comment_post_create_time_id` (`post_id`, `create_time`, `id`);
