package com.pettalk.service;

import com.pettalk.dto.LoginResponse;

public interface AuthService {

    LoginResponse login(String code);
}
