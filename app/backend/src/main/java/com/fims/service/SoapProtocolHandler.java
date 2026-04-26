package com.fims.service;

import com.fims.domain.InterfaceEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
    private final LoggingService loggingService;
    private static final javax.xml.transform.TransformerFactory TRANSFORMER_FACTORY = javax.xml.transform.TransformerFactory.newInstance();

    public SoapProtocolHandler(LoggingService loggingService) {
        this.webServiceTemplate = new WebServiceTemplate();
        this.restTemplate = new RestTemplate();
        this.loggingService = loggingService;
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

        Object responseObj = null;
        long startTime = System.currentTimeMillis();
        try {
            if (effectivePayload instanceof Map && ((Map<?, ?>) effectivePayload).containsKey("rawBody")) {
                String rawBody = (String) ((Map<?, ?>) effectivePayload).get("rawBody");
                if (rawBody == null) rawBody = "";
                
                String trimmedBody = rawBody.trim();
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
                    ResponseEntity<String> response = restTemplate.postForEntity(wsdlUrl, request, String.class);
                    responseObj = response.getBody();

                    if (!response.getStatusCode().is2xxSuccessful()) {
                        throw new RuntimeException("SOAP HTTP Failure: " + response.getStatusCode().value());
                    }
                } else {
                    log.info("Detected payload only. Using WebServiceTemplate.sendSourceAndReceive.");
                    responseObj = webServiceTemplate.sendSourceAndReceive(wsdlUrl,
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
                try {
                    Object response = webServiceTemplate.marshalSendAndReceive(wsdlUrl, effectivePayload);
                    responseObj = response != null ? response.toString() : "Success";
                } catch (IllegalStateException e) {
                    if (e.getMessage().contains("No marshaller registered")) {
                        throw new RuntimeException("SOAP execution failed: No marshaller registered. Please use 'Raw Mode' in execution arguments to send full XML.");
                    }
                    throw e;
                }
            }
            long duration = System.currentTimeMillis() - startTime;
            loggingService.log(entity.getId(), "SOAP", effectivePayload, "SUCCESS", null, responseObj, duration);
            return responseObj;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("SOAP execution error: {}", e.getMessage(), e);
            loggingService.log(entity.getId(), "SOAP", effectivePayload, "FAIL", e.getMessage(), null, duration);
            throw new RuntimeException("SOAP request failed: " + e.getMessage(), e);
        }
    }
}
