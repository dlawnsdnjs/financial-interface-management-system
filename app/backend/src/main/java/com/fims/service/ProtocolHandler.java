package com.fims.service;

import java.util.Map;

public interface ProtocolHandler {
    String execute(String endpoint, String method, Object body, Map<String, String> parameters);
    String getProtocolType();
}
