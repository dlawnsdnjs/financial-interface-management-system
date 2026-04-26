package com.fims.service;

import com.fims.domain.InterfaceEntity;
import com.fims.repository.InterfaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.AcknowledgeMode;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class MqListenerManager {

    private final ConnectionFactory connectionFactory;
    private final LoggingService loggingService;
    private final InterfaceRepository interfaceRepository;
    private final Map<String, SimpleMessageListenerContainer> containers = new ConcurrentHashMap<>();

    public void startListener(Long interfaceId, String queueName, String ackModeStr) {
        InterfaceEntity entity = interfaceRepository.findById(interfaceId)
                .orElseThrow(() -> new IllegalArgumentException("Interface not found: " + interfaceId));

        String key = entity.getName();
        if (containers.containsKey(key)) {
            log.info("Listener already running for interface: {}", key);
            return;
        }

        RabbitAdmin admin = new RabbitAdmin(connectionFactory);
        admin.declareQueue(new Queue(queueName, true));

        SimpleMessageListenerContainer container = new SimpleMessageListenerContainer(connectionFactory);
        container.setQueueNames(queueName);
        
        // Ack Mode 설정
        if ("auto".equalsIgnoreCase(ackModeStr)) {
            container.setAcknowledgeMode(AcknowledgeMode.AUTO);
        } else {
            container.setAcknowledgeMode(AcknowledgeMode.MANUAL);
        }

        container.setMessageListener(message -> {
            String body = new String(message.getBody());
            log.info("MQ Received [{}]: {}", queueName, body);
            
            // 수신된 메시지를 DB 로그에 저장 (비동기 수신 성공 케이스)
            loggingService.log(interfaceId, "MQ-SUB", "Queue: " + queueName, "SUCCESS", null, body, null);
        });

        container.start();
        containers.put(key, container);
        log.info("RabbitMQ Listener started: {} on queue {}", key, queueName);
    }

    public void stopListener(String interfaceName) {
        SimpleMessageListenerContainer container = containers.remove(interfaceName);
        if (container != null) {
            container.stop();
            log.info("RabbitMQ Listener stopped: {}", interfaceName);
        }
    }

    public boolean isRunning(String interfaceName) {
        return containers.containsKey(interfaceName);
    }
}
