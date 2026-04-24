package com.fims.service;

import com.fims.domain.InterfaceEntity;
import com.jcraft.jsch.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Properties;

@Slf4j
@Service
public class SftpProtocolHandler implements ProtocolHandler {

    @Override
    public boolean supports(String protocolType) {
        return "SFTP".equalsIgnoreCase(protocolType);
    }

    @Override
    public Object execute(InterfaceEntity entity, Object payload) {
        Map<String, Object> config = entity.getProtocolConfig();
        if (config == null) throw new IllegalArgumentException("SFTP config is missing");

        String host = (String) config.get("host");
        int port = (int) config.getOrDefault("port", 22);
        String username = (String) config.get("username");
        String password = (String) config.get("password");
        String remoteDir = (String) config.getOrDefault("remoteDir", "/");
        String fileName = (String) config.getOrDefault("fileName", "data_" + System.currentTimeMillis() + ".txt");

        JSch jsch = new JSch();
        Session session = null;
        ChannelSftp sftp = null;

        log.info("Connecting to SFTP [{}]: {}:{} as {}", entity.getName(), host, port, username);

        try {
            session = jsch.getSession(username, host, port);
            session.setPassword(password);

            Properties props = new Properties();
            props.put("StrictHostKeyChecking", "no");
            session.setConfig(props);
            session.connect();

            sftp = (ChannelSftp) session.openChannel("sftp");
            sftp.connect();

            String content = payload != null ? payload.toString() : "";
            try (InputStream is = new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8))) {
                sftp.cd(remoteDir);
                sftp.put(is, fileName);
            }

            log.info("SFTP upload success: {}/{}", remoteDir, fileName);
            return "File uploaded successfully: " + fileName;

        } catch (JSchException | SftpException e) {
            log.error("SFTP failed: {}", e.getMessage());
            throw new RuntimeException("SFTP upload failed", e);
        } catch (Exception e) {
            log.error("General SFTP error: {}", e.getMessage());
            throw new RuntimeException("SFTP failed", e);
        } finally {
            if (sftp != null && sftp.isConnected()) sftp.disconnect();
            if (session != null && session.isConnected()) session.disconnect();
        }
    }
}
