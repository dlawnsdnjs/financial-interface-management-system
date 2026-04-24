package com.fims.service;

import com.fims.domain.InterfaceEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
public class RestProtocolHandler implements ProtocolHandler {

    private final RestTemplate restTemplate;

    public RestProtocolHandler() {
        this.restTemplate = new RestTemplate();
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
        String method = (String) config.getOrDefault("method", "GET");
        
        Object body = payload;
        
        // Raw Body 처리를 위한 로직
        if (payload instanceof Map && ((Map<?, ?>) payload).containsKey("rawBody")) {
            body = ((Map<?, ?>) payload).get("rawBody");
        }

        // GET 요청이면서 rawBody가 없으면 기존 파라미터 맵 처리
        if ("GET".equalsIgnoreCase(method) && body instanceof Map && !((Map<?, ?>) body).containsKey("rawBody")) {
            Map<String, Object> params = (Map<String, Object>) body;
            String queryString = params.entrySet().stream()
                    .map(e -> e.getKey() + "=" + e.getValue())
                    .collect(java.util.stream.Collectors.joining("&"));
            url += (url.contains("?") ? "&" : "?") + queryString;
            body = null; 
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Object> requestEntity = new HttpEntity<>(body, headers);

        log.info("Executing REST: {} {}", method, url);
        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.valueOf(method.toUpperCase()), requestEntity, String.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("REST failed: {}", e.getMessage());
            throw new RuntimeException("REST failed: " + e.getMessage());
        }
    }
}
