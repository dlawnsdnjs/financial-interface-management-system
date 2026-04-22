# FIMS 시스템 API 명세서 (API Specification)

## 1. 개요
본 문서는 FIMS 관리자 포털(Frontend)과 관리 서버(Backend) 간의 REST API 규격을 정의합니다.

- **Base URL**: `/api/v1`
- **Auth**: Header `Authorization: Bearer <JWT_TOKEN>`

## 2. 인터페이스 관리 API

### 2.1 인터페이스 목록 조회
- **Endpoint**: `GET /interfaces`
- **Response**:
    ```json
    [
      {
        "intfId": "INTF-001",
        "intfName": "금감원 대외비 연동",
        "protType": "REST",
        "status": "ACTIVE",
        "updatedAt": "2024-04-21T10:00:00Z"
      }
    ]
    ```

### 2.2 인터페이스 상세 정보 등록
- **Endpoint**: `POST /interfaces`
- **Body**:
    ```json
    {
      "intfName": "정산 데이터 SFTP 전송",
      "protType": "SFTP",
      "endPoint": "sftp.partner.com:22",
      "authInfo": { "id": "admin", "pw": "encrypted_pw" },
      "config": { "path": "/upload/settlement" }
    }
    ```

### 2.3 인터페이스 정보 수정
- **Endpoint**: `PUT /interfaces/{intfId}`
- **Body**: 인터페이스 전체 객체
- **Response**: 수정된 인터페이스 객체

### 2.4 인터페이스 즉시 실행 (Manual Execution)
- **Endpoint**: `POST /interfaces/{intfId}/execute`
- **Description**: 특정 인터페이스를 즉각 실행하고 결과를 반환받음.
- **Response**:
    ```json
    {
      "transId": "uuid-string",
      "status": "SUCCESS",
      "intfId": "INTF-001",
      "msg": "Execution Completed",
      "payload": "실제 수신된 데이터 또는 마스킹된 데이터",
      "latency": "120ms"
    }
    ```

## 3. 모니터링 및 로그 API

### 3.1 대시보드 통계 조회
- **Endpoint**: `GET /monitoring/dashboard`
- **Response**:
    ```json
    {
      "totalIntf": 120,
      "successRate": 98.5,
      "currentTPS": 45,
      "errorCount": 2,
      "recentErrors": [
        { "intfId": "INTF-002", "errorTime": "2024-04-21T11:05:00Z", "msg": "Connection Timeout" }
      ]
    }
    ```

### 3.2 트랜잭션 로그 목록 조회
- **Endpoint**: `GET /monitoring/logs`
- **Query Params**: `intfId`, `status`, `startDate`, `endDate`
- **Response**:
    ```json
    {
      "logs": [
        {
          "transId": "TR-10042",
          "intfId": "INTF-001",
          "startTime": "2024-04-21T11:00:00Z",
          "status": "FAIL",
          "resultCode": "E-404"
        }
      ],
      "totalCount": 540
    }
    ```

### 3.3 실패 건 재처리 (Retry)
- **Endpoint**: `POST /monitoring/logs/{transId}/retry`
- **Description**: 실패한 트랜잭션의 원본 페이로드를 사용하여 재전송을 시도함.

## 4. 공통 에러 응답
```json
{
  "errorCode": "FIMS-4001",
  "message": "인터페이스 엔드포인트에 접속할 수 없습니다.",
  "timestamp": "2024-04-21T11:06:00Z"
}
```
