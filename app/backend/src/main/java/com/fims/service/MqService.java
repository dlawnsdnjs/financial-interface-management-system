package com.fims.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MqService implements ProtocolHandler {

    private final JmsTemplate jmsTemplate;

    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    @Override
    public boolean supports(String protocolType) {
        return "MQ".equalsIgnoreCase(protocolType);
    }

    @Override
    public String execute(com.fims.model.InterfaceEntity interfaceEntity, Object body, Map<String, String> parameters) {
        try {
            com.fasterxml.jackson.databind.JsonNode config = objectMapper.readTree(interfaceEntity.getProtocolConfig().getConfigData());
            String queueName = config.get("queueName").asText();
            
            log.info("Executing MQ send to: {} for: {}", queueName, interfaceEntity.getIntfName());
            return sendMessage(queueName, body != null ? body.toString() : "{}");
        } catch (Exception e) {
            log.error("MQ execution failed: {}", e.getMessage());
            throw new RuntimeException("MQ 호출 오류: " + e.getMessage());
        }
    }

    public String sendMessage(String queueName, String message) {
        log.info("Sending MQ Message to Queue: {}", queueName);
        try {
            jmsTemplate.convertAndSend(queueName, message);
            return String.format("{\"status\":\"SUCCESS\", \"queue\":\"%s\", \"message\":\"%s\", \"timestamp\":\"%s\"}", 
                                 queueName, message, java.time.LocalDateTime.now());
        } catch (Exception e) {
            log.error("MQ send failed: {}", e.getMessage());
            return String.format("{\"status\":\"FAIL\", \"error\":\"%s\"}", e.getMessage());
        }
    }
}
