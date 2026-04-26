package com.fims.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fims.domain.InterfaceEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@Service
public class RestProtocolHandler implements ProtocolHandler {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final LoggingService loggingService;

    public RestProtocolHandler(LoggingService loggingService) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.loggingService = loggingService;
    }

    @Override
    public boolean supports(String protocolType) {
        return "REST".equalsIgnoreCase(protocolType);
    }

    @Override
    public Object execute(InterfaceEntity entity, Object payload) {
        Map<String, Object> config = entity.getProtocolConfig();
        if (config == null) throw new IllegalArgumentException("REST config is missing");

        String url = (String) config.get("url");
        String method = (String) config.getOrDefault("method", "GET").toString().toUpperCase();
        
        log.info("Starting REST execution. Method: {}, Base URL: {}", method, url);

        // 1. 데이터 추출 및 정규화
        Map<String, Object> finalParams = new java.util.HashMap<>();
        
        try {
            Object rawData = payload;
            if (rawData == null || (rawData instanceof Map && ((Map<?, ?>) rawData).isEmpty())) {
                rawData = entity.getDefaultArguments();
            }
            
            if (rawData instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) rawData;
                Object innerValue = null;
                if (map.containsKey("params") && map.get("params") != null && !map.get("params").toString().isEmpty()) {
                    innerValue = map.get("params");
                } else if (map.containsKey("body")) {
                    innerValue = map.get("body");
                } else if (map.containsKey("rawBody") && map.get("rawBody") != null && !map.get("rawBody").toString().isEmpty()) {
                    innerValue = map.get("rawBody");
                }

                if (innerValue instanceof String) {
                    String str = innerValue.toString().trim();
                    if (str.startsWith("{")) {
                        finalParams = objectMapper.readValue(str, Map.class);
                    }
                } else if (innerValue instanceof Map) {
                    finalParams = (Map<String, Object>) innerValue;
                } else {
                    finalParams = map;
                }
            } else if (rawData instanceof String) {
                String str = rawData.toString().trim();
                if (str.startsWith("{")) {
                    finalParams = objectMapper.readValue(str, Map.class);
                }
            }
        } catch (Exception e) {
            log.error("Failed to normalize payload. Error: {}", e.getMessage(), e);
        }

        // 2. GET 요청인 경우 쿼리 스트링 결합
        if ("GET".equals(method)) {
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url);
            if (finalParams != null && !finalParams.isEmpty()) {
                for (Map.Entry<String, Object> entry : finalParams.entrySet()) {
                    if (entry.getValue() != null) {
                        builder.queryParam(entry.getKey(), entry.getValue().toString());
                    }
                }
                url = builder.build().toUriString();
            }
            payload = null; 
        } else {
            payload = finalParams;
        }

        HttpHeaders headers = new HttpHeaders();
        if (!"GET".equals(method)) {
            headers.setContentType(MediaType.APPLICATION_JSON);
        }
        
        HttpEntity<Object> requestEntity = new HttpEntity<>(payload, headers);

        long startTime = System.currentTimeMillis();
        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.valueOf(method), requestEntity, String.class);
            long duration = System.currentTimeMillis() - startTime;
            
            if (response.getStatusCode().is2xxSuccessful()) {
                loggingService.log(entity.getId(), "REST", url, "SUCCESS", null, response.getBody(), duration);
            } else {
                String errorInfo = "HTTP " + response.getStatusCode().value() + ": " + response.getStatusCode().toString();
                loggingService.log(entity.getId(), "REST", url, "FAIL", errorInfo, response.getBody(), duration);
            }
            
            return response.getBody();
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("REST Execution Failed. URL: {}, Error: {}", url, e.getMessage());
            loggingService.log(entity.getId(), "REST", url, "FAIL", e.getMessage(), null, duration);
            throw new RuntimeException("REST call failed: " + e.getMessage());
        }
    }
}
