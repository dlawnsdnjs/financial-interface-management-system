package com.fims.repository;

import com.fims.model.TransactionLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionLogRepository extends JpaRepository<TransactionLogEntity, Long> {
    List<TransactionLogEntity> findByIntfIdOrderByStartTimeDesc(String intfId);
}
