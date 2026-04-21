package com.fims.config;

import com.fims.model.InterfaceEntity;
import com.fims.model.TransactionLogEntity;
import com.fims.repository.InterfaceRepository;
import com.fims.repository.TransactionLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final InterfaceRepository interfaceRepository;
    private final TransactionLogRepository transactionLogRepository;

    @Override
    public void run(String... args) {
        if (interfaceRepository.count() == 0) {
            interfaceRepository.saveAll(List.of(
                InterfaceEntity.builder()
                    .intfId("INTF-001")
                    .intfName("금감원 전자공시 연동 (DART)")
                    .protType("REST")
                    .endPoint("https://opendart.fss.or.kr/api/list.json")
                    .status("ACTIVE")
                    .build(),
                InterfaceEntity.builder()
                    .intfId("INTF-002")
                    .intfName("보험협회 청약정보 SOAP 연동")
                    .protType("SOAP")
                    .endPoint("http://api.klia.or.kr/services/SubscriptionInfo")
                    .status("ACTIVE")
                    .build(),
                InterfaceEntity.builder()
                    .intfId("INTF-003")
                    .intfName("정산 배치 파일 SFTP 전송")
                    .protType("SFTP")
                    .endPoint("sftp.fims-partner.com:22")
                    .status("ACTIVE")
                    .build(),
                InterfaceEntity.builder()
                    .intfId("INTF-004")
                    .intfName("내부 채널계 MQ 메시징")
                    .protType("MQ")
                    .endPoint("tcp://localhost:61616")
                    .status("ACTIVE")
                    .build()
            ));
        }

        if (transactionLogRepository.count() == 0) {
            transactionLogRepository.saveAll(List.of(
                TransactionLogEntity.builder()
                    .transId(UUID.randomUUID().toString())
                    .intfId("INTF-001")
                    .protType("REST")
                    .status("SUCCESS")
                    .resultCode("200")
                    .latencyMs(120L)
                    .startTime(LocalDateTime.now().minusMinutes(10))
                    .build(),
                TransactionLogEntity.builder()
                    .transId(UUID.randomUUID().toString())
                    .intfId("INTF-001")
                    .protType("REST")
                    .status("SUCCESS")
                    .resultCode("200")
                    .latencyMs(145L)
                    .startTime(LocalDateTime.now().minusMinutes(8))
                    .build(),
                TransactionLogEntity.builder()
                    .transId(UUID.randomUUID().toString())
                    .intfId("INTF-003")
                    .protType("SFTP")
                    .status("FAIL")
                    .resultCode("E-401")
                    .responsePayload("Authentication Failed")
                    .latencyMs(3500L)
                    .startTime(LocalDateTime.now().minusMinutes(5))
                    .build()
            ));
        }
    }
}
