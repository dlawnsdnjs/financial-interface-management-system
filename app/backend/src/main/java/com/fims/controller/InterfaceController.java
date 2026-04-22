package com.fims.controller;

import com.fims.model.InterfaceEntity;
import com.fims.model.TransactionLogEntity;
import com.fims.service.InterfaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/interfaces")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // 특정 오리진만 허용
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

    @PutMapping("/{intfId}")
    public ResponseEntity<InterfaceEntity> updateInterface(@PathVariable String intfId, @RequestBody InterfaceEntity entity) {
        return ResponseEntity.ok(interfaceService.updateInterface(intfId, entity));
    }

    @PostMapping("/{intfId}/execute")
    public ResponseEntity<Map<String, Object>> executeInterface(
            @PathVariable String intfId,
            @RequestParam(required = false, defaultValue = "GET") String method,
            @RequestBody(required = false) Object body) {
        return ResponseEntity.ok(interfaceService.executeInterface(intfId, method, body));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<TransactionLogEntity>> getAllLogs() {
        return ResponseEntity.ok(interfaceService.getAllLogs());
    }

    @PostMapping("/logs/{id}/retry")
    public ResponseEntity<Map<String, Object>> retryTransaction(@PathVariable Long id) {
        return ResponseEntity.ok(interfaceService.retryTransaction(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        return ResponseEntity.ok(interfaceService.getStatistics());
    }
}
