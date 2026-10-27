package com.pettalk.service;

import com.pettalk.dto.UserProfileVO;

public interface UserProfileService {

    UserProfileVO getProfile(Long userId, Long currentUserId, long page, long size);
}
