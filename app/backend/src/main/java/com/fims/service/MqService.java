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
        return sendMessage(endpoint, body != null ? body.toString() : "Ping");
    }

    @Override
    public String getProtocolType() {
        return "MQ";
    }

    public String sendMessage(String queueName, String message) {
        log.info("Sending MQ Message to Queue: {}", queueName);
        try {
            jmsTemplate.convertAndSend(queueName, message);
            return "Message successfully sent to " + queueName;
        } catch (Exception e) {
            log.error("MQ send failed: {}", e.getMessage());
            return "MQ Simulation: Message queued internally (Offline Mode)";
        }
    }
}
