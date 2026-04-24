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

        // payload가 없으면 defaultArguments 사용
        Object effectivePayload = (payload != null) ? payload : entity.getDefaultArguments();
        
        return handler.execute(entity, effectivePayload);
    }
}
