package com.fims.service;

import com.jcraft.jsch.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Properties;

@Service
@Slf4j
public class SftpService implements ProtocolHandler {

    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    @Override
    public boolean supports(String protocolType) {
        return "SFTP".equalsIgnoreCase(protocolType);
    }

    @Override
    public String execute(com.fims.model.InterfaceEntity interfaceEntity, Object body, Map<String, String> parameters) {
        try {
            com.fasterxml.jackson.databind.JsonNode config = objectMapper.readTree(interfaceEntity.getProtocolConfig().getConfigData());
            String hostInfo = config.get("host").asText();
            String[] hostParts = hostInfo.split(":");
            String host = hostParts[0];
            int port = hostParts.length > 1 ? Integer.parseInt(hostParts[1]) : 22;
            
            String user = config.get("user").asText();
            String password = config.get("password").asText();
            
            log.info("Executing SFTP test for: {}", interfaceEntity.getIntfName());
            return executeSftpTest(host, port, user, password);
        } catch (Exception e) {
            log.error("SFTP execution failed: {}", e.getMessage());
            throw new RuntimeException("SFTP 호출 오류: " + e.getMessage());
        }
    }

    /**
     * SFTP 서버 접속 및 연결 테스트
     * @param host 호스트 주소 (예: sftp.example.com)
     * @param port 포트 (기본 22)
     * @param user 사용자명
     * @param password 비밀번호
     * @return 연결 성공 여부 메시지
     */
    public String executeSftpTest(String host, int port, String user, String password) throws JSchException, SftpException {
        JSch jsch = new JSch();
        Session session = null;
        ChannelSftp channelSftp = null;

        log.info("Attempting SFTP connection to {}@{}:{}", user, host, port);

        try {
            session = jsch.getSession(user, host, port);
            session.setPassword(password);

            Properties config = new Properties();
            config.put("StrictHostKeyChecking", "no"); // 데모용 호스트 키 검사 건너뛰기
            session.setConfig(config);
            session.setTimeout(10000); // 10초 타임아웃

            session.connect();
            
            Channel channel = session.openChannel("sftp");
            channel.connect();
            channelSftp = (ChannelSftp) channel;

            String serverVersion = session.getServerVersion();
            String pwd = channelSftp.pwd();
            
            log.info("SFTP Connected! Server Version: {}, Remote PWD: {}", serverVersion, pwd);
            
            return String.format("{\"status\":\"SUCCESS\", \"host\":\"%s\", \"version\":\"%s\", \"remotePath\":\"%s\"}", 
                                 host, serverVersion, pwd);

        } finally {
            if (channelSftp != null && channelSftp.isConnected()) {
                channelSftp.disconnect();
            }
            if (session != null && session.isConnected()) {
                session.disconnect();
            }
        }
    }
}
