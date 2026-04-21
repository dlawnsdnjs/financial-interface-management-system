package com.fims.config;

import com.fims.model.InterfaceEntity;
import com.fims.repository.InterfaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final InterfaceRepository interfaceRepository;

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
    }
}
