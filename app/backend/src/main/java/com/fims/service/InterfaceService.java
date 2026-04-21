package com.fims.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fims.model.InterfaceEntity;
import com.fims.model.TransactionLogEntity;
import com.fims.repository.InterfaceRepository;
import com.fims.repository.TransactionLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
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
    private final RestTemplate restTemplate;
    private final SftpService sftpService;
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
    public Map<String, Object> executeInterface(String intfId) {
        InterfaceEntity entity = interfaceRepository.findByIntfId(intfId)
                .orElseThrow(() -> new RuntimeException("Interface not found: " + intfId));

        String transId = UUID.randomUUID().toString();
        log.info("[{}] Executing Interface: {} ({}) to {}", transId, entity.getIntfName(), entity.getProtType(), entity.getEndPoint());

        long startTime = System.currentTimeMillis();
        String status = "SUCCESS";
        String resultCode = "200";
        String responsePayload = "";
        
        try {
            switch (entity.getProtType().toUpperCase()) {
                case "REST":
                    responsePayload = executeRest(entity);
                    break;
                case "SFTP":
                    responsePayload = executeSftp(entity);
                    break;
                default:
                    responsePayload = "Processed by " + entity.getProtType() + " engine.";
            }
        } catch (Exception e) {
            log.error("[{}] Execution failed: {}", transId, e.getMessage());
            status = "FAIL";
            resultCode = "E-500";
            responsePayload = e.getMessage();
        }

        long latency = System.currentTimeMillis() - startTime;

        TransactionLogEntity logEntity = TransactionLogEntity.builder()
                .transId(transId)
                .intfId(intfId)
                .protType(entity.getProtType())
                .status(status)
                .resultCode(resultCode)
                .requestPayload("N/A")
                .responsePayload(responsePayload)
                .latencyMs(latency)
                .build();
        transactionLogRepository.save(logEntity);

        return Map.of(
            "transId", transId,
            "status", status,
            "intfId", intfId,
            "msg", status.equals("SUCCESS") ? "Execution Completed" : "Execution Failed: " + responsePayload,
            "latency", latency + "ms"
        );
    }

    private String executeRest(InterfaceEntity entity) {
        try {
            log.info("Calling REST endpoint: {}", entity.getEndPoint());
            ResponseEntity<String> response = restTemplate.getForEntity(entity.getEndPoint(), String.class);
            return response.getBody();
        } catch (Exception e) {
            log.warn("REST endpoint call failed: {}", e.getMessage());
            throw new RuntimeException("REST call failed: " + e.getMessage());
        }
    }

    private String executeSftp(InterfaceEntity entity) {
        try {
            log.info("Starting SFTP execution for {}", entity.getEndPoint());
            
            // URL 파싱 (host:port)
            String endpoint = entity.getEndPoint();
            String host = endpoint.contains(":") ? endpoint.split(":")[0] : endpoint;
            int port = endpoint.contains(":") ? Integer.parseInt(endpoint.split(":")[1]) : 22;

            // 인증 정보 파싱
            String user = "anonymous";
            String pass = "";
            
            if (entity.getAuthInfo() != null && !entity.getAuthInfo().isBlank()) {
                try {
                    JsonNode authJson = objectMapper.readTree(entity.getAuthInfo());
                    user = authJson.has("user") ? authJson.get("user").asText() : 
                           (authJson.has("id") ? authJson.get("id").asText() : user);
                    pass = authJson.has("password") ? authJson.get("password").asText() : 
                           (authJson.has("pw") ? authJson.get("pw").asText() : "");
                } catch (Exception e) {
                    log.warn("Failed to parse authInfo JSON, using as raw password if not empty");
                    pass = entity.getAuthInfo();
                }
            }

            return sftpService.executeSftpTest(host, port, user, pass);
        } catch (Exception e) {
            log.error("SFTP execution failed: {}", e.getMessage());
            throw new RuntimeException("SFTP 연동 오류: " + e.getMessage());
        }
    }

    public List<TransactionLogEntity> getAllLogs() {
        return transactionLogRepository.findAll();
    }

    public Map<String, Object> getStatistics() {
        List<TransactionLogEntity> allLogs = transactionLogRepository.findAll();
        long total = allLogs.size();
        long success = allLogs.stream().filter(l -> "SUCCESS".equals(l.getStatus())).count();
        double successRate = total == 0 ? 0 : (double) success / total * 100;

        return Map.of(
            "successRate", Math.round(successRate * 10) / 10.0,
            "totalCount", total,
            "errorCount", total - success,
            "recentLogs", allLogs.stream().limit(5).collect(Collectors.toList())
        );
    }
}
