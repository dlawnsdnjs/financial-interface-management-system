package com.fims.service;

import com.fims.domain.InterfaceEntity;

public interface ProtocolHandler {
    boolean supports(String protocolType);
    void execute(InterfaceEntity entity, Object payload);
}
