package com.fims.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "TB_TRANS_LOG")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class TransactionLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String transId; // UUID 등 고유 식별자

    private String retryOf; // 원본 트랜잭션 ID (재처리인 경우)

    @Column(nullable = false)
    private String intfId;

    @Column(nullable = false)
    private String protType;

    private String httpMethod; // GET, POST, etc.

    @Column(nullable = false)
    private String status; // SUCCESS, FAIL

    private String resultCode; // HTTP Status Code 또는 에러 코드

    @Column(columnDefinition = "TEXT")
    private String requestPayload;

    @Column(columnDefinition = "TEXT")
    private String responsePayload;

    private Long latencyMs;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime startTime;
}
