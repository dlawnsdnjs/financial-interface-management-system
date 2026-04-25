package com.fims.service;

import com.fims.domain.InterfaceEntity;
import com.jcraft.jsch.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.net.ftp.FTP;
import org.apache.commons.net.ftp.FTPClient;
import org.apache.commons.net.ftp.FTPReply;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

@Slf4j
@Service
public class FileProtocolHandler implements ProtocolHandler {

    @Override
    public boolean supports(String protocolType) {
        return "FILE".equalsIgnoreCase(protocolType) || "SFTP".equalsIgnoreCase(protocolType);
    }

    public Object listDirectory(Map<String, Object> config, String remotePath) {
        String protocol = (String) config.getOrDefault("protocol", "SFTP");
        if ("FTP".equalsIgnoreCase(protocol)) {
            return listFtpFiles(config, remotePath);
        } else {
            return listSftpFiles(config, remotePath);
        }
    }

    private Object listFtpFiles(Map<String, Object> config, String remotePath) {
        String host = getHost(config);
        int port = getPort(config, 21);
        String username = (String) config.get("username");
        String password = (String) config.get("password");

        FTPClient ftpClient = new FTPClient();
        try {
            ftpClient.connect(host, port);
            if (!ftpClient.login(username, password)) {
                throw new RuntimeException("FTP Login Failed");
            }
            ftpClient.enterLocalPassiveMode();
            
            if (remotePath != null && !remotePath.isEmpty()) {
                ftpClient.changeWorkingDirectory(remotePath);
            }
            
            java.util.List<Map<String, Object>> files = new java.util.ArrayList<>();
            org.apache.commons.net.ftp.FTPFile[] ftpFiles = ftpClient.listFiles();
            
            if (ftpFiles != null) {
                for (org.apache.commons.net.ftp.FTPFile file : ftpFiles) {
                    Map<String, Object> fileInfo = new HashMap<>();
                    fileInfo.put("name", file.getName());
                    fileInfo.put("isDirectory", file.isDirectory());
                    fileInfo.put("size", file.getSize());
                    files.add(fileInfo);
                }
            }
            return files;
        } catch (IOException e) {
            log.error("FTP list error: ", e);
            throw new RuntimeException("FTP list failed: " + e.getMessage());
        } finally {
            try { ftpClient.disconnect(); } catch (IOException ignored) {}
        }
    }

    private Object listSftpFiles(Map<String, Object> config, String remotePath) {
        String host = getHost(config);
        int port = getPort(config, 22);
        String username = (String) config.get("username");
        String password = (String) config.get("password");
        String authType = (String) config.getOrDefault("authType", "PASSWORD");
        String privateKeyContent = (String) config.get("privateKey");

        JSch jsch = new JSch();
        Session session = null;
        ChannelSftp sftp = null;
        try {
            if ("SSH_KEY".equalsIgnoreCase(authType)) {
                if (privateKeyContent != null && !privateKeyContent.trim().isEmpty()) {
                    jsch.addIdentity("key", privateKeyContent.getBytes(StandardCharsets.UTF_8), null, null);
                }
            }

            session = jsch.getSession(username, host, port);
            if ("PASSWORD".equalsIgnoreCase(authType)) {
                session.setPassword(password);
            }
            Properties props = new Properties();
            props.put("StrictHostKeyChecking", "no");
            session.setConfig(props);
            session.connect();
            
            sftp = (ChannelSftp) session.openChannel("sftp");
            sftp.connect();
            if (remotePath != null && !remotePath.isEmpty()) sftp.cd(remotePath);
            
            java.util.List<Map<String, Object>> files = new java.util.ArrayList<>();
            java.util.Vector<ChannelSftp.LsEntry> entries = sftp.ls(".");
            for (ChannelSftp.LsEntry entry : entries) {
                if (entry.getFilename().equals(".") || entry.getFilename().equals("..")) continue;
                Map<String, Object> fileInfo = new HashMap<>();
                fileInfo.put("name", entry.getFilename());
                fileInfo.put("isDirectory", entry.getAttrs().isDir());
                fileInfo.put("size", entry.getAttrs().getSize());
                files.add(fileInfo);
            }
            return files;
        } catch (Exception e) {
            log.error("SFTP list error: ", e);
            throw new RuntimeException("SFTP list failed: " + e.getMessage());
        } finally {
            if (sftp != null && sftp.isConnected()) sftp.disconnect();
            if (session != null && session.isConnected()) session.disconnect();
        }
    }

