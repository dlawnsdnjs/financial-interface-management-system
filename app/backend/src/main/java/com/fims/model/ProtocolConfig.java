package com.fims.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TB_PROTOCOL_CONFIG")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProtocolConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interface_id")
    private InterfaceEntity interfaceEntity;

    private String protocolType; // REST, SOAP, SFTP, MQ

    // 통합 필드 (각 프로토콜별로 필요한 것만 사용)
    @Column(columnDefinition = "TEXT")
    private String configData; // JSON 형태로 상세 설정 저장 (확장성 고려)
}
