package com.fims.config;

import com.fims.domain.SettlementEntity;
import jakarta.persistence.EntityManager;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class SettlementItemWriter implements ItemWriter<SettlementEntity> {

    private final EntityManager entityManager;

    public SettlementItemWriter(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Override
    @Transactional
    public void write(Chunk<? extends SettlementEntity> chunk) throws Exception {
        for (SettlementEntity item : chunk) {
            entityManager.persist(item);
        }
    }
}
