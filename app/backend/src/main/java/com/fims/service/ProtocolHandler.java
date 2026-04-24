package com.fims.service;

import com.fims.domain.InterfaceEntity;

public interface ProtocolHandler {
    boolean supports(String protocolType);
    Object execute(InterfaceEntity entity, Object payload);
}
