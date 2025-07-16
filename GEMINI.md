# Hono Vibe API: The Gemini Onboarding Guide

이 문서는 새로운 Gemini 에이전트가 Hono Vibe API 프로젝트의 아키텍처, 핵심 패턴, 개발 워크플로우를 빠르게 이해하고, 기존 개발자와 동일한 컨텍스트와 일관성을 가지고 유지보수 및 기능 개발에 기여할 수 있도록 돕는 것을 목표로 합니다.

---

## 1. 프로젝트 철학과 핵심 아키텍처

이 프로젝트는 **지속 가능한 소프트웨어**를 만들기 위해 다음과 같은 철학을 기반으로 설계되었습니다.

-   **엄격한 계층 분리 (Strict Layering):** Domain-Driven Design(DDD) 원칙에 따라 각 계층(Presentation, Application, Domain, Infrastructure)의 역할과 책임을 명확히 분리하여 코드의 복잡성을 낮추고 유지보수성을 높입니다.
-   **테스트 주도 개발 (Test-Driven Development):** 모든 비즈니스 로직은 반드시 테스트 코드로 검증되어야 합니다. 이는 코드의 안정성을 보장하고 자신감 있는 리팩토링을 가능하게 합니다.
-   **선언적 프로그래밍 (Declarative Programming):** Zod와 같은 라이브러리를 활용하여 "무엇을 할 것인지"를 선언적으로 기술함으로써, "어���게 할 것인지"에 대한 복잡한 절차적 코드를 줄입니다.

### 1.1. 아키텍처: 요청(Request)의 여정

사용자의 HTTP 요청이 우리 시스템에서 어떻게 처리되는지 이해하는 것은 아키텍처를 파악하는 가장 좋은 방법입니다.

```
[Request] -> index.ts -> Middleware Chain -> Route Handler -> [Response]
```

1.  **`src/index.ts` (진입점):** 모든 API 요청(`/api/*`)은 이 파일에서 시작됩니다. 요청은 가장 먼저 글로벌 미들웨어 체인을 통과합니다.

    -   `cors()`: CORS 정책을 적용합니다.
    -   `dependencyInjection()`: **(핵심)** 요청 처리의 생명주기 동안 필요한 모든 서비스와 리포지토리를 생성하고 Hono 컨텍스트에 주입합니다.

2.  **`src/presentation/middlewares/` (미들웨어):**

    -   **`di.middleware.ts`:** 이 프로젝트 아키텍처의 심장입니다. **모든 요청마다** `DrizzleUserRepository`와 `AuthService` 같은 의존성의 새 인스턴스를 생성하여 컨텍스트(`c.var`)에 설정합니다. 이는 요청 간 완벽한 격리를 보장합니다.
    -   **`auth.middleware.ts`:** 보호가 필요한 라우트에서 사용됩니다. `Authorization: Bearer <token>` 헤더를 검증하고, 유효한 경우 사용자 정보(`userId`, `role`)를 컨텍스트에 추가합니다.
    -   **`error.middleware.ts`:** 애플리케이션 전역에서 발생하는 모든 에러를 마지막에 처리하는 최종 방어선입니다.

3.  **`src/presentation/routes/` (라우트 핸들러):**

    -   요청의 최종 목적지입니다. `zValidator`를 사용해 요청 본문(body)이나 파라미터를 선언적으로 검증합니다.
    -   컨텍스트(`c.var`)에서 필요한 서비스(`authService` 등)를 가져와 비즈니스 로직을 위임합니다.
    -   서비스의 실행 결과를 바탕으로 성공 응답(`c.json(...)`)을 반환합니다.

4.  **`src/application/services/` (애플리케이션 서비스):**

    -   실질적인 비즈니스 로직을 수행합니다.
    -   도메인 엔티티(`User.create`)를 사용하여 도메인 규칙을 실행하고, 데이터 영속성은 도메인 리포지토리 인터페이스(`IUserRepository`)에 위임합니다.

5.  **`src/domain/` & `src/infrastructure/` (도메인 & 인프라):**

    -   **Domain:** `user.entity.ts`, `user.repository.ts`처럼 순수한 비즈니스 규칙과 인터페이스를 정의합니다. 외부 의존성이 전혀 없습니다.
    -   **Infrastructure:** `drizzle.user.repository.ts`처럼 도메인 인터페이스에 대한 실제 구현을 담당합니다. 데이터베이스와 직접 통신하는 ��드가 여기에 위치합니다.

6.  **중앙 집중식 에러 처리:**
    -   서비스나 라우트 어디서든 `throw new ConflictError(...)`와 같이 `domain/errors.ts`에 정의된 커스텀 에러를 던지면, `error.middleware.ts`가 이를 가로채 일관된 형식의 JSON 오류 응답을 생성합니다.

