# Hono-Vibe: JWT 인증 백엔드

Hono-Vibe는 [Hono](https://hono.dev/) 프레임워크와 [Cloudflare D1](https://developers.cloudflare.com/d1/)을 기반으로 구축된, JWT 기반 인증/인가 시스템을 제공하는 백엔드 프로젝트입니다. TDD/DDD 원칙을 준수하여 높은 수준의 코드 품질과 유지보수성을 지향합니다.

## ✨ 주요 기능

-   **사용자 인증:**
    -   회원가입 (`/api/auth/register`)
    -   로그인 (`/api/auth/login`)
    -   로그아웃 (`/api/auth/logout`)
-   **JWT 기반 세션 관리:**
    -   Access Token 및 Refresh Token 발급
    -   Refresh Token을 이용한 Access Token 갱신 (`/api/auth/refresh`)
-   **인가 (Authorization):**
    -   Role(역할) 기반 접근 제어 미들웨어 (예: 'admin'만 접근 가능한 경로 보호)
-   **사용자 정보:**
    -   인증된 사용자 정보 조회 (`/api/users/me`)

## 🛠️ 주요 기술 스택

-   **웹 프레임워크:** [Hono](https://hono.dev/)
-   **데이터베이스:** [Cloudflare D1](https://developers.cloudflare.com/d1/)
-   **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
-   **테스트:** [Vitest](https://vitest.dev/)
-   **배포:** [Cloudflare Workers](https://workers.cloudflare.com/)
-   **언어:** TypeScript

## 🚀 시작하기

### 1. 프로젝트 복제 및 의존성 설치

```bash
git clone https://github.com/Sharknia/hono-vibe.git
cd hono-vibe
npm install
```

### 2. 환경 변수 설정

`.dev.vars.example` 파일을 복사하여 `.dev.vars` 파일을 생성하고, 내부의 값들을 실제 환경에 맞게 수정합니다.

```bash
cp .dev.vars.example .dev.vars
```

**필수 환경 변수:**

-   `JWT_ACCESS_SECRET`: JWT Access Token 서명에 사용할 시크릿 키
-   `JWT_REFRESH_SECRET`: JWT Refresh Token 서명에 사용할 시크릿 키

**Drizzle Kit 사용 시 필요한 환경 변수:**

-   `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 계정 ID
-   `CLOUDFLARE_DATABASE_ID`: `wrangler.toml`에 명시된 D1 데이터베이스 ID
-   `CLOUDFLARE_D1_API_TOKEN`: D1에 접근할 수 있는 API 토큰

### 3. 데이터베이스 마이그레이션

스키마(`src/infrastructure/db/schema.ts`) 변경 후, 마이그레이션 파일을 먼저 생성해야 합니다.

```bash
# .dev.vars에 Cloudflare 정보가 설정되어 있어야 합니다.
npx drizzle-kit generate
```

생성된 마이그레이션 파일은 다음 명령어를 통해 데이터베이스에 적용할 수 있습니다.

**로컬 DB (개발용)**

```bash
# 로컬 D1 에뮬레이션 DB에 스키마를 적용합니다.
npx wrangler d1 migrations apply hono_db --local
```

**원격 DB (프로덕션용)**

```bash
# 실제 Cloudflare D1 프로덕션 DB에 스키마를 적용합니다.
npx wrangler d1 migrations apply hono_db --remote
```

### 4. 개발 서버 실행

**로컬 DB 연결 (기본값)**

```bash
# .wrangler/ 폴더에 생성된 로컬 DB를 사용하여 서버를 실행합니다.
npm run dev -- --port 8787
```

**원격 DB 연결**

```bash
# 실제 Cloudflare D1 프로덕션 DB에 연결하여 서버를 실행합니다.
# 주의: 프로덕션 데이터에 직접 영향을 줄 수 있습니다.
npm run dev --remote
```

서버가 시작되면 `http://localhost:8787` 주소로 API 요청을 보낼 수 있습니다.

## ✅ 자동화 테스트 실행

프로젝트의 모든 테스트를 실행하여 코드의 안정성을 검증합니다.

```bash
npm test
```

테스트는 인메모리 SQLite 데이터베이스를 사용하여 실행되므로, 외부 환경에 영향을 주지 않습니다.

## 📖 API 엔드포인트

-   `POST /api/auth/register`: 사용자 회원가입
-   `POST /api/auth/login`: 로그인 (Access/Refresh Token 발급)
-   `POST /api/auth/logout`: 로그아웃 (Refresh Token 무효화)
-   `POST /api/auth/refresh`: Access Token 갱신
-   `GET /api/users/me`: 현재 로그인된 사용자 정보 조회
-   `GET /api/admin`: (Admin 전용) 관리자 권한 테스트
-   `GET /health`: 서버 상태 확인
-

## 프로젝트 구조

이 프로젝트는 DDD(도메인 주도 설계)의 계층형 아키텍처를 따릅니다. 각 디렉토리의 역할은 다음과 같습니다.

-   `src`: 모든 소스 코드가 위치하는 최상위 디렉토리입니다.
    -   `presentation`: 외부 세계와의 상호작용을 담당합니다. (예: API 엔드포인트, 미들웨어)
        -   `routes`: Hono 라우터를 정의하고 특정 경로에 대한 요청을 처리합니다.
        -   `middlewares`: DI 컨테이너 설정, 인증 처리 등 요청/응답 사이클에 필요한 미들웨어를 정의합니다.
    -   `application`: 사용자의 유스케이스를 구현합니다. 도메인 객체를 사용하여 비즈니스 로직을 조정(orchestrate)합니다.
        -   `services`: 특정 비즈니스 로직을 수행하는 서비스 클래스를 포함합니다. (예: `AuthService`)
    -   `domain`: 핵심 비즈니스 로직과 도메인 모델이 위치합니다. 다른 계층에 대한 의존성이 없습니다.
        -   `users`: 사용자 도메인과 관련된 엔티티, 리포지토리 인터페이스 등을 정의합니다.
            -   `user.entity.ts`: 사용�� 도메인 객체(Entity)를 정의합니다.
            -   `user.repository.ts`: 사용자 데이터에 접근하기 위한 리포지토리의 인터페이스를 정의합니다.
    -   `infrastructure`: 데이터베이스, 외부 API 연동 등 기술적인 세부사항을 구현합니다. Domain 계층의 인터페이스를 구현합니다.
        -   `db`: Drizzle ORM 스키마 및 데이터베이스 연결 설정을 포함합니다.
        -   `repositories`: Domain 계층에 정의된 리포지토리 인터페이스의 실제 구현체를 작성합니다. (예: `DrizzleUserRepository`)
-   `test`: 모든 테스트 코드가 위치합니다. `src` 디렉토리 구조를 미러링하여 각 기능별 테스트를 작성합니다.
-   `drizzle.config.ts`: Drizzle ORM의 설정 파일입니다.
-   `wrangler.toml`: Cloudflare Workers의 설정 파일입니다. 로컬 개발 및 배포에 사용됩니다.