    @Override
    public Object execute(InterfaceEntity entity, Object payload) {
        Map<String, Object> config = entity.getProtocolConfig();
        if (config == null) throw new IllegalArgumentException("File config is missing");

        String protocol = (String) config.getOrDefault("protocol", "SFTP");
        String mode = (String) config.getOrDefault("mode", "UPLOAD");
        
        if ("FTP".equalsIgnoreCase(protocol)) {
            return executeFtp(config, mode, payload);
        } else {
            return executeSftp(config, mode, payload);
        }
    }

    private byte[] getUploadBytes(Object payload) {
        if (!(payload instanceof Map)) return new byte[0];
        Map<String, Object> map = (Map<String, Object>) payload;

        // 우선순위: file 객체가 존재하면 이를 우선 처리
        if (map.containsKey("file") && map.get("file") instanceof Map) {
            Object fileObj = map.get("file");
            String base64Content = (String) ((Map<?, ?>) fileObj).get("content");
            if (base64Content != null) {
                return Base64.getDecoder().decode(base64Content);
            }
        }
        
        // Raw 또는 일반 content 처리
        Object rawBody = map.get("rawBody");
        if (rawBody != null) {
            return rawBody.toString().getBytes(StandardCharsets.UTF_8);
        }

        Object contentObj = map.get("content");
        if (contentObj != null) {
            return contentObj.toString().getBytes(StandardCharsets.UTF_8);
        }

        return new byte[0];
    }

    private int getPort(Map<String, Object> config, int defaultPort) {
        Object portObj = config.get("port");
        if (portObj == null) return defaultPort;
        if (portObj instanceof Integer) return (Integer) portObj;
        try {
            return Integer.parseInt(portObj.toString());
        } catch (NumberFormatException e) {
            return defaultPort;
        }
    }

    private String getHost(Map<String, Object> config) {
        String host = (String) config.get("host");
        if (host == null) return "";
        return host.replaceAll("^(sftp|ftp)://", "");
    }

