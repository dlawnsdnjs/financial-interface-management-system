package com.fims.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RestService implements ProtocolHandler {

    private final RestTemplate restTemplate;

@Override
    public boolean supports(String protocolType) {
        return "REST".equalsIgnoreCase(protocolType);
    }

    @Override
    public String execute(InterfaceEntity interfaceEntity, Object body, Map<String, String> parameters) {
        // TODO: Implement JSON config parsing
        log.info("Executing REST call for: {}", interfaceEntity.getIntfName());
        return "REST execution needs implementation with new config";
    }
}
