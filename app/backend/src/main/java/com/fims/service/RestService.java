package com.fims.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RestService implements ProtocolHandler {

    private final RestTemplate restTemplate;
    private static final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    @Override
    public boolean supports(String protocolType) {
        return "REST".equalsIgnoreCase(protocolType);
    }

    @Override
    public String execute(com.fims.model.InterfaceEntity interfaceEntity, Object body, Map<String, String> parameters) {
        try {
            com.fasterxml.jackson.databind.JsonNode config = objectMapper.readTree(interfaceEntity.getProtocolConfig().getConfigData());
            String baseUrl = config.path("baseUrl").asText();
            String method = config.path("method").asText("GET");

            log.info("Executing REST call to: {} via {}", baseUrl, method);

            if ("POST".equalsIgnoreCase(method)) {
                return restTemplate.postForObject(baseUrl, body, String.class);
            }
            return restTemplate.getForObject(baseUrl, String.class);
        } catch (Exception e) {
            log.error("REST execution failed: {}", e.getMessage());
            throw new RuntimeException("REST execution failed");
        }
    }


}
