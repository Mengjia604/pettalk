package com.pettalk.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserSummaryVO {
    private Long id;
    private String nickname;
    private String avatar;
    private String bio;
    private LocalDateTime createTime;
}
