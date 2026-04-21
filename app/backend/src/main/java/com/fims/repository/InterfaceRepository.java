package com.fims.repository;

import com.fims.model.InterfaceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InterfaceRepository extends JpaRepository<InterfaceEntity, Long> {
    Optional<InterfaceEntity> findByIntfId(String intfId);
}
