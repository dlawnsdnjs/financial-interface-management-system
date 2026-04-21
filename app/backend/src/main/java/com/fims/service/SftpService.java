package com.fims.service;

import com.jcraft.jsch.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Service
@Slf4j
public class SftpService {

    /**
     * SFTP 서버 접속 및 연결 테스트
     * @param host 호스트 주소 (예: sftp.example.com)
     * @param port 포트 (기본 22)
     * @param user 사용자명
     * @param password 비밀번호
     * @return 연결 성공 여부 메시지
     */
    public String executeSftpTest(String host, int port, String user, String password) throws JSchException {
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
            
            return "Connected to " + host + ". Remote Path: " + pwd;

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
