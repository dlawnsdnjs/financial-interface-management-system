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
        String message = body != null ? body.toString() : "Ping";
        // 파라미터를 메시지에 동적으로 반영
        if (parameters != null && !parameters.isEmpty()) {
            message += " | Params: " + parameters.toString();
        }
        return sendMessage(endpoint, message);
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
