package com.fims.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fims.model.InterfaceEntity;
import com.fims.model.TransactionLogEntity;
import com.fims.repository.InterfaceRepository;
import com.fims.repository.TransactionLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterfaceService {

    private final InterfaceRepository interfaceRepository;
    private final TransactionLogRepository transactionLogRepository;
    private final List<ProtocolHandler> protocolHandlers;
    private final BatchJobService batchJobService;
    private final ObjectMapper objectMapper = new ObjectMapper();

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

        if (entity.getParameters() != null) {
            entity.getParameters().forEach(p -> p.setInterfaceEntity(entity));
        }

        return interfaceRepository.save(entity);
    }

    @Transactional
    public InterfaceEntity updateInterface(String intfId, InterfaceEntity updatedEntity) {
        InterfaceEntity existing = interfaceRepository.findByIntfId(intfId)
                .orElseThrow(() -> new RuntimeException("Interface not found: " + intfId));

        existing.setIntfName(updatedEntity.getIntfName());
        existing.setProtType(updatedEntity.getProtType());
        existing.setEndPoint(updatedEntity.getEndPoint());
        existing.setHttpMethod(updatedEntity.getHttpMethod());
        existing.setAuthInfo(updatedEntity.getAuthInfo());
        existing.setStatus(updatedEntity.getStatus());
        
        existing.getParameters().clear();
        if (updatedEntity.getParameters() != null) {
            updatedEntity.getParameters().forEach(p -> {
                p.setInterfaceEntity(existing);
                existing.getParameters().add(p);
            });
        }

        return interfaceRepository.save(existing);
    }

    @Transactional
    public Map<String, Object> executeInterface(String intfId) {
        InterfaceEntity entity = interfaceRepository.findByIntfId(intfId)
                .orElseThrow(() -> new RuntimeException("Interface not found: " + intfId));
        String method = entity.getHttpMethod() != null ? entity.getHttpMethod() : "GET";
        return executeInterface(intfId, method, null);
    }

    @Transactional
    public Map<String, Object> executeInterface(String intfId, String method, Object body) {
        return executeInterface(intfId, method, body, null);
    }

    @Transactional
    public Map<String, Object> executeInterface(String intfId, String method, Object body, String retryOf) {
        InterfaceEntity entity = interfaceRepository.findByIntfId(intfId)
                .orElseThrow(() -> new RuntimeException("Interface not found: " + intfId));

        String transId = UUID.randomUUID().toString();
        log.info("[{}] {} Interface: {} ({}) via {} to {}", transId, 
                retryOf != null ? "Retrying" : "Executing", 
                entity.getIntfName(), entity.getProtType(), method, entity.getEndPoint());

        long startTime = System.currentTimeMillis();
        String status = "SUCCESS";
        String resultCode = "200";
        String responsePayload = "";
        
        Object finalBody = body != null ? body : entity.getAuthInfo();
        
        try {
            if ("BATCH".equals(entity.getProtType().toUpperCase())) {
                responsePayload = batchJobService.runBatchJob(entity.getIntfName());
            } else {
                ProtocolHandler handler = protocolHandlers.stream()
                        .filter(h -> h.getProtocolType().equalsIgnoreCase(entity.getProtType()))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Unsupported protocol: " + entity.getProtType()));

                Map<String, String> paramMap = new HashMap<>();
                if (entity.getParameters() != null) {
                    entity.getParameters().forEach(p -> paramMap.put(p.getKey(), p.getValue()));
                }
                
                // Add authInfo to params for protocols that need it (SFTP)
                if (entity.getAuthInfo() != null && "SFTP".equalsIgnoreCase(entity.getProtType())) {
                    paramMap.put("authInfo", entity.getAuthInfo());
                }

                responsePayload = handler.execute(entity.getEndPoint(), method, finalBody, paramMap);
            }
        } catch (Exception e) {
            log.error("[{}] Execution failed: {}", transId, e.getMessage());
            status = "FAIL";
            resultCode = "E-500";
            responsePayload = e.getMessage();
        }

        long latency = System.currentTimeMillis() - startTime;
        String maskedResponse = maskSensitiveData(responsePayload);

        TransactionLogEntity logEntity = TransactionLogEntity.builder()
                .transId(transId)
                .retryOf(retryOf)
                .intfId(intfId)
                .protType(entity.getProtType())
                .httpMethod(method)
                .status(status)
                .resultCode(resultCode)
                .requestPayload(finalBody != null ? finalBody.toString() : "N/A")
                .responsePayload(maskedResponse)
                .latencyMs(latency)
                .build();
        transactionLogRepository.save(logEntity);

        return Map.of(
            "transId", transId,
            "status", status,
            "intfId", intfId,
            "msg", status.equals("SUCCESS") ? "Execution Completed" : "Execution Failed: " + responsePayload,
            "payload", maskedResponse != null ? maskedResponse : "",
            "latency", latency + "ms",
            "retryOf", retryOf != null ? retryOf : ""
        );
    }

    @Transactional
    public Map<String, Object> retryTransaction(Long logId) {
        TransactionLogEntity originalLog = transactionLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("Original log not found: " + logId));

        String method = originalLog.getHttpMethod() != null ? originalLog.getHttpMethod() : 
                        (originalLog.getRequestPayload().equals("N/A") ? "GET" : "POST");
        Object body = originalLog.getRequestPayload().equals("N/A") ? null : originalLog.getRequestPayload();

        return executeInterface(originalLog.getIntfId(), method, body, originalLog.getTransId());
    }

    private String maskSensitiveData(String data) {
        if (data == null) return null;
        String masked = data;
        masked = masked.replaceAll("(\\d{4})\\d{4,8}(\\d{4})", "$1****$2");
        masked = masked.replaceAll("(\\d{6}-[1-4])\\d{6}", "$1******");
        masked = masked.replaceAll("(?<=.{1})[^@]+(?=@)", "****");
        return masked;
    }

    public List<TransactionLogEntity> getAllLogs() {
        return transactionLogRepository.findAll();
    }

    public Map<String, Object> getStatistics() {
        List<TransactionLogEntity> allLogs = transactionLogRepository.findAll();
        long total = allLogs.size();
        long success = allLogs.stream().filter(l -> "SUCCESS".equals(l.getStatus())).count();
        double successRate = total == 0 ? 0 : (double) success / total * 100;

        Map<String, Long> protocolStats = allLogs.stream()
                .collect(Collectors.groupingBy(TransactionLogEntity::getProtType, Collectors.counting()));

        double avgLatency = allLogs.stream()
                .mapToLong(TransactionLogEntity::getLatencyMs)
                .average()
                .orElse(0.0);

        return Map.of(
            "successRate", Math.round(successRate * 10) / 10.0,
            "totalCount", total,
            "errorCount", total - success,
            "avgLatency", Math.round(avgLatency * 10) / 10.0,
            "protocolStats", protocolStats,
            "recentLogs", allLogs.stream()
                    .sorted((a, b) -> b.getId().compareTo(a.getId()))
                    .limit(10)
                    .collect(Collectors.toList())
        );
    }
}
