# 시스템 설계: 통합 프로토콜 인터페이스 관리 플랫폼 (FIMS v2)

## 1. 개요
다양한 외부 프로토콜(SOAP, SFTP, MQ, REST)을 하나의 환경에서 일관되게 관리하고, 프로토콜별로 최적화된 설정을 제공하는 동적 인터페이스 관리 플랫폼.

## 2. 도메인 모델링
- **InterfaceEntity**: 공통 메타데이터 (ID, 이름, 설명, 프로토콜 유형, 활성 상태).
- **ProtocolConfig**: 프로토콜별 상세 설정 (JSON으로 저장하거나 별도 엔티티로 관리 - 확장성 고려).
- **ExecutionLog**: 호출 이력 및 상태 관리.

## 3. 기술 스택 및 구조
- **Backend**: Spring Boot 3.x, Spring Data JPA.
- **Frontend**: React 18, TypeScript, TailwindCSS.
- **Architecture**:
  - **Adapter Pattern**: `ProtocolHandler` 인터페이스 기반의 프로토콜별 구현체.
  - **Dynamic Form**: 프로토콜별 JSON Schema를 정의하여 UI를 자동 생성.

## 4. 데이터베이스 전략
- 상세 설정 데이터는 확장성을 위해 별도 테이블 구조 또는 JSONB 타입(H2/PostgreSQL 지원 시) 사용.

## 5. 단계별 리팩토링/구현 계획
1.  기초 프로젝트 구조 생성.
2.  공통 엔티티 및 API 정의.
3.  프로토콜별 어댑터 구현체 구조 설계.
4.  프론트엔드 동적 폼 엔진 구현.
5.  기능 마이그레이션 및 기존 코드 완전 삭제.
