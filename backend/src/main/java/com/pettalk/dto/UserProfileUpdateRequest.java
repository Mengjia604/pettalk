package com.pettalk.dto;

import lombok.Data;

@Data
public class UserProfileUpdateRequest {
    private String nickname;
    private String bio;
    private String avatar;
    private String cover;
}
