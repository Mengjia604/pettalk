package com.pettalk.service;

import com.pettalk.dto.UserProfileVO;
import com.pettalk.dto.UserProfileUpdateRequest;
import com.pettalk.dto.UserSummaryVO;

public interface UserProfileService {

    UserProfileVO getProfile(Long userId, Long currentUserId, long page, long size);

    UserSummaryVO updateProfile(Long userId, UserProfileUpdateRequest request);
}
