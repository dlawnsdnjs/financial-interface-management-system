package com.fims.service;

import com.fims.domain.InterfaceEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.oxm.jaxb.Jaxb2Marshaller;
import org.springframework.stereotype.Service;
import org.springframework.ws.client.core.WebServiceTemplate;
import org.springframework.ws.soap.client.core.SoapActionCallback;

import java.util.Map;

@Slf4j
@Service
public class SoapProtocolHandler implements ProtocolHandler {

    private final WebServiceTemplate webServiceTemplate;

    public SoapProtocolHandler() {
        this.webServiceTemplate = new WebServiceTemplate();
        Jaxb2Marshaller marshaller = new Jaxb2Marshaller();
        marshaller.setPackagesToScan("com.fims.ws");
        this.webServiceTemplate.setMarshaller(marshaller);
        this.webServiceTemplate.setUnmarshaller(marshaller);
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

        log.info("Executing SOAP interface [{}]: {}", entity.getName(), wsdlUrl);

        try {
            if (payload instanceof Map && ((Map<?, ?>) payload).containsKey("rawBody")) {
                String rawBody = (String) ((Map<?, ?>) payload).get("rawBody");
                log.info("Executing SOAP with raw XML body");
                // Raw XML 전송을 위한 처리 (SoapAction이 필요한 경우 설정 필요)
                return webServiceTemplate.sendSourceAndReceive(wsdlUrl,
                        new org.springframework.xml.transform.StringSource(rawBody),
                        response -> response);
            } else {
                Object response = webServiceTemplate.marshalSendAndReceive(wsdlUrl, payload);
                return response != null ? response.toString() : "Success";
            }
        } catch (Exception e) {
            log.error("SOAP execution error: {}", e.getMessage());
            throw new RuntimeException("SOAP request failed: " + e.getMessage(), e);
        }
    }
}
