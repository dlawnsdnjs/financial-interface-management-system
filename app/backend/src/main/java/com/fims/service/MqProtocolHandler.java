package com.fims.service;

import com.fims.domain.InterfaceEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
public class MqProtocolHandler implements ProtocolHandler {

    private final JmsTemplate jmsTemplate;

    public MqProtocolHandler(JmsTemplate jmsTemplate) {
        this.jmsTemplate = jmsTemplate;
    }

    @Override
    public boolean supports(String protocolType) {
        return "MQ".equalsIgnoreCase(protocolType);
    }

    @Override
    public Object execute(InterfaceEntity entity, Object payload) {
        Map<String, Object> config = entity.getProtocolConfig();
        if (config == null) throw new IllegalArgumentException("MQ config is missing");

        String queueName = (String) config.get("queueName");
        if (queueName == null) throw new IllegalArgumentException("Queue name is missing");

        log.info("Sending message to MQ [{}]: {}", entity.getName(), queueName);

        try {
            jmsTemplate.convertAndSend(queueName, payload);
            log.info("MQ message sent successfully: {}", queueName);
            return "Message sent to queue: " + queueName;
        } catch (Exception e) {
            log.error("MQ failed: {}", e.getMessage());
            throw new RuntimeException("MQ transmission failed", e);
        }
    }
}
