package com.pettalk.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pettalk.common.Result;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.nio.charset.StandardCharsets;

@Component
public class JwtAuthInterceptor implements HandlerInterceptor {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    public JwtAuthInterceptor(JwtUtil jwtUtil, ObjectMapper objectMapper) {
        this.jwtUtil = jwtUtil;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        boolean writeRequest = !"GET".equalsIgnoreCase(request.getMethod())
                && !"HEAD".equalsIgnoreCase(request.getMethod());
        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith(BEARER_PREFIX)) {
            if (writeRequest) {
                return unauthorized(response, "请先登录");
            }
            return true;
        }

        try {
            JwtPrincipal principal = jwtUtil.parseToken(authorization.substring(BEARER_PREFIX.length()).trim());
            request.setAttribute("currentUserId", principal.userId());
            request.setAttribute("currentOpenid", principal.openid());
            return true;
        } catch (IllegalArgumentException e) {
            if (writeRequest) {
                return unauthorized(response, e.getMessage());
            }
            return true;
        }
    }

    private boolean unauthorized(HttpServletResponse response, String message) throws Exception {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(Result.unauthorized(message)));
        return false;
    }
}
