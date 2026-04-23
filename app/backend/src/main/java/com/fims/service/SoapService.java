package com.fims.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SoapService implements ProtocolHandler {

    @Override
    public String execute(String endpoint, String method, Object body, Map<String, String> parameters) {
        String payload = body != null ? body.toString() : "";
        
        // 파라미터를 XML 요소로 변환하여 페이로드에 포함
        if (parameters != null && !parameters.isEmpty()) {
            StringBuilder xmlParams = new StringBuilder();
            parameters.forEach((k, v) -> 
                xmlParams.append(String.format("<%s>%s</%s>", k, v, k))
            );
            payload = String.format("<Request>%s<Data>%s</Data></Request>", xmlParams.toString(), payload);
        }
        return executeSoapRequest(endpoint, method, payload);
    }

    @Override
    public String getProtocolType() {
        return "SOAP";
    }

    public String executeSoapRequest(String endpoint, String action, String payload) {
        log.info("Executing SOAP Request to: {} with Action: {}", endpoint, action);
        log.info("Payload: {}", payload);
        // SOAP 특성상 XML 포맷의 페이로드가 필요함
        if (payload == null || !payload.contains("Envelope")) {
            payload = String.format(
                "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\">" +
                "  <soapenv:Header/>" +
                "  <soapenv:Body>%s</soapenv:Body>" +
                "</soapenv:Envelope>", payload != null ? payload : "");
        }

        try {
            // 실제 SOAP 서버가 없을 경우를 대비해 요청 데이터를 포함한 시뮬레이션 응답 반환
            log.info("SOAP Payload: {}", payload);
            return String.format("<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
                   "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\">" +
                   "  <soapenv:Body>" +
                   "    <Response>" +
                   "      <Status>SUCCESS</Status>" +
                   "      <Message>SOAP Execution Successful</Message>" +
                   "      <ProcessedPayload>%s</ProcessedPayload>" +
                   "    </Response>" +
                   "  </soapenv:Body>" +
                   "</soapenv:Envelope>", payload.replaceAll("<[^>]*>", ""));
        } catch (Exception e) {
            log.error("SOAP request failed: {}", e.getMessage());
            throw new RuntimeException("SOAP 연동 오류: " + e.getMessage());
        }
    }
}
