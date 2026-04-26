package com.fims.repository;

import com.fims.domain.MessageLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageLogRepository extends JpaRepository<MessageLogEntity, Long> {
    List<MessageLogEntity> findByInterfaceIdOrderByCreatedAtDesc(Long interfaceId);
}
