package com.fims.config;

import com.fims.domain.SettlementEntity;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.file.builder.FlatFileItemReaderBuilder;
import org.springframework.batch.item.file.mapping.PassThroughLineMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;

import java.nio.charset.Charset;

@Configuration
public class SettlementItemReader {

    @Bean
    @StepScope
    public FlatFileItemReader<SettlementEntity> reader(
            @Value("#{jobParameters['inputFilePath']}") String inputFilePath) {
        
        return new FlatFileItemReaderBuilder<SettlementEntity>()
                .name("settlementFileReader")
                .resource(new FileSystemResource(inputFilePath))
                .encoding("EUC-KR")
                .delimited()
                .delimiter(",")
                .names("contractNo", "customerName", "juminNo", "amount", "paymentDate")
                .linesToSkip(1)
                .fieldSetMapper(fieldSet -> SettlementEntity.builder()
                        .contractNo(fieldSet.readString("contractNo"))
                        .customerName(fieldSet.readString("customerName"))
                        .juminNo(fieldSet.readString("juminNo"))
                        .amount(new java.math.BigDecimal(fieldSet.readString("amount")))
                        .paymentDate(java.time.LocalDate.parse(fieldSet.readString("paymentDate"), java.time.format.DateTimeFormatter.ISO_LOCAL_DATE))
                        .build())
                .build();
    }
}
