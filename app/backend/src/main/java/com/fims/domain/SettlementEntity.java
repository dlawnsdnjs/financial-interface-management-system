package com.fims.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "TB_SETTLEMENT")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SettlementEntity {
    @Id
    @Column(name = "settlement_id", length = 36)
    private String settlementId;

    @Column(name = "contract_no", length = 20, nullable = false)
    private String contractNo;

    @Column(name = "customer_name", length = 50, nullable = false)
    private String customerName;

    @Column(name = "jumin_no", length = 20, nullable = false)
    private String juminNo;

    @Column(name = "amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "batch_job_id", length = 100, nullable = false)
    private String batchJobId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
