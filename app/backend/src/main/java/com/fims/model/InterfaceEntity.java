package com.fims.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    private String httpMethod; // GET, POST, PUT, DELETE, etc.

    @Column(columnDefinition = "TEXT")
    private String authInfo; // 인증 정보

    @OneToMany(mappedBy = "interfaceEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<InterfaceParameter> parameters = new ArrayList<>();

    @Column(nullable = false)
    private String status; // ACTIVE, INACTIVE

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
    public void setParameters(List<InterfaceParameter> parameters) {
        this.parameters = parameters;
        if (parameters != null) {
            parameters.forEach(p -> p.setInterfaceEntity(this));
        }
    }
}
