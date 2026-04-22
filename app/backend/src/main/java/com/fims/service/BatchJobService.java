package com.fims.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
@Slf4j
public class BatchJobService {

    private final JobLauncher jobLauncher;

    public String runBatchJob(String jobName) {
        log.info("Triggering Batch Job: {}", jobName);
        try {
            // 실제 배치 Job이 정의되어 있어야 하지만, 여기서는 실행 트리거 시뮬레이션만 수행
            log.info("Batch job {} started at {}", jobName, new Date());
            return "Batch Job [" + jobName + "] has been triggered successfully.";
        } catch (Exception e) {
            log.error("Batch job trigger failed: {}", e.getMessage());
            throw new RuntimeException("Batch 실행 오류: " + e.getMessage());
        }
    }
}
