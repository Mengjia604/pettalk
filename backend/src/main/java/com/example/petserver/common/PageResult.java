package com.example.petserver.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResult<T> {
    private List<T> list;
    private int page;
    private int size;
    private boolean hasMore;
}