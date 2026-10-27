package com.pettalk.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName(value = "post", autoResultMap = true)
public class Post {
    private Long id;
    private Long userId;
    private Long petId;
    private String content;

    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<String> images;

    private Integer likeCount;
    private Integer commentCount;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
