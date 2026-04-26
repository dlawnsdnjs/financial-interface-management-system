package com.fims.service;

import com.fims.domain.InterfaceEntity;
import com.fims.domain.MessageLogEntity;
import com.fims.repository.InterfaceRepository;
import com.fims.repository.MessageLogRepository;
import org.springframework.stereotype.Service;

@Service
public class RetryService {

    private final MessageLogRepository logRepository;
    private final InterfaceRepository interfaceRepository;
    private final InterfaceService interfaceService;

    public RetryService(MessageLogRepository logRepository, InterfaceRepository interfaceRepository, InterfaceService interfaceService) {
        this.logRepository = logRepository;
        this.interfaceRepository = interfaceRepository;
        this.interfaceService = interfaceService;
    }

    public Object retry(Long logId) {
        MessageLogEntity log = logRepository.findById(logId)
                .orElseThrow(() -> new IllegalArgumentException("Log not found"));
        
        InterfaceEntity entity = interfaceRepository.findById(log.getInterfaceId())
                .orElseThrow(() -> new IllegalArgumentException("Interface not found"));

        return interfaceService.processInterface(entity, log.getPayload());
    }
}
