# FIMS 시스템 API 명세서 (API Specification)

## 1. 개요
본 문서는 FIMS 관리자 포털(Frontend)과 관리 서버(Backend) 간의 REST API 규격을 정의합니다.

- **기본 URL**: `/api`
- **인증**: Header `Authorization: Bearer <JWT_TOKEN>`

## 2. 인터페이스 관리 API (`/api/interfaces`)

### 2.1 인터페이스 목록 조회
- **엔드포인트**: `GET /api/interfaces`
- **응답**: `List<InterfaceEntity>`

### 2.2 인터페이스 상세 정보 조회
- **엔드포인트**: `GET /api/interfaces/{id}`

### 2.3 인터페이스 등록
- **엔드포인트**: `POST /api/interfaces`
- **본문(Body)**: `InterfaceEntity` 객체

### 2.4 인터페이스 정보 수정
- **엔드포인트**: `PUT /api/interfaces/{id}`
- **본문(Body)**: `InterfaceEntity` 객체

### 2.5 인터페이스 삭제
- **엔드포인트**: `DELETE /api/interfaces/{id}`

### 2.6 인터페이스 즉시 실행
- **엔드포인트**: `POST /api/interfaces/{id}/execute`
- **본문(Body)**: `Object payload` (프로토콜별 설정)

### 2.7 인터페이스 일괄 실행
- **엔드포인트**: `POST /api/interfaces/execute-bulk`
- **본문(Body)**: `List<Long> ids`

### 2.8 FTP 파일 목록 조회
- **엔드포인트**: `POST /api/interfaces/ftp/list`
- **본문(Body)**: `Map<String, Object> request` (config, remotePath 포함)

## 3. 모니터링 API (`/api/monitor`)

### 3.1 인터페이스별 로그 조회
- **엔드포인트**: `GET /api/monitor/logs/{interfaceId}`
- **응답**: `List<MessageLogEntity>`

### 3.2 통계 정보 조회
- **엔드포인트**: `GET /api/monitor/stats/{interfaceId}`
- **응답**: `Map<String, Object>` (SUCCESS, FAIL 카운트, 평균 수행 시간)

### 3.3 최근 로그 목록 조회
- **엔드포인트**: `GET /api/monitor/recent-logs`

### 3.4 실패 로그 재처리
- **엔드포인트**: `POST /api/monitor/retry/{logId}`

## 4. 공통 에러 응답
```json
{
  "status": 500,
  "message": "Error details..."
}
```
