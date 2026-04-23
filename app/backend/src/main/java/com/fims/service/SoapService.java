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

    @Override
    public boolean supports(String protocolType) {
        return "SOAP".equalsIgnoreCase(protocolType);
    }

    @Override
    public String execute(com.fims.model.InterfaceEntity interfaceEntity, Object body, Map<String, String> parameters) {
        // TODO: Parse interfaceEntity.getProtocolConfig().getConfigData() as JSON for SOAP settings
        log.info("Executing SOAP call for: {}", interfaceEntity.getIntfName());
        return "SOAP execution needs implementation with new config";
    }

    public List<SoapOperationDto> getOperations(String wsdlUrl) {
        // WSDL 파싱이 필요 없는 환경임을 고려하여 빈 리스트 반환 (예외 제거)
        return List.of();
    }
}
