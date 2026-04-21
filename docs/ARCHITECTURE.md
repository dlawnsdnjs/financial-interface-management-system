# FIMS 시스템 아키텍처 설계서 (Architecture Design)

## 1. 시스템 개요
본 시스템은 다양한 외부 기관 및 내부 시스템 간의 인터페이스를 통합 제어하기 위한 중앙 관리형 아키텍처를 채택합니다.

## 2. 기술 스택 (Technology Stack)

### 2.1 Backend (Java Spring Boot)
- **Framework**: Spring Boot 3.x
- **Build Tool**: Gradle (or Maven)
- **Language**: Java 17+
- **Database Layer**: Spring Data JPA (Hibernate)
- **Security**: Spring Security (JWT / Role-based access)
- **Communication**:
    - **REST**: Spring WebClient
    - **SOAP**: Spring-WS (Apache CXF)
    - **MQ**: Spring JMS (RabbitMQ Simulation)
    - **SFTP**: Apache Commons Net / JSch
- **Batch Processing**: Spring Batch 5.x

### 2.2 Frontend (React)
- **Language**: TypeScript
- **State Management**: Context API / React Query
- **Styling**: Tailwind CSS & Shadcn UI
- **Visualization**: Recharts (Dashboard)

## 3. 핵심 컴포넌트 설계

### 3.1 Interface Manager (Core)
- 인터페이스 메타데이터(설정 정보, URL, 인증 정보)의 CRUD를 담당.
- 실행 상태 및 스케줄링(Quartz/Cron) 관리.

### 3.2 Protocol Connectors (Worker)
- 각 프로토콜별 통신 규약 처리.
- **REST Connector**: HTTP 요청 및 에러 코드 처리.
- **SOAP Connector**: WSDL 관리 및 XML Marshalling.
- **SFTP Connector**: 파일 전송, 체크섬 확인 및 보안 연결 관리.
- **MQ Connector**: 메시지 발행 및 구독, 유실 방지(Ack).

### 3.3 Log & Monitoring Provider
- 모든 트랜잭션의 Payload 로깅 및 개인정보 마스킹.
- 통계 데이터(TPS, 응답 시간) 실시간 집계.

## 4. 데이터베이스 설계 (ERD 개요)

### 4.1 TB_INTERFACE (인터페이스 마스터)
- `INTF_ID` (PK): 인터페이스 식별자
- `INTF_NAME`: 인터페이스 명칭
- `PROT_TYPE`: 프로토콜 타입 (REST, SOAP, MQ, BATCH, SFTP)
- `END_POINT`: URL 또는 접속 정보
- `AUTH_INFO`: 인증 토큰 또는 ID/PW (암호화 저장)
- `STATUS`: 활성/비활성 상태

### 4.2 TB_TRANS_LOG (트랜잭션 실행 로그)
- `TRANS_ID` (PK): 트랜잭션 고유 번호
- `INTF_ID` (FK): 인터페이스 ID
- `START_TIME`: 실행 시작 시각
- `END_TIME`: 실행 종료 시각
- `RESULT_CODE`: 성공/실패 코드 (S, F, E)
- `ERROR_MSG`: 에러 발생 시 상세 메시지

### 4.3 TB_PAYLOAD_LOG (전문 로그)
- `TRANS_ID` (FK): 트랜잭션 ID
- `REQ_DATA`: 요청 전문 (마스킹 처리됨)
- `RES_DATA`: 응답 전문 (마스킹 처리됨)

## 5. 보안 설계 (Security Design)
- **개인정보 보호**: 주민번호, 카드번호 등의 패턴을 감지하여 로그 저장 전 정규표현식으로 마스킹.
- **네트워크 보안**: 대외 기관 연동 시 TLS 1.2+ 통신 강제.
- **인증/인가**: API 서버 접근 시 JWT 기반 인증 및 관리자 권한 체크.
