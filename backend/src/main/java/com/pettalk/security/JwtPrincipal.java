package com.pettalk.security;

public record JwtPrincipal(Long userId, String openid) {
}
