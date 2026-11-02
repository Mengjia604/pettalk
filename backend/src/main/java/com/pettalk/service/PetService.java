package com.pettalk.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.pettalk.entity.Pet;

import java.util.List;

public interface PetService extends IService<Pet> {

    List<Pet> listByUserId(Long userId);

    Pet getPetById(Long id);

    Pet addPet(Pet pet, Long currentUserId);

    Pet updatePet(Long id, Pet pet, Long currentUserId);

    void deletePet(Long id, Long currentUserId);
}
