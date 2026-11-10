package com.pettalk.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("channel")
public class Channel {
    private Long id;
    private String code;
    private String name;
    private String description;
    private Integer sortOrder;
    private LocalDateTime createTime;
}
