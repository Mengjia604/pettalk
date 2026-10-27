package com.pettalk.dto;

import lombok.Data;

@Data
public class FollowRequest {
    private Long followerId;
    private Long followeeId;
}
