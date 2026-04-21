package com.fims.controller;

import com.fims.model.InterfaceEntity;
import com.fims.service.InterfaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/interfaces")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InterfaceController {

    private final InterfaceService interfaceService;

    @GetMapping
    public ResponseEntity<List<InterfaceEntity>> getAllInterfaces() {
        return ResponseEntity.ok(interfaceService.getAllInterfaces());
    }

    @PostMapping
    public ResponseEntity<InterfaceEntity> registerInterface(@RequestBody InterfaceEntity entity) {
        return ResponseEntity.ok(interfaceService.registerInterface(entity));
    }

    @PostMapping("/{intfId}/execute")
    public ResponseEntity<Map<String, Object>> executeInterface(@PathVariable String intfId) {
        return ResponseEntity.ok(interfaceService.executeInterface(intfId));
    }
}
