package com.fims.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "TB_INTERFACE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class InterfaceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String intfId; // 예: INTF-001

    @Column(nullable = false)
    private String intfName;

    @Column(nullable = false)
    private String protType; // REST, SOAP, MQ, BATCH, SFTP

    private String endPoint;

    @Column(columnDefinition = "TEXT")
    private String authInfo; // 인증 정보

    @Column(nullable = false)
    private String status; // ACTIVE, INACTIVE

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
