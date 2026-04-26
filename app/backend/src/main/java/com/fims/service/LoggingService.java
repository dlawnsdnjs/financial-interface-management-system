package com.fims.service;

import com.fims.domain.InterfaceEntity;
import com.fims.domain.MessageLogEntity;
import com.fims.repository.MessageLogRepository;
import org.springframework.stereotype.Service;

@Service
public class LoggingService {

    private final MessageLogRepository logRepository;

    public LoggingService(MessageLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    public void log(Long interfaceId, String protocol, Object payload, String status, String errorMessage, Object response, Long executionTimeMs) {
        MessageLogEntity log = MessageLogEntity.builder()
                .interfaceId(interfaceId)
                .protocol(protocol)
                .payload(payload != null ? payload.toString() : null)
                .response(response != null ? response.toString() : null)
                .status(status)
                .errorMessage(errorMessage)
                .executionTimeMs(executionTimeMs)
                .build();
        logRepository.save(log);
    }
}
