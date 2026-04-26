# FIMS 프로토타입 실행 가이드

FIMS(Financial Interface Management System) 프로토타입을 로컬 환경에서 실행하는 방법입니다. 본 프로젝트는 백엔드(Spring Boot)와 프론트엔드(React)로 구성되어 있습니다.

## 1. 사전 요구 사항
- **Java 17+** (Backend)
- **Node.js 18+ & npm** (Frontend)
- **Gradle** (프로젝트 내 래퍼 사용)

## 2. 백엔드 실행
1. 프로젝트 루트에서 백엔드 디렉토리로 이동합니다.
   ```bash
   cd app/backend
   ```
2. 애플리케이션을 빌드 및 실행합니다.
   ```bash
   ./gradlew bootRun
   ```
   - 서버는 기본적으로 `http://localhost:8080`에서 실행됩니다.

## 3. 프론트엔드 실행
1. 별도의 터미널을 열고 프론트엔드 디렉토리로 이동합니다.
   ```bash
   cd app/frontend
   ```
2. 필요한 패키지를 설치합니다.
   ```bash
   npm install
   ```
3. 개발 서버를 실행합니다.
   ```bash
   npm run dev
   ```
   - 프론트엔드 애플리케이션은 기본적으로 `http://localhost:5173`에서 실행됩니다.
   - 브라우저를 열어 해당 주소로 접속하십시오.

## 4. 참고 사항
- **API 서버 주소**: 프론트엔드는 백엔드 API를 `http://localhost:8080`에서 호출하도록 설정되어 있습니다. (CORS 허용됨)
- **로그 확인**: 백엔드 콘솔이나 관리 콘솔의 '로그 조회' 메뉴를 통해 실시간 처리를 모니터링할 수 있습니다.