---

## 2. "How-To" 가이드: 실전 개발 레시피

새로운 에이전트가 가장 자주 수행할 작업에 대한 단계별 가이드입니다.

### 2.1. How-To: 신규 API 엔드포인트 추가하기 (e.g., 프로필 업데이트)

1.  **테스트 작성 (TDD):** `test/integration/user.spec.ts`에 프로필 업데이트가 성공하는 시나리오와 실패하는 시나리오에 대한 테스트를 먼저 작성합니다.
2.  **스키마 정의:** `src/presentation/schemas/user.schema.ts`에 프로필 업데이트 요청을 위한 Zod 스키마(`UpdateProfileRequestSchema`)를 정의합니다.
    ```typescript
    export const UpdateProfileRequestSchema = z.object({
        nickname: z.string().min(2).max(20).optional(),
        // ... other fields
    });
    ```
3.  **리포지토리 및 서비스 로직 추가:**
    -   (필요시) `src/domain/users/user.repository.ts`에 `updateProfile` 메소드 인터페이스를 추가합니다.
    -   `src/infrastructure/repositories/drizzle.user.repository.ts`에 `updateProfile`을 구현합니다.
    -   `src/application/services/user.service.ts` (없으면 생성)에 `updateProfile` 비즈니스 로직을 작성합니다. 이 서비스는 `di.middleware.ts`에 등록되어야 합니다.
4.  **라우트 추가:** `src/presentation/routes/user.routes.ts`에 새로운 라우트를 추가합니다.

    ```typescript
    import { UpdateProfileRequestSchema } from '../schemas/user.schema';

    userRoutes.put(
        '/me',
        authMiddleware, // 인증 필요
        zValidator('json', UpdateProfileRequestSchema), // 요청 본문 자동 검증
        async (c) => {
            const userService = c.var.userService;
            const { userId } = c.get('authPayload');
            const validData = c.req.valid('json');

            await userService.updateProfile(userId, validData);
            return c.body(null, 204); // 성공 시 No Content 응답
        }
    );
    ```

5.  **API 명세 업데이트:** `src/index.ts`의 OpenAPI `paths` 객체에 새로운 `/api/users/me` (put)에 대한 명세를 추가하여 API 문서를 최신 상태로 유지합니다.
6.  **테스트 실행:** `npm test`를 실행하여 모든 테스트가 통과하는지 확인합니다.

### 2.2. How-To: 에러 처리하기

-   **절대 `try-catch`로 직접 에러 응답을 만들지 마세요.**
-   비즈니스 로직에�� 상황에 맞는 에러를 던지기만 하면 됩니다.
    -   **리소스를 찾을 수 없을 때:** `throw new NotFoundError('User not found');`
    -   **중복된 데이터가 있을 때:** `throw new ConflictError('Nickname already exists');`
    -   **권한이 없을 때:** `throw new UnauthorizedError('Invalid credentials');`
-   `error.middleware.ts`가 나머지를 모두 처리해 줄 것입니다.

### 2.3. How-To: 데이터베이스 스키마 변경하기

1.  **스키마 수정:** `src/infrastructure/db/schema.ts` 파일에서 `users` 테이블에 새로운 컬럼을 추가하거나 기존 컬럼을 수정합니다.
2.  **마이그레이션 파일 생성:** 터미널에서 다음 명령을 실행합니다. Drizzle이 변경사항을 감지하여 `drizzle/` 폴더에 SQL 마이그레이션 파일을 생성합니다.
    ```bash
    npx drizzle-kit generate
    ```
3.  **마이그레이션 적용:**
    -   **로컬 DB에 적용:** `npx wrangler d1 migrations apply hono_db --local`
    -   **프로덕션 DB에 적용:** `npx wrangler d1 migrations apply hono_db_prod --remote`

---

## 3. 개발 원칙 및 워크플로우 (엄격 준수)

(기존 GEMINI.md의 개발 원칙, Task 실행 워크플로우 내용은 여기에 통합됩니다.)

-   **Confirm Before Proceeding:** 계획 보고 후, 명시적인 "진행" 지시가 있기 전까지 절대 작업을 시작하지 않습니다.
-   **Read First, Act Later:** 파일 수정 전, 반드시 `read_file`로 최신 내용을 확인합니다.
-   **Task 실행 워크플로우 (Epic 기반):**
    1.  `epics/` 폴더에 Epic 파일 생성 및 Subtask 체크리스트 작성.
    2.  Subtask 단위로 코드 및 테스트 수정.
    3.  `npm test`로 전체 테스트 실행 및 통과 확인.
    4.  Epic 파일의 해당 Subtask 체크 (`[x]`).
    5.  보고 후 승인 시, 논리적 단위로 커밋 및 푸시.
    6.  다음 Subtask 반복.
