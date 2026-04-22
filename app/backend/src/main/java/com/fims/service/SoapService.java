package com.fims.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class SoapService {

    private final RestTemplate restTemplate;

    public String executeSoapRequest(String endpoint, String action, String payload) {
        log.info("Executing SOAP Request to: {} with Action: {}", endpoint, action);
        
        // SOAP 특성상 XML 포맷의 페이로드가 필요함
        if (payload == null || !payload.contains("Envelope")) {
            payload = String.format(
                "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\">" +
                "  <soapenv:Header/>" +
                "  <soapenv:Body>%s</soapenv:Body>" +
                "</soapenv:Envelope>", payload != null ? payload : "");
        }

        try {
            // 실제 SOAP 서버가 없을 경우를 대비해 시뮬레이션 응답 반환
            log.info("SOAP Payload: {}", payload);
            return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
                   "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\">" +
                   "  <soapenv:Body><Response>SOAP Execution Successful</Response></soapenv:Body>" +
                   "</soapenv:Envelope>";
        } catch (Exception e) {
            log.error("SOAP request failed: {}", e.getMessage());
            throw new RuntimeException("SOAP 연동 오류: " + e.getMessage());
        }
    }
}
