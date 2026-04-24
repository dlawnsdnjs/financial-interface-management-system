package com.fims.controller;

import com.fims.domain.InterfaceEntity;
import com.fims.repository.InterfaceRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/interfaces")
@CrossOrigin(origins = "*")
public class InterfaceController {

    private final InterfaceRepository repository;

    public InterfaceController(InterfaceRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<InterfaceEntity> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public InterfaceEntity create(@RequestBody InterfaceEntity entity) {
        return repository.save(entity);
    }
}