    private Object executeFtp(Map<String, Object> config, String mode, Object payload) {
        String host = getHost(config);
        int port = getPort(config, 21);
        String username = (String) config.get("username");
        String password = (String) config.get("password");
        String remoteDir = (String) config.getOrDefault("remoteDir", "/");
        String fileName = (String) config.getOrDefault("fileName", "data_" + System.currentTimeMillis() + ".txt");

        FTPClient ftpClient = new FTPClient();
        try {
            ftpClient.connect(host, port);
            int reply = ftpClient.getReplyCode();
            if (!FTPReply.isPositiveCompletion(reply)) {
                ftpClient.disconnect();
                throw new RuntimeException("FTP server refused connection.");
            }

            if (!ftpClient.login(username, password)) {
                ftpClient.logout();
                throw new RuntimeException("FTP login failed.");
            }

            ftpClient.enterLocalPassiveMode();
            ftpClient.setFileType(FTP.BINARY_FILE_TYPE);
            ftpClient.changeWorkingDirectory(remoteDir);

            if ("UPLOAD".equalsIgnoreCase(mode)) {
                byte[] bytes = getUploadBytes(payload);
                String fileNames = (String) config.getOrDefault("fileName", "");
                for (String name : fileNames.split(",")) {
                    if (name.trim().isEmpty()) continue;
                    try (InputStream is = new ByteArrayInputStream(bytes)) {
                        boolean success = ftpClient.storeFile(name.trim(), is);
                        if (!success) log.error("FTP upload failed for: " + name);
                    }
                }
                return "FTP Upload Processed for: " + fileNames;
            } else {
                String fileNames = (String) config.getOrDefault("fileName", "");
                Map<String, Object> results = new HashMap<>();
                for (String name : fileNames.split(",")) {
                    if (name.trim().isEmpty()) continue;
                    try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
                        boolean success = ftpClient.retrieveFile(name.trim(), os);
                        if (success) results.put(name.trim(), Base64.getEncoder().encodeToString(os.toByteArray()));
                    }
                }
                results.put("type", "multi-file");
                return results;
            }

        } catch (IOException e) {
            log.error("FTP error: {}", e.getMessage());
            throw new RuntimeException("FTP operation failed", e);
        } finally {
            try {
                if (ftpClient.isConnected()) {
                    ftpClient.logout();
                    ftpClient.disconnect();
                }
            } catch (IOException ex) {
                log.error("Error closing FTP connection: {}", ex.getMessage());
            }
        }
    }

    private Object executeSftp(Map<String, Object> config, String mode, Object payload) {
        String host = getHost(config);
        int port = getPort(config, 22);
        String username = (String) config.get("username");
        String authType = (String) config.getOrDefault("authType", "PASSWORD");
        String password = (String) config.get("password");
        String privateKeyPath = (String) config.get("privateKeyPath");
        String privateKeyContent = (String) config.get("privateKey");
        
        // 프론트엔드에서 파일로 올린 경우 처리
        Object privateKeyFileObj = config.get("privateKeyFile");
        if (privateKeyFileObj instanceof Map) {
            String base64Key = (String) ((Map<?, ?>) privateKeyFileObj).get("content");
            if (base64Key != null) {
                privateKeyContent = new String(Base64.getDecoder().decode(base64Key), StandardCharsets.UTF_8);
            }
        }
        
        String remoteDir = (String) config.getOrDefault("remoteDir", "/");
        String fileName = (String) config.getOrDefault("fileName", "data_" + System.currentTimeMillis() + ".txt");

        JSch jsch = new JSch();
        Session session = null;
        ChannelSftp sftp = null;

        try {
            if ("SSH_KEY".equalsIgnoreCase(authType)) {
                if (privateKeyContent != null && !privateKeyContent.trim().isEmpty()) {
                    jsch.addIdentity("key", privateKeyContent.getBytes(StandardCharsets.UTF_8), null, null);
                } else if (privateKeyPath != null && !privateKeyPath.trim().isEmpty()) {
                    jsch.addIdentity(privateKeyPath);
                } else {
                    throw new IllegalArgumentException("SSH Key content or path is required for SSH_KEY auth");
                }
            }

            session = jsch.getSession(username, host, port);
            
            if ("PASSWORD".equalsIgnoreCase(authType)) {
                session.setPassword(password);
            }

            Properties props = new Properties();
            props.put("StrictHostKeyChecking", "no");
            session.setConfig(props);
            session.connect();

            sftp = (ChannelSftp) session.openChannel("sftp");
            sftp.connect();

            if ("UPLOAD".equalsIgnoreCase(mode)) {
                byte[] bytes = getUploadBytes(payload);
                try (InputStream is = new ByteArrayInputStream(bytes)) {
                    sftp.cd(remoteDir);
                    sftp.put(is, fileName);
                }
                return "SFTP Upload Successful: " + fileName;
            } else {
                // Download: 브라우저에서 다운로드 받을 수 있도록 Base64로 리턴
                sftp.cd(remoteDir);
                try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
                    sftp.get(fileName, os);
                    
                    Map<String, String> result = new HashMap<>();
                    result.put("fileName", fileName);
                    result.put("content", Base64.getEncoder().encodeToString(os.toByteArray()));
                    result.put("type", "file");
                    return result;
                }
            }

        } catch (JSchException | SftpException | IOException e) {
            log.error("SFTP failed: {}", e.getMessage());
            throw new RuntimeException("SFTP operation failed: " + e.getMessage(), e);
        } finally {
            if (sftp != null && sftp.isConnected()) sftp.disconnect();
            if (session != null && session.isConnected()) session.disconnect();
        }
    }
}
