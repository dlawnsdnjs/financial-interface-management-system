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

    private final LoggingService loggingService;

    public FileProtocolHandler(LoggingService loggingService) {
        this.loggingService = loggingService;
    }

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
        
        long startTime = System.currentTimeMillis();
        try {
            Object result;
            if ("FTP".equalsIgnoreCase(protocol)) {
                result = executeFtp(config, mode, payload);
            } else {
                result = executeSftp(config, mode, payload);
            }
            long duration = System.currentTimeMillis() - startTime;
            loggingService.log(entity.getId(), "FILE", "Mode: " + mode, "SUCCESS", null, "Operation completed", duration);
            return result;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            loggingService.log(entity.getId(), "FILE", "Mode: " + mode, "FAIL", e.getMessage(), null, duration);
            throw e;
        }
    }

    private byte[] getUploadBytes(Object payload) {
        if (payload == null) return new byte[0];
        
        // payload에서 content를 추출
        byte[] content = extractContent(payload);
        if (content != null) return content;
        
        log.info("getUploadBytes: No content found in payload structure");
        return new byte[0];
    }

    private byte[] extractContent(Object payload) {
        if (payload == null) return null;
        
        Map<String, Object> map = (payload instanceof Map) ? (Map<String, Object>) payload : new HashMap<>();
        
        // 1. Check for nested 'file' -> 'content'
        Object fileObj = map.get("file");
        if (fileObj instanceof Map) {
            Object content = ((Map<?, ?>) fileObj).get("content");
            if (content != null) return decodeOrGetBytes(content.toString());
        }
        
        // 2. Check for direct 'content'
        if (map.containsKey("content") && map.get("content") != null) {
            return decodeOrGetBytes(map.get("content").toString());
        }
        
        return null;
    }

    private byte[] decodeOrGetBytes(String content) {
        try {
            return Base64.getDecoder().decode(content);
        } catch (IllegalArgumentException e) {
            log.debug("Content not Base64 encoded, treating as raw string.");
            return content.getBytes(StandardCharsets.UTF_8);
        }
    }

    private Object findNestedKey(Map<String, Object> map, String key) {
        if (map.containsKey(key)) return map.get(key);
        for (Object value : map.values()) {
            if (value instanceof Map) {
                Object found = findNestedKey((Map<String, Object>) value, key);
                if (found != null) return found;
            }
        }
        return null;
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
