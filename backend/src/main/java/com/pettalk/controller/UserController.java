package com.pettalk.controller;

import com.pettalk.common.Result;
import com.pettalk.entity.User;
import com.pettalk.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class UserController {

    @Autowired
    private UserMapper userMapper;

    // 模拟微信登录
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        // 实际开发中，前端会传微信的 code，这里为了演示，假设直接传 openid
        String openid = body.getOrDefault("openid", "test_openid_123");

        // 查数据库里有没有这个用户
        User user = userMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<User>()
                        .eq("openid", openid)
        );

        // 如果没有，自动注册一个
        if (user == null) {
            user = new User();
            user.setOpenid(openid);
            user.setNickname("微信用户_" + openid.substring(0, 4));
            userMapper.insert(user);
        }

        // 模拟生成 token
        String token = "mock_token_" + user.getId();

        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("user", user);

        return Result.success(data);
    }
}