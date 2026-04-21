package com.fims.service;

import com.fims.model.InterfaceEntity;
import com.fims.repository.InterfaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterfaceService {

    private final InterfaceRepository interfaceRepository;

    public List<InterfaceEntity> getAllInterfaces() {
        return interfaceRepository.findAll();
    }

    @Transactional
    public InterfaceEntity registerInterface(InterfaceEntity entity) {
        if (entity.getIntfId() == null || entity.getIntfId().isBlank()) {
            throw new IllegalArgumentException("Interface ID is required.");
        }
        if (entity.getIntfName() == null || entity.getIntfName().isBlank()) {
            throw new IllegalArgumentException("Interface Name is required.");
        }
        if (interfaceRepository.findByIntfId(entity.getIntfId()).isPresent()) {
            throw new RuntimeException("Duplicate Interface ID: " + entity.getIntfId());
        }
        return interfaceRepository.save(entity);
    }

    public Map<String, Object> executeInterface(String intfId) {
        InterfaceEntity entity = interfaceRepository.findByIntfId(intfId)
                .orElseThrow(() -> new RuntimeException("Interface not found: " + intfId));

        log.info("Executing Interface: {} ({})", entity.getIntfName(), entity.getProtType());

        // 시뮬레이션: 성공/실패 무작위 발생
        Random random = new Random();
        boolean isSuccess = random.nextInt(100) < 90; // 90% 성공률 시뮬레이션
        
        try {
            Thread.sleep(500 + random.nextInt(1000)); // 0.5~1.5초 지연 시뮬레이션
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        if (isSuccess) {
            return Map.of(
                "status", "SUCCESS",
                "intfId", intfId,
                "msg", "정상 처리되었습니다.",
                "latency", (500 + random.nextInt(1000)) + "ms"
            );
        } else {
            return Map.of(
                "status", "FAIL",
                "intfId", intfId,
                "msg", "타겟 시스템 응답 지연 (Simulation)",
                "latency", "1500ms"
            );
        }
    }
}
