package com.fims.config;

import com.fims.domain.SettlementEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
@RequiredArgsConstructor
public class SettlementJobConfig {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;

    @Bean
    public Job settlementJob(Step settlementStep) {
        return new JobBuilder("settlementJob", jobRepository)
                .start(settlementStep)
                .build();
    }

    @Bean
    public Step settlementStep(
            SettlementItemReader settlementItemReader,
            SettlementItemProcessor processor,
            SettlementItemWriter writer
    ) {
        return new StepBuilder("settlementStep", jobRepository)
                .<SettlementEntity, SettlementEntity>chunk(1000, transactionManager)
                .reader(settlementItemReader.reader(null)) // jobParameters 주입을 위해 null로 호출하거나 별도 구성 필요
                .processor(processor)
                .writer(writer)
                .build();
    }
}
