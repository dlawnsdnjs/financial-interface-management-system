package com.fims.service;

import com.fims.domain.InterfaceEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.oxm.jaxb.Jaxb2Marshaller;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.ws.client.core.WebServiceTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@Service
public class SoapProtocolHandler implements ProtocolHandler {

    private final WebServiceTemplate webServiceTemplate;
    private final RestTemplate restTemplate;
    private static final javax.xml.transform.TransformerFactory TRANSFORMER_FACTORY = javax.xml.transform.TransformerFactory.newInstance();

    public SoapProtocolHandler() {
        this.webServiceTemplate = new WebServiceTemplate();
        // Jaxb2Marshaller는 실제 클래스가 있을 때만 설정해야 하므로 기본 생성자에서는 제외
        this.restTemplate = new RestTemplate();
    }

    @Override
    public boolean supports(String protocolType) {
        return "SOAP".equalsIgnoreCase(protocolType);
    }

    @Override
    public Object execute(InterfaceEntity entity, Object payload) {
        Map<String, Object> config = entity.getProtocolConfig();
        if (config == null) throw new IllegalArgumentException("SOAP config is missing");

        String wsdlUrl = (String) config.get("wsdlUrl");
        String soapAction = (String) config.getOrDefault("soapAction", "");

        log.info("Executing SOAP interface [{}]: {}", entity.getName(), wsdlUrl);

        // 1. 데이터 추출 및 정규화 (RestProtocolHandler 방식 적용)
        Object effectivePayload = payload;
        if (effectivePayload == null || (effectivePayload instanceof Map && ((Map<?, ?>) effectivePayload).isEmpty())) {
            effectivePayload = entity.getDefaultArguments();
        }

        try {
            if (effectivePayload instanceof Map && ((Map<?, ?>) effectivePayload).containsKey("rawBody")) {
                String rawBody = (String) ((Map<?, ?>) effectivePayload).get("rawBody");
                if (rawBody == null) rawBody = "";
                
                String trimmedBody = rawBody.trim();
                // Envelope 포함 여부를 더 단순하고 확실하게 체크
                boolean hasEnvelope = trimmedBody.toLowerCase().contains("<soap:envelope") 
                                   || trimmedBody.toLowerCase().contains("<soap12:envelope")
                                   || trimmedBody.toLowerCase().contains("<envelope");

                if (hasEnvelope) {
                    log.info("Detected full SOAP Envelope. Using RestTemplate for direct POST.");
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(new MediaType("text", "xml", StandardCharsets.UTF_8));
                    if (soapAction != null && !soapAction.isEmpty()) {
                        headers.set("SOAPAction", soapAction);
                    }
                    
                    HttpEntity<String> request = new HttpEntity<>(rawBody, headers);
                    return restTemplate.postForObject(wsdlUrl, request, String.class);
                } else {
                    log.info("Detected payload only. Using WebServiceTemplate.sendSourceAndReceive.");
                    return webServiceTemplate.sendSourceAndReceive(wsdlUrl,
                            new org.springframework.xml.transform.StringSource(rawBody),
                            response -> {
                                try {
                                    javax.xml.transform.Transformer transformer = TRANSFORMER_FACTORY.newTransformer();
                                    java.io.StringWriter writer = new java.io.StringWriter();
                                    transformer.transform(response, new javax.xml.transform.stream.StreamResult(writer));
                                    return writer.toString();
                                } catch (Exception e) {
                                    log.warn("Failed to transform SOAP response: {}", e.getMessage());
                                    return "Success (Response transformation failed)";
                                }
                            });
                }
            } else {
                log.info("No rawBody found. Attempting execution with payload.");
                // 마샬러가 설정되지 않았을 가능성을 고려하여 안전하게 처리
                try {
                    Object response = webServiceTemplate.marshalSendAndReceive(wsdlUrl, effectivePayload);
                    return response != null ? response.toString() : "Success";
                } catch (IllegalStateException e) {
                    if (e.getMessage().contains("No marshaller registered")) {
                        log.warn("WebServiceTemplate has no marshaller. Please use 'Raw Mode' with full XML Envelope.");
                        throw new RuntimeException("SOAP execution failed: No marshaller registered. Please use 'Raw Mode' in execution arguments to send full XML.");
                    }
                    throw e;
                }
            }
        } catch (Exception e) {
            log.error("SOAP execution error: {}", e.getMessage(), e);
            throw new RuntimeException("SOAP request failed: " + e.getMessage(), e);
        }
    }
}
