package com.fims.service;

import com.fims.domain.InterfaceEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
public class MqProtocolHandler implements ProtocolHandler {

    private final RabbitTemplate rabbitTemplate;
    private final MqListenerManager listenerManager;
    private final LoggingService loggingService;

    public MqProtocolHandler(RabbitTemplate rabbitTemplate, MqListenerManager listenerManager, LoggingService loggingService) {
        this.rabbitTemplate = rabbitTemplate;
        this.listenerManager = listenerManager;
        this.loggingService = loggingService;
    }

    @Override
    public boolean supports(String protocolType) {
        return "MQ".equalsIgnoreCase(protocolType);
    }

    private Object handleSubscribe(InterfaceEntity entity) {
        Map<String, Object> config = entity.getProtocolConfig();
        String queueName = (String) config.get("queueName");
        String ackMode = (String) config.getOrDefault("ackMode", "manual");
        
        try {
            listenerManager.startListener(entity.getId(), queueName, ackMode);
            String response = "MQ Subscriber started on queue: " + queueName + " (ACK: " + ackMode + ")";
            loggingService.log(entity.getId(), "MQ-SUB", "Subscribe start: " + queueName, "SUCCESS", null, response, null);
            return response;
        } catch (Exception e) {
            loggingService.log(entity.getId(), "MQ-SUB", "Subscribe start: " + queueName, "FAIL", e.getMessage(), null, null);
            throw e;
        }
    }

    @Override
    public Object execute(InterfaceEntity entity, Object payload) {
        Map<String, Object> config = entity.getProtocolConfig();
        if (config == null) throw new IllegalArgumentException("MQ config is missing");

        String mode = (String) config.getOrDefault("mode", "SUB");
        
        if ("SUB".equalsIgnoreCase(mode)) {
            return handleSubscribe(entity);
        } else {
            String queueName = (String) config.get("queueName");
            if (queueName == null) throw new IllegalArgumentException("Queue name is missing");

            String message = (payload instanceof Map) ? (String) ((Map<String, Object>) payload).get("message") 
                                                      : (payload != null ? payload.toString() : "");

            log.info("Publishing message to RabbitMQ [{}]: {} -> {}", entity.getName(), queueName, message);
            
            long startTime = System.currentTimeMillis();
            try {
                rabbitTemplate.convertAndSend(queueName, message);
                long duration = System.currentTimeMillis() - startTime;
                String response = "Message published to " + queueName;
                loggingService.log(entity.getId(), "MQ-PUB", message, "SUCCESS", null, response, duration);
                return response;
            } catch (Exception e) {
                long duration = System.currentTimeMillis() - startTime;
                log.error("RabbitMQ publish failed: {}", e.getMessage());
                loggingService.log(entity.getId(), "MQ-PUB", message, "FAIL", e.getMessage(), null, duration);
                throw new RuntimeException("RabbitMQ transmission failed", e);
            }
        }
    }
}
