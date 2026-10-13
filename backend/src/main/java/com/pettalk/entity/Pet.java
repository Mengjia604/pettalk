package com.pettalk.entity;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class Pet {
    private Long id;
    private Long userId;
    private String name;
    private String breed;
    private LocalDate birthday;
    private String avatar;
    private LocalDateTime createTime;
}