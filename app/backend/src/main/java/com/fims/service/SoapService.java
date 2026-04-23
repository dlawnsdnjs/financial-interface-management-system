package com.fims.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.cxf.endpoint.Client;
import org.apache.cxf.jaxws.endpoint.dynamic.JaxWsDynamicClientFactory;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
public class SoapService implements ProtocolHandler {

    @Override
    public String execute(String endpoint, String method, Object body, Map<String, String> parameters) {
        // endpoint는 WSDL URL로 사용
        // method는 Operation 이름으로 사용
        // parameters는 인자로 전달
        
        try {
            JaxWsDynamicClientFactory dcf = JaxWsDynamicClientFactory.newInstance();
            Client client = dcf.createClient(endpoint);
            
            // 파라미터가 없으면 빈 배열로 호출
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
}
