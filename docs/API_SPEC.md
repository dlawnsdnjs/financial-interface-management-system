# FIMS 시스템 API 명세서 (API Specification)

## 1. 개요
본 문서는 FIMS 관리자 포털(Frontend)과 관리 서버(Backend) 간의 REST API 규격을 정의합니다.

- **기본 URL**: `/api`
- **인증**: 현재 시스템은 프로토타입 단계로, **실제 인증 및 인가 절차는 구현되지 않은 상태**입니다.

## 2. 공통 에러 응답 및 오류 코드

### 2.1 에러 응답 구조
```json
{
  "errorCode": "FIMS-5000",
  "message": "서버 내부 처리 오류",
  "timestamp": "2026-04-26T00:00:00Z",
  "path": "/api/interfaces/999"
}
```

## 3. 인터페이스 관리 API (`/api/interfaces`)

### 3.1 인터페이스 목록 조회
- **엔드포인트**: `GET /api/interfaces`
- **상태코드**: 200
- **응답 예시**: `[ { "id": 1, "name": "정산 연동", "protocolType": "BATCH", "enabled": true } ]`

### 3.2 인터페이스 등록
- **엔드포인트**: `POST /api/interfaces`
- **상태코드**: 200
- **요청 본문(Body)**:
```json
{
  "name": "정산 배치",
  "protocolType": "BATCH",
  "description": "정산 데이터 처리",
  "enabled": true,
  "protocolConfig": { "jobName": "SettlementJob" }
}
```

### 3.3 인터페이스 수정
- **엔드포인트**: `PUT /api/interfaces/{id}`
- **상태코드**: 200, 404
- **요청 본문(Body)**: `InterfaceEntity` 객체

### 3.4 인터페이스 즉시 실행
- **엔드포인트**: `GET /api/interfaces/{id}/execute`
- **설명**: 인터페이스 실행 작업을 트리거합니다.
- **상태코드**: 200, 404, 500

### 3.5 인터페이스 일괄 실행
- **엔드포인트**: `POST /api/interfaces/execute-bulk`
- **설명**: 여러 인터페이스를 선택하여 순차적으로 배치 실행합니다.
- **상태코드**: 200, 400, 500
- **요청 본문(Body)**: `[1, 2, 3]` (인터페이스 ID 리스트)

### 3.6 FTP 파일 목록 조회
- **엔드포인트**: `POST /api/interfaces/ftp/list`
- **설명**: 접속 설정 및 경로 정보(민감 정보 포함)를 포함해야 하므로 POST 사용.
- **상태코드**: 200, 400, 500
- **요청 본문(Body)**: `{"config": {"host": "...", "username": "..."}, "remotePath": "/"}`

---

## 4. 모니터링 API (`/api/monitor`)

### 4.1 인터페이스별 로그 조회
- **엔드포인트**: `GET /api/monitor/logs/{interfaceId}`
- **상태코드**: 200

### 4.2 통계 정보 조회
- **엔드포인트**: `GET /api/monitor/stats/{interfaceId}`
- **상태코드**: 200
- **응답 예시**:
```json
{ "SUCCESS": 10, "FAIL": 1, "AVG_TIME": 150.5 }
```

### 4.3 최근 로그 목록 조회
- **엔드포인트**: `GET /api/monitor/recent-logs`
- **상태코드**: 200

### 4.4 실패 로그 재처리
- **엔드포인트**: `POST /api/monitor/retry/{logId}`
- **상태코드**: 200, 500
