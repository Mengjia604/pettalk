package com.pettalk.dto;

import lombok.Data;

@Data
public class ChannelVO {
    private Long id;
    private String code;
    private String name;
    private String description;
    private Long postCount;
    private Long todayPostCount;
    private Long memberCount;
    private Boolean joined;
}
