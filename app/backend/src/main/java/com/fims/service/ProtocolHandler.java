package com.fims.service;

import com.fims.model.InterfaceEntity;
import java.util.Map;

public interface ProtocolHandler {
    boolean supports(String protocolType);
    String execute(InterfaceEntity interfaceEntity, Object body, Map<String, String> parameters);
}
