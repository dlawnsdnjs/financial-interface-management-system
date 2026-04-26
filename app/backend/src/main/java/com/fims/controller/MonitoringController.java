package com.fims.controller;

import com.fims.domain.MessageLogEntity;
import com.fims.repository.MessageLogRepository;
import com.fims.service.RetryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/monitor")
public class MonitoringController {

    private final MessageLogRepository logRepository;
    private final RetryService retryService;

    public MonitoringController(MessageLogRepository logRepository, RetryService retryService) {
        this.logRepository = logRepository;
        this.retryService = retryService;
    }

    @GetMapping("/logs/{interfaceId}")
    public List<MessageLogEntity> getLogs(@PathVariable Long interfaceId) {
        return logRepository.findByInterfaceIdOrderByCreatedAtDesc(interfaceId);
    }

    @GetMapping("/stats/{interfaceId}")
    public Map<String, Object> getStats(@PathVariable Long interfaceId) {
        List<MessageLogEntity> logs = logRepository.findByInterfaceIdOrderByCreatedAtDesc(interfaceId);
        long successCount = logs.stream().filter(l -> "SUCCESS".equals(l.getStatus())).count();
        long failCount = logs.stream().filter(l -> "FAIL".equals(l.getStatus())).count();
        
        double avgTime = logs.stream()
                .filter(l -> l.getExecutionTimeMs() != null)
                .mapToLong(MessageLogEntity::getExecutionTimeMs)
                .average()
                .orElse(0.0);

        return Map.of(
            "SUCCESS", successCount,
            "FAIL", failCount,
            "AVG_TIME", Math.round(avgTime * 10.0) / 10.0
        );
    }

    @GetMapping("/recent-logs")
    public List<MessageLogEntity> getRecentLogs() {
        return logRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(10)
                .collect(Collectors.toList());
    }

    @GetMapping("/recent-errors")
    @Deprecated
    public List<MessageLogEntity> getRecentErrors() {
        return getRecentLogs().stream()
                .filter(l -> "FAIL".equals(l.getStatus()))
                .collect(Collectors.toList());
    }

    @PostMapping("/retry/{logId}")
    public Object retry(@PathVariable Long logId) {
        return retryService.retry(logId);
    }
}
