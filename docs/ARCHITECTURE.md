# FIMS 시스템 아키텍처 및 상세 설계서

## 1. 개요
FIMS(Financial Interface Management System)는 다양한 외부 기관 및 내부 시스템 간의 인터페이스를 통합 제어하기 위한 중앙 관리형 시스템입니다.

## 2. 기술 스택
- **Backend**: Spring Boot 3.2.4 (Java 17)
- **Data Layer**: JPA/Hibernate, H2 (인메모리)
- **Batch**: Spring Batch 5.x
- **Frontend**: React (TypeScript), Tailwind CSS

## 3. 핵심 시스템 아키텍처

### 3.1 Interface Engine (Service Layer)
- `InterfaceService`: 프로토콜 핸들러의 전략 패턴(Strategy Pattern)을 사용하여 유연한 프로토콜 확장을 지원합니다.
- `ProtocolHandler`: 인터페이스별 고유 로직을 캡슐화하는 인터페이스. 구현체로는 `Batch`, `File`, `MQ`, `Rest`, `Soap` 등이 있습니다.

### 3.2 Batch Engine (Spring Batch)
- `SettlementJob`: 정산 데이터를 위한 Spring Batch Job 구현.
- `Chunk-oriented processing`: `SettlementItemReader` (CSV 읽기), `SettlementItemProcessor` (데이터 검증/변환/마스킹), `SettlementItemWriter` (DB 적재)로 구성됩니다.
- **동적 파라미터**: Job 실행 시점에 `targetDate`, `inputFilePath` 등을 주입받아 유연하게 동작합니다.

## 4. 데이터베이스 설계 (Entity)

### 4.1 TB_INTERFACE
- 인터페이스 등록 관리. `protocolConfig`(JSON)와 `defaultArguments`(JSON)를 통해 프로토콜별 설정 저장.

### 4.2 TB_TRANS_LOG (MessageLogEntity)
- 트랜잭션 수행 결과를 기록하는 로그 테이블. 상태값(SUCCESS/FAIL) 및 수행 시간(ms) 저장.

### 4.3 TB_SETTLEMENT
- 정산 데이터 적재 테이블. 배치를 통해 대량으로 적재됩니다.

## 5. API 상세 설계

### 5.1 인터페이스 제어
- `GET /api/interfaces`: 목록 조회
- `POST /api/interfaces`: 등록
- `PUT /api/interfaces/{id}`: 수정
- `POST /api/interfaces/{id}/execute`: 단일 실행
- `POST /api/interfaces/execute-bulk`: 일괄 실행 (비동기 병렬 처리)

### 5.2 모니터링
- `GET /api/monitor/logs/{id}`: 인터페이스 상세 로그 목록
- `GET /api/monitor/stats/{id}`: 인터페이스별 성공/실패/평균속도 통계
- `POST /api/monitor/retry/{logId}`: 실패 트랜잭션 재처리
