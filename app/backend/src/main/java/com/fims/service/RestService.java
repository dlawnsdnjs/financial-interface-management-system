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
    public String execute(String endpoint, String method, Object body, Map<String, String> parameters) {
        String queryString = parameters.entrySet().stream()
                .map(e -> URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8) + "=" +
                          URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));

        String url = endpoint;
        if (!queryString.isEmpty()) {
            url += (url.contains("?") ? "&" : "?") + queryString;
        }

        log.info("Calling REST endpoint: {} via {}", url, method);

        if ("POST".equalsIgnoreCase(method)) {
            return restTemplate.postForObject(endpoint, body, String.class);
        }
        return restTemplate.getForObject(url, String.class);
    }

    @Override
    public String getProtocolType() {
        return "REST";
    }
}
