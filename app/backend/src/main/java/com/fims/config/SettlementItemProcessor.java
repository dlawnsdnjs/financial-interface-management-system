package com.fims.config;

import com.fims.domain.SettlementEntity;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Component
public class SettlementItemProcessor implements ItemProcessor<SettlementEntity, SettlementEntity> {

    private final Set<String> processedContracts = new HashSet<>();

    @Override
    public SettlementEntity process(SettlementEntity item) throws Exception {
        // Amount 검증
        if (item.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return null; // Skip
        }

        // 중복 체크
        if (processedContracts.contains(item.getContractNo())) {
            return null; // Skip
        }
        processedContracts.add(item.getContractNo());

        // 주민번호 마스킹: 901010-1234567 -> 901010-1******
        String jumin = item.getJuminNo();
        if (jumin != null && jumin.length() >= 8) {
            item.setJuminNo(jumin.substring(0, 8) + "******");
        }

        return item;
    }
}
