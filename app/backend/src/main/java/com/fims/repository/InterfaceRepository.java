package com.fims.repository;

import com.fims.domain.InterfaceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterfaceRepository extends JpaRepository<InterfaceEntity, Long> {
}
