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

    public RestProtocolHandler() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
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
            // payload가 null이거나 빈 맵이면 기본 인자 사용
            if (rawData == null || (rawData instanceof Map && ((Map<?, ?>) rawData).isEmpty())) {
                rawData = entity.getDefaultArguments();
            }
            
            log.info("Processing raw data: {}", rawData);

            if (rawData instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) rawData;
                Object innerValue = null;
                
                // 우선순위: params -> body -> rawBody
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
                        log.info("Parsing inner JSON string: {}", str);
                        finalParams = objectMapper.readValue(str, Map.class);
                    } else if (!str.isEmpty()) {
                        log.warn("Inner value is string but not JSON: {}", str);
                    }
                } else if (innerValue instanceof Map) {
                    finalParams = (Map<String, Object>) innerValue;
                } else {
                    // 내부 키가 유효하지 않으면 맵 전체를 사용
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
                log.info("Converting {} keys to query string.", finalParams.size());
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

        log.info("Final Executing URL: {}", url);
        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.valueOf(method), requestEntity, String.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("REST Execution Failed. URL: {}, Error: {}", url, e.getMessage());
            throw new RuntimeException("REST call failed: " + e.getMessage());
        }
    }
}
