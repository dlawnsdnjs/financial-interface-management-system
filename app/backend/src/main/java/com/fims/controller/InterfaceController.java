package com.fims.controller;

import com.fims.domain.InterfaceEntity;
import com.fims.repository.InterfaceRepository;
import com.fims.service.InterfaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/interfaces")
@CrossOrigin(origins = "*")
public class InterfaceController {

    private final InterfaceRepository repository;
    private final InterfaceService interfaceService;

    public InterfaceController(InterfaceRepository repository, InterfaceService interfaceService) {
        this.repository = repository;
        this.interfaceService = interfaceService;
    }

    @GetMapping
    public List<InterfaceEntity> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterfaceEntity> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public InterfaceEntity create(@RequestBody InterfaceEntity entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InterfaceEntity> update(@PathVariable Long id, @RequestBody InterfaceEntity entity) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setName(entity.getName());
                    existing.setDescription(entity.getDescription());
                    existing.setProtocolType(entity.getProtocolType());
                    existing.setProtocolConfig(entity.getProtocolConfig());
                    existing.setDefaultArguments(entity.getDefaultArguments()); // 추가
                    existing.setEnabled(entity.isEnabled());
                    return ResponseEntity.ok(repository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return repository.findById(id)
                .map(entity -> {
                    repository.delete(entity);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/execute")
    public ResponseEntity<Object> execute(@PathVariable Long id, @RequestBody(required = false) Object payload) {
        InterfaceEntity entity = repository.findById(id).orElse(null);
        if (entity == null) {
            return ResponseEntity.notFound().build();
        }
        
        try {
            Object result = interfaceService.processInterface(entity, payload);
            return ResponseEntity.ok(result != null ? result : "Execution completed successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Execution failed: " + e.getMessage());
        }
    }
}
