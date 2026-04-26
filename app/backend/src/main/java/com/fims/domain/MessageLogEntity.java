package com.fims.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long interfaceId;

    @Column(nullable = false)
    private String protocol;

    @Column(columnDefinition = "TEXT")
    private String payload;

    @Column(columnDefinition = "TEXT")
    private String response;

    @Column(nullable = false)
    private String status; // SUCCESS, FAIL

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    private Long executionTimeMs;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
