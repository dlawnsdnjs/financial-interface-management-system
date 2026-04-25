package com.fims.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class MqListenerManager {

    private final ConnectionFactory connectionFactory;
    private final RabbitAdmin rabbitAdmin;
    private final Map<String, SimpleMessageListenerContainer> containers = new ConcurrentHashMap<>();

    public MqListenerManager(ConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
        this.rabbitAdmin = new RabbitAdmin(connectionFactory);
    }

    public void startListener(String interfaceName, String queueName, String ackMode) {
        if (containers.containsKey(interfaceName)) {
            log.info("Listener already running for {}", interfaceName);
            return;
        }

        // 큐가 없으면 자동으로 생성(Declare)
        rabbitAdmin.declareQueue(new Queue(queueName, true));

        SimpleMessageListenerContainer container = new SimpleMessageListenerContainer(connectionFactory);
        container.setQueues(new Queue(queueName));
        container.setMessageListener(message -> {
            log.info("Received message on {}: {}", queueName, new String(message.getBody()));
        });
        
        container.start();
        containers.put(interfaceName, container);
        log.info("Started RabbitMQ listener for {} on queue {}", interfaceName, queueName);
    }
}
