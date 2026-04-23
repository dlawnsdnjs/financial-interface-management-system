package com.fims.service;

import com.fims.dto.SoapOperationDto;
import lombok.extern.slf4j.Slf4j;
import org.apache.cxf.endpoint.Client;
import org.apache.cxf.jaxws.endpoint.dynamic.JaxWsDynamicClientFactory;
import org.apache.cxf.service.model.MessagePartInfo;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class SoapService implements ProtocolHandler {

    @Override
    public String execute(String endpoint, String method, Object body, Map<String, String> parameters) {
        // ...
        try {
            JaxWsDynamicClientFactory dcf = JaxWsDynamicClientFactory.newInstance();
            Client client = dcf.createClient(endpoint);
            
            Object[] result = client.invoke(method, body != null ? body : "");
            
            return "SOAP Dynamic Call Successful: " + (result.length > 0 ? result[0].toString() : "No return");
        } catch (Exception e) {
            log.error("SOAP Dynamic Client Call failed: {}", e.getMessage());
            throw new RuntimeException("SOAP 동적 호출 오류: " + e.getMessage());
        }
    }

    @Override
    public String getProtocolType() {
        return "SOAP";
    }

    public List<SoapOperationDto> getOperations(String wsdlUrl) {
        log.info("Fetching SOAP operations for WSDL URL: {}", wsdlUrl);
        try {
            JaxWsDynamicClientFactory dcf = JaxWsDynamicClientFactory.newInstance();
            Client client = dcf.createClient(wsdlUrl);
            
            return client.getEndpoint().getBinding().getBindingInfo().getOperations().stream()
                    .map(op -> {
                        List<String> params = new ArrayList<>();
                        if (op.getInput() != null) {
                            org.apache.cxf.service.model.BindingMessageInfo input = op.getInput();
                            for (MessagePartInfo part : input.getMessageParts()) {
                                // 파라미터 이름 추출 (part의 이름을 우선 사용)
                                String name = part.getName().getLocalPart();
                                // 'parameters' 래퍼인 경우, 실제 Element QName이 있다면 그걸 우선 시도
                                if ("parameters".equals(name) && part.getElementQName() != null) {
                                    params.add(part.getElementQName().getLocalPart());
                                } else {
                                    params.add(name);
                                }
                            }
                        }
                        return new SoapOperationDto(op.getName().getLocalPart(), params);
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to fetch operations for WSDL URL: {}. Error: {}", wsdlUrl, e.getMessage(), e);
            throw new RuntimeException("WSDL 파싱 실패: " + e.getMessage());
        }
    }
}
