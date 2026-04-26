package com.fims.service;

import com.fims.domain.InterfaceEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.*;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BatchProtocolHandler implements ProtocolHandler {

    private final LoggingService loggingService;
    private final JobLauncher jobLauncher;
    private final Job settlementJob;

    @Override
    public boolean supports(String protocolType) {
        return "BATCH".equalsIgnoreCase(protocolType);
    }

    @Override
    public Object execute(InterfaceEntity entity, Object payload) {
        Map<String, Object> config = entity.getProtocolConfig();
        Map<String, Object> args = (Map<String, Object>) payload;
        
        String targetDate = (String) args.getOrDefault("targetDate", LocalDateTime.now().format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE));
        String inputPath = (String) config.getOrDefault("inputPath", "/data/input/");
        String filePattern = (String) config.getOrDefault("filePattern", "STTL_" + targetDate + "_*.csv");

        JobParameters params = new JobParametersBuilder()
                .addString("jobId", UUID.randomUUID().toString())
                .addString("targetDate", targetDate)
                .addString("inputFilePath", inputPath + filePattern.replace("*", "")) // 단순화
                .addLong("timestamp", System.currentTimeMillis())
                .toJobParameters();

        try {
            JobExecution execution = jobLauncher.run(settlementJob, params);
            return "Batch job status: " + execution.getStatus();
        } catch (Exception e) {
            log.error("Batch job failed", e);
            throw new RuntimeException("Batch execution failed", e);
        }
    }
}
