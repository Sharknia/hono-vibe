## 1. 개발 원칙 (Gemini-CLI 준수 사항)

**이 프로젝트는 아래 원칙을 반드시 따릅니다.**

1.  **엄격한 DDD(Domain-Driven Design) 준수:**
    - 각 계층(Presentation, Application, Domain, Infrastructure)의 역할을 명확히 분리하고, 의존성 방향을 엄격히 지킵니다.
    - 도메인 로직은 Domain 계층에만 존재해야 하며, 다른 계층은 이를 오염시키지 않습니다.

2.  **엄격한 TDD(Test-Driven Development):**
    - 새로운 기능을 추가하거나 버그를 수정할 때는 항상 실패하는 테스트를 먼저 작성하고, 이를 통과시키는 코드를 작성합니다.
    - 모든 비즈니스 로직과 주요 경로는 반드시 테스트 코드로 커버되어야 합니다.

3.  **꼼수 금지 (No Workarounds & Hacks):**
    - 임시방편적인 해결책이나 "나중에 수정할" 주석을 남기지 않습니다.
    - 문제의 근본 원인을 파악하고, 아키텍처 원칙에 맞는 올바른 해결책을 적용합니다.

4.  **DB 환경 분리 원칙:**
    - **자동화 테스트 (`vitest`):** 속도와 격리를 위해 **인메모리 SQLite (`better-sqlite3`)**를 사용합니다.
    - **로컬 개발 (`wrangler dev`):** 프로��션 환경과 동일한 경험을 위해 **Cloudflare D1의 로컬 에뮬레이션**을 사용합니다.
    - **마이그레이션 (`drizzle-kit`):** `npx drizzle-kit generate` 실행 시, `.dev.vars`에 설정된 Cloudflare API/DB 정보를 사용하여 D1 스키마와 동기화된 마이그레이션 파일을 생성합니다.

5.  **Git 워크플로우 준수:**
    - 각 주요 단계(Stage)가 완료되고 모든 테스트가 통과하면, 변경사항을 `dev` 브랜치에 커밋하고 푸시합니다.
    - 커밋 메시지는 명확하고 일관된 스타일을 유지합니다.

6.  **지속적인 진행 상황 체크 및 문서 최신화:**
    - `GEMINI_GUIDE.md`의 체크리스트를 꾸준히 업데이트하여 현재 진행 상황을 명확히 파악합니다.
    - 변경 사항이 발생하면 관련 문서(`README.md` 등)도 함께 업데이트합니다.

7.  **콘텐츠 변경 시 주의:** 
    - 파일 수정 시, 특히 Gemini-CLI를 사용할 때, 기존 내용이 의도치 않게 생략되거나 삭제되지 않도록 주의한다. 변경 전후 내용을 반드시 확인하고, Git을 통해 작업 내용을 안전하게 관리한다.

---

## 2. 프로젝트 구조

이 프로젝트는 DDD(도메인 주도 설계)의 계층형 아키텍처를 따릅니다. 각 디렉토리의 역할은 다음과 같습니다.

-   `src`: 모든 소스 코드가 위치하는 최상위 디렉토리입니다.
    -   `presentation`: 외부 세계와의 상호작용을 담당합니다. (예: API 엔드포인트, 미들웨어)
        -   `routes`: Hono 라우터를 정의하고 특정 경로에 대한 요청을 처리합니다.
        -   `middlewares`: DI 컨테이너 설정, 인증 처리 등 요청/응답 사이클에 필요한 미들웨어를 정의합니다.
    -   `application`: 사용자의 유스케이스를 구현합니다. 도메인 객체를 사용하여 비즈니스 로직을 조정(orchestrate)합니다.
        -   `services`: 특정 비즈니스 로직을 수행하는 서비스 클래스를 포함합니다. (예: `AuthService`)
    -   `domain`: 핵심 비즈니스 로직과 도메인 모델이 위치합니다. 다른 계층에 대한 의존성이 없습니다.
        -   `users`: 사용자 도메인과 관련된 엔티티, 리포지토리 인터페이스 등을 정의합니다.
            -   `user.entity.ts`: 사용자 도메인 객체(Entity)를 정의합니다.
            -   `user.repository.ts`: 사용자 데이터에 접근하기 위한 리포지토리의 인터페이스를 정의합니다.
    -   `infrastructure`: 데이터베이스, 외부 API 연동 등 기술적인 세부사항을 구현합니다. Domain 계층의 인터페이스를 구현��니다.
        -   `db`: Drizzle ORM 스키마 및 데이터베이스 연결 설정을 포함합니다.
        -   `repositories`: Domain 계층에 정의된 리포지토리 인터페이스의 실제 구현체를 작성합니다. (예: `DrizzleUserRepository`)
