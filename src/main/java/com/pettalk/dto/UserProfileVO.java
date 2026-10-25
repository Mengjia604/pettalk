package com.pettalk.dto;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.pettalk.entity.Pet;
import com.pettalk.entity.Post;
import lombok.Data;

import java.util.List;

@Data
public class UserProfileVO {
    private UserSummaryVO user;
    private List<Pet> pets;
    private long postCount;
    private long followingCount;
    private long followerCount;
    private Boolean following;
    private IPage<Post> posts;
}
