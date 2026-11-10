package com.pettalk.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("channel_member")
public class ChannelMember {
    private Long id;
    private Long channelId;
    private Long userId;
    private LocalDateTime createTime;
}
