package com.pettalk.controller;

import com.pettalk.common.Result;
import com.pettalk.entity.Pet;
import com.pettalk.service.PetService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pet")
public class PetController {

    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }

    // 获取某用户的宠物列表（兼容原接口）
    @GetMapping("/{userId}")
    public Result<List<Pet>> getPets(@PathVariable Long userId) {
        return Result.success(petService.listByUserId(userId));
    }

    // 获取宠物详情
    @GetMapping("/detail/{id}")
    public Result<Pet> getPet(@PathVariable Long id) {
        return Result.success(petService.getPetById(id));
    }

    // 新增宠物
    @PostMapping
    public Result<Pet> addPet(@RequestBody Pet pet) {
        return Result.success(petService.addPet(pet));
    }

    // 更新宠物
    @PutMapping("/{id}")
    public Result<Pet> updatePet(@PathVariable Long id, @RequestBody Pet pet) {
        return Result.success(petService.updatePet(id, pet));
    }

    // 删除宠物
    @DeleteMapping("/{id}")
    public Result<String> deletePet(@PathVariable Long id) {
        petService.deletePet(id);
        return Result.success("删除成功");
    }
}
