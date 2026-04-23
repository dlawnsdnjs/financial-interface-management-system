package com.fims.service;

import com.jcraft.jsch.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Properties;

@Service
@Slf4j
public class SftpService implements ProtocolHandler {

    @Override
    public String execute(String endpoint, String method, Object body, Map<String, String> parameters) {
        // 엔드포인트에 파라미터를 동적으로 추가/활용 (예: 경로 수정)
        String targetPath = endpoint;
        if (parameters != null && parameters.containsKey("path")) {
            targetPath = endpoint + "/" + parameters.get("path");
        }
        
        String host = targetPath.contains(":") ? targetPath.split(":")[0] : targetPath;
        int port = targetPath.contains(":") ? Integer.parseInt(targetPath.split(":")[1]) : 22;
        String user = parameters.getOrDefault("user", "anonymous");
        String password = parameters.getOrDefault("password", "");

        try {
            return executeSftpTest(host, port, user, password);
        } catch (Exception e) {
            throw new RuntimeException("SFTP 연동 오류: " + e.getMessage());
        }
    }

    @Override
    public String getProtocolType() {
        return "SFTP";
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