-   `test`: 모든 테스트 코드가 위치합니다. `src` 디렉토리 구조를 미러링하여 각 기능별 테스트를 작성합니다.
-   `drizzle.config.ts`: Drizzle ORM의 설정 파일입니다.
-   `wrangler.toml`: Cloudflare Workers의 설정 파일입니다. 로컬 개발 및 배포에 사용됩니다.

---

## 3. 개발 계획 및 체크리스트 (To-Do List)

### ✅ Stage 1, 2, 3, 3.7: 환경 설정, 리팩토링 및 서버 정상화
- [x] TDD/DDD 환경 구축 및 헬스체크 API 구현 완료
- [x] 아키텍처 위반 수정 및 환경 변수 적용 완료
- [x] 로컬 개발 서버 실행 문제 해결 및 DB 환경 분리 완료

### ✅ Stage 4: 핵심 인증/인가 기능 구현 (TDD + DDD)
- [x] **토큰 리프레시 기능 (`POST /api/auth/refresh`)**
- [x] **로그아웃 기능 (`POST /api/auth/logout`)**
- [x] **권한(Role) 기반 접근 제어 미들웨어**
    - [x] 테스트 작성
    - [x] 로직 구현 및 테스트 통과

### 🔲 Stage 5: 아키텍처 리팩토링 (TDD)
- [x] **Task 1: 커스텀 에러 처리 시스템 도입**
    - [x] Sub-task 1.1: 커스텀 에러 및 에러 핸들러 미들웨어 테스트 작성
    - [x] Sub-task 1.2: `HttpError` 등 커스텀 에러 클래스 정의 (`src/domain/errors.ts`)
    - [x] Sub-task 1.3: 커스텀 에러를 처리하는 Hono 에러 핸들러 미들웨어 구현 (`src/presentation/middlewares/error.middleware.ts`)
    - [x] Sub-task 1.4: 에러 핸들러를 최상위 앱에 적용 (`src/index.ts`)
    - [x] Sub-task 1.5: 테스트 통과 확인 및 커밋/푸시
- [x] **Task 2: `AuthService` 리팩토링**
    - [x] Sub-task 2.1: `AuthService`가 커스텀 에러를 던지도록 테스트 코드 수정
    - [x] Sub-task 2.2: `AuthService`가 `ServiceResponse` 대신 성공 시 데이터, 실패 시 커스텀 에러를 던지도록 수정
    - [x] Sub-task 2.3: 테스트 통과 확인 및 커밋/푸시
- [ ] **Task 3: `auth.routes.ts` 리팩토링**
    - [ ] Sub-task 3.1: 에러 핸들러 미들웨어 적용에 맞춰 통합 테스트 코드 수정
    - [ ] Sub-task 3.2: `auth.routes.ts`에서 `ServiceResponse` 분기 처리 로직 ��거
    - [ ] Sub-task 3.3: 테스트 통과 확인 및 커밋/푸시

### 🔲 Stage 6: 최종 정리 및 문서화
- [ ] 전체 코드 리뷰 및 리팩토링 (2차)
- [ ] `README.md` 및 `GEMINI_GUIDE.md` 최종 검토 및 업데이트
- [ ] **(완료 후)** `dev` 브랜치에 커밋 및 푸시
