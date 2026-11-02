package com.pettalk.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.pettalk.dto.LoginResponse;
import com.pettalk.entity.User;
import com.pettalk.mapper.UserMapper;
import com.pettalk.security.JwtUtil;
import com.pettalk.service.AuthService;
import com.pettalk.service.WechatService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserMapper userMapper;
    private final WechatService wechatService;
    private final JwtUtil jwtUtil;

    public AuthServiceImpl(UserMapper userMapper, WechatService wechatService, JwtUtil jwtUtil) {
        this.userMapper = userMapper;
        this.wechatService = wechatService;
        this.jwtUtil = jwtUtil;
    }

    @Override
    @Transactional
    public LoginResponse login(String code) {
        WechatService.WechatSession session = wechatService.exchangeCode(code);
        String openid = session.openid();

        User user = userMapper.selectOne(
                Wrappers.<User>lambdaQuery().eq(User::getOpenid, openid)
        );
        if (user == null) {
            user = new User();
            user.setOpenid(openid);
            user.setNickname(buildNickname(openid));
            userMapper.insert(user);
            user = userMapper.selectById(user.getId());
        }

        String token = jwtUtil.createToken(user.getId(), user.getOpenid());
        return new LoginResponse(token, user);
    }

    private String buildNickname(String openid) {
        return "微信用户_" + openid.substring(0, Math.min(4, openid.length()));
    }
}
