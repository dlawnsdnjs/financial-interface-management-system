package com.fims.service;

import com.fims.dto.SoapOperationDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class SoapService implements ProtocolHandler {
    
    private final RestTemplate restTemplate = new RestTemplate();
    private static final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    @Override
    public boolean supports(String protocolType) {
        return "SOAP".equalsIgnoreCase(protocolType);
    }

    @Override
    public String execute(com.fims.model.InterfaceEntity interfaceEntity, Object body, Map<String, String> parameters) {
        try {
            com.fasterxml.jackson.databind.JsonNode config = objectMapper.readTree(interfaceEntity.getProtocolConfig().getConfigData());
            String wsdlUrl = config.path("wsdlUrl").asText();
            String operationName = config.path("operationName").asText();

            log.info("Executing SOAP call to: {} with operation: {}", wsdlUrl, operationName);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("text/xml;charset=UTF-8"));
            headers.add("SOAPAction", operationName);

            HttpEntity<String> request = new HttpEntity<>(body != null ? body.toString() : "", headers);       
            return restTemplate.postForObject(wsdlUrl, request, String.class);
        } catch (Exception e) {
            log.error("SOAP execution failed: {}", e.getMessage());
            throw new RuntimeException("SOAP execution failed");
        }
    }

    public List<SoapOperationDto> getOperations(String wsdlUrl) {
        // WSDL 파싱이 필요 없는 환경임을 고려하여 빈 리스트 반환 (예외 제거)
        return List.of();
    }
}
