package com.fims.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MqService implements ProtocolHandler {

    private final JmsTemplate jmsTemplate;

    @Override
    public String execute(String endpoint, String method, Object body, Map<String, String> parameters) {
        String jsonPayload;
        if (parameters != null && !parameters.isEmpty()) {
            // 파라미터를 JSON 객체의 필드로 변환
            String paramsJson = parameters.entrySet().stream()
                    .map(e -> String.format("\"%s\":\"%s\"", e.getKey(), e.getValue()))
                    .collect(Collectors.joining(","));
            jsonPayload = String.format("{\"params\":{%s}, \"body\":\"%s\"}", paramsJson, body != null ? body.toString() : "");
        } else {
            jsonPayload = String.format("{\"body\":\"%s\"}", body != null ? body.toString() : "Ping");
        }
        return sendMessage(endpoint, jsonPayload);
    }

    @Override
    public String getProtocolType() {
        return "MQ";
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
