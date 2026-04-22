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
    private final SoapService soapService;
    private final MqService mqService;
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
    public Map<String, Object> executeInterface(String intfId) {
        return executeInterface(intfId, "GET", null);
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
        
        try {
            switch (entity.getProtType().toUpperCase()) {
                case "REST":
                    responsePayload = executeRest(entity, method, body);
                    break;
                case "SFTP":
                    responsePayload = executeSftp(entity);
                    break;
                case "SOAP":
                    responsePayload = soapService.executeSoapRequest(entity.getEndPoint(), method, body != null ? body.toString() : "");
                    break;
                case "MQ":
                    responsePayload = mqService.sendMessage(entity.getEndPoint(), body != null ? body.toString() : "Ping");
                    break;
                case "BATCH":
                    responsePayload = batchJobService.runBatchJob(entity.getIntfName());
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
        String maskedResponse = maskSensitiveData(responsePayload);

        TransactionLogEntity logEntity = TransactionLogEntity.builder()
                .transId(transId)
                .retryOf(retryOf)
                .intfId(intfId)
                .protType(entity.getProtType())
                .httpMethod(method)
                .status(status)
                .resultCode(resultCode)
                .requestPayload(body != null ? body.toString() : "N/A")
                .responsePayload(maskedResponse)
                .latencyMs(latency)
                .build();
        transactionLogRepository.save(logEntity);

        return Map.of(
            "transId", transId,
            "status", status,
            "intfId", intfId,
            "msg", status.equals("SUCCESS") ? "Execution Completed" : "Execution Failed: " + responsePayload,
            "latency", latency + "ms",
            "retryOf", retryOf != null ? retryOf : ""
        );
    }

    @Transactional
    public Map<String, Object> retryTransaction(Long logId) {
        TransactionLogEntity originalLog = transactionLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("Original log not found: " + logId));

        log.info("Requesting retry for Transaction ID: {} (Log ID: {})", originalLog.getTransId(), logId);
        
        // Re-execute with the same data and same method
        String method = originalLog.getHttpMethod() != null ? originalLog.getHttpMethod() : 
                        (originalLog.getRequestPayload().equals("N/A") ? "GET" : "POST");
        Object body = originalLog.getRequestPayload().equals("N/A") ? null : originalLog.getRequestPayload();

        return executeInterface(originalLog.getIntfId(), method, body, originalLog.getTransId());
    }

    private String executeRest(InterfaceEntity entity, String method, Object body) {
        try {
            log.info("Calling REST endpoint: {} via {}", entity.getEndPoint(), method);
            if ("POST".equalsIgnoreCase(method)) {
                return restTemplate.postForObject(entity.getEndPoint(), body, String.class);
            }
            // For other methods like PUT, DELETE, etc., you'd extend this.
            // For now, defaulting to GET if not POST.
            return restTemplate.getForObject(entity.getEndPoint(), String.class);
        } catch (Exception e) {
            log.warn("REST endpoint call failed: {}", e.getMessage());
            throw new RuntimeException("REST call failed: " + e.getMessage());
        }
    }

    private String maskSensitiveData(String data) {
        if (data == null) return null;
        
        String masked = data;
        // 1. 계좌번호, 카드번호 (8자리 이상 숫자 뭉치)
        masked = masked.replaceAll("(\\d{4})\\d{4,8}(\\d{4})", "$1****$2");
        
        // 2. 주민등록번호 (######-#######)
        masked = masked.replaceAll("(\\d{6}-[1-4])\\d{6}", "$1******");
        
        // 3. 이메일 (a***@domain.com) - 효율적인 비전방 탐색 방식으로 변경
        masked = masked.replaceAll("(?<=.{1})[^@]+(?=@)", "****");
        
        return masked;
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

        // 프로토콜별 통계
        Map<String, Long> protocolStats = allLogs.stream()
                .collect(Collectors.groupingBy(TransactionLogEntity::getProtType, Collectors.counting()));

        // 평균 지연 시간
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
                    .sorted((a, b) -> b.getId().compareTo(a.getId())) // 최근순 정렬 (ID가 생성순일 경우)
                    .limit(10)
                    .collect(Collectors.toList())
        );
    }
}
