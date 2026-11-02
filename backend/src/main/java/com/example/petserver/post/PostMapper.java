package com.example.petserver.post;

import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface PostMapper {

    // 插入动态
    @Insert("INSERT INTO post(user_id, pet_id, content, images, like_count, comment_count, status) " +
            "VALUES(#{userId}, #{petId}, #{content}, #{images}, 0, 0, 1)")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Post post);

    // 分页查询动态列表
    @Select("SELECT * FROM post WHERE status = 1 " +
            "ORDER BY created_at DESC, id DESC LIMIT #{offset}, #{size}")
    List<Post> selectFeed(@Param("offset") int offset, @Param("size") int size);

    // 统计总数
    @Select("SELECT COUNT(*) FROM post WHERE status = 1")
    long countAll();

    // 查单条详情
    @Select("SELECT * FROM post WHERE id = #{id} AND status = 1")
    Post selectById(@Param("id") Long id);
}