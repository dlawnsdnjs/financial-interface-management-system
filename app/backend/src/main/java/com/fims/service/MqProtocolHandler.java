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

    public MqProtocolHandler(RabbitTemplate rabbitTemplate, MqListenerManager listenerManager) {
        this.rabbitTemplate = rabbitTemplate;
        this.listenerManager = listenerManager;
    }

    @Override
    public boolean supports(String protocolType) {
        return "MQ".equalsIgnoreCase(protocolType);
    }

    private Object handleSubscribe(InterfaceEntity entity) {
        Map<String, Object> config = entity.getProtocolConfig();
        String queueName = (String) config.get("queueName");
        String ackMode = (String) config.getOrDefault("ackMode", "manual");
        
        listenerManager.startListener(entity.getName(), queueName, ackMode);
        
        return "MQ Subscriber started on queue: " + queueName + " (ACK: " + ackMode + ")";
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
            
            try {
                rabbitTemplate.convertAndSend(queueName, message);
                return "Message published to " + queueName;
            } catch (Exception e) {
                log.error("RabbitMQ publish failed: {}", e.getMessage());
                throw new RuntimeException("RabbitMQ transmission failed", e);
            }
        }
    }
}
