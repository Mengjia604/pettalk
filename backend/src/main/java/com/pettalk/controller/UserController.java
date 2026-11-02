package com.pettalk.controller;

import com.pettalk.common.Result;
import com.pettalk.dto.LoginRequest;
import com.pettalk.dto.LoginResponse;
import com.pettalk.service.AuthService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public Result<LoginResponse> login(@RequestBody(required = false) LoginRequest request) {
        String code = request == null ? null : request.getCode();
        return Result.success(authService.login(code));
    }
}
