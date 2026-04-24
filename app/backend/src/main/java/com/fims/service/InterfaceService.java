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

    public void processInterface(InterfaceEntity entity, Object payload) {
        ProtocolHandler handler = handlers.stream()
                .filter(h -> h.supports(entity.getProtocolType()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported protocol: " + entity.getProtocolType()));

        handler.execute(entity, payload);
    }
}
