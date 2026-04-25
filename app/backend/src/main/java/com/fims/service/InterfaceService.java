package com.fims.service;

import com.fims.domain.InterfaceEntity;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class InterfaceService {

    private final List<ProtocolHandler> handlers;

    public InterfaceService(List<ProtocolHandler> handlers) {
        this.handlers = handlers;
    }

    public Object processInterface(InterfaceEntity entity, Object payload) {
        ProtocolHandler handler = handlers.stream()
                .filter(h -> h.supports(entity.getProtocolType()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported protocol: " + entity.getProtocolType()));

        // 실행 시 runtime payload는 무시하고 항상 저장된 defaultArguments 사용
        return handler.execute(entity, entity.getDefaultArguments());
    }
}
