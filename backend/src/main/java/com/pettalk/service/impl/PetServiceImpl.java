package com.pettalk.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.pettalk.entity.Pet;
import com.pettalk.mapper.PetMapper;
import com.pettalk.service.PetService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PetServiceImpl extends ServiceImpl<PetMapper, Pet> implements PetService {

    @Override
    public List<Pet> listByUserId(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("用户 ID 不能为空");
        }
        return lambdaQuery()
                .eq(Pet::getUserId, userId)
                .orderByDesc(Pet::getCreateTime)
                .orderByDesc(Pet::getId)
                .list();
    }

    @Override
    public Pet getPetById(Long id) {
        Pet pet = getById(id);
        if (pet == null) {
            throw new IllegalArgumentException("宠物不存在");
        }
        return pet;
    }

    @Override
    @Transactional
    public Pet addPet(Pet pet) {
        if (pet.getUserId() == null) {
            throw new IllegalArgumentException("用户 ID 不能为空");
        }
        if (pet.getName() == null || pet.getName().isBlank()) {
            throw new IllegalArgumentException("宠物昵称不能为空");
        }
        pet.setId(null);
        save(pet);
        return getById(pet.getId());
    }

    @Override
    @Transactional
    public Pet updatePet(Long id, Pet pet) {
        Pet existing = getPetById(id);
        if (pet.getName() != null && pet.getName().isBlank()) {
            throw new IllegalArgumentException("宠物昵称不能为空");
        }
        pet.setId(id);
        pet.setUserId(existing.getUserId());
        pet.setCreateTime(null);
        updateById(pet);
        return getById(id);
    }

    @Override
    @Transactional
    public void deletePet(Long id) {
        getPetById(id);
        removeById(id);
    }
}
