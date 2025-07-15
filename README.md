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

### 3. 데이터베이스 스키마 마이그레이션 파일 생성

프로젝트의 데이터베이스 스키마(`src/infrastructure/db/schema.ts`)가 변경될 때마다, 아래 명령어를 실행하여 마이그레이션 파일을 생성해야 합니다.

```bash
# .dev.vars에 Cloudflare 정보가 설정되어 있어야 합니다.
npx drizzle-kit generate
```
이 명령어는 `drizzle` 디렉토리에 SQL 마이그��이션 파일을 생성합니다.

### 4. 로컬 데이터베이스에 스키마 적용

생성된 마이그레이션 파일을 로컬 D1 데이터베이스에 적용합니다.

```bash
npx wrangler d1 migrations apply hono-db --local
```

### 5. 로컬 개발 서버 실행

```bash
npm run dev
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