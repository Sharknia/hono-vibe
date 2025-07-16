# Epic: API 에러 응답 표준화 및 문서 자동화

**목표:** 모든 API의 에러 응답을 표준화하고, `@hono/zod-openapi`를 도입하여 수동 작업을 제거하고, 타입-세이프한 방식으로 OpenAPI 문서를 자동으로 생성하여 개발 경험을 향상시킨다.

---

## Task 1: 표준 에러 핸들링 기반 마련 (TDD)

-   [x] **Subtask 1.1:** `domain/errors.ts`의 모든 커스텀 에러 클래스에 `name` 속성을 명시적으로 추가하여, 에러 타입을 명확하게 식별할 수 있도록 개선한다.
-   [x] **Subtask 1.2:** `presentation/schemas/common.schema.ts`의 `ErrorSchema`를 `{ statusCode, error, message }` 구조로 재정의한다.
-   [x] **Subtask 1.3:** `test/schemas/common.schema.test.ts`를 작성하여 새로운 `ErrorSchema`를 검증한다. (TDD)
-   [x] **Subtask 1.4:** `presentation/middlewares/error.middleware.ts`를 리팩토링하여 모든 에러(`HttpError`, `ZodError`, 일반 `Error`)가 새로운 `ErrorSchema` 형식으로 변환되도록 한다.
-   [x] **Subtask 1.5:** `test/error.middleware.test.ts`를 수정/보강하여, 리팩토링된 에�� 핸들러가 다양한 에러 타입에 대해 올바른 `ErrorSchema`를 반환하는지 철저히 검증한다. (TDD)

## Task 2: `zod-openapi` 라우팅 및 문서 생성 개념 증명 (PoC)

> **목표:** 실제 코드를 건드리지 않고, 격리된 환경에서 `zod-openapi`의 모듈식 라우팅과 문서 생성이 완벽하게 동작하는지 기술적으로 검증한다.

-   [ ] **Subtask 2.1:** `index.ts`를 `new OpenAPIHono()`를 사용하도록 변경하고, `app.getOpenAPIDocument()`를 호출하여 문서를 생성하는 `/api/openapi.json` 라우트를 임시로 추가한다.
-   [ ] **Subtask 2.2:** `auth.routes.ts`와 `user.routes.ts`를 `Hono` 대신 `OpenAPIHono`를 사용하도록 수정한다.
-   [ ] **Subtask 2.3:** `auth.routes.ts`의 `/register` 라우트 하나만 `createRoute`를 사용하여 OpenAPI 명세를 정의하도록 수정한다.
-   [ ] **Subtask 2.4:** `test/openapi.test.ts`를 수정하여, `/api/openapi.json`을 호출했을 때 `/api/auth/register` 경로의 명세(특히 에러 응답)가 올바르게 포함되어 있는지 검증하는 테스트를 작성한다. (TDD)
-   [ ] **Subtask 2.5:** `npm test`를 실행하여 `openapi.test.ts`가 통과하는 것을 확인하고, 모듈식 문서 생성 메커니즘이 작동함을 최종 확인한다.

## Task 3: 전체 API 라우트의 OpenAPI �����서화 적용

-   [ ] **Subtask 3.1:** `auth.routes.ts`의 모든 라우트(`login`, `refresh`, `logout` 등)를 `createRoute`를 사용하여 OpenAPI 명세를 정의하도록 리팩토링한다.
-   [ ] **Subtask 3.2:** `test/openapi.test.ts`에 `auth.routes.ts`의 모든 라우트에 대한 문서 생성 검증 테스트를 추가한다.
-   [ ] **Subtask 3.3:** `user.routes.ts`의 모든 라우트를 `createRoute`를 사용하여 OpenAPI 명세를 정의하도록 리팩토링하고, 관련 테스트를 추가한다.
-   [ ] **Subtask 3.4:** `index.ts`의 `/health`, `/admin` 등 나머지 라우트들도 `createRoute`를 사용하여 문서화한다.

## Task 4: 최종 검토 및 정리

-   [ ] **Subtask 4.1:** `npm run dev`로 로컬 서버를 실행하고, Swagger UI (`/api/doc`)에 접속하여 모든 API가 의도대로 문서화되었는지 시각적으로 검증한다.
-   [ ] **Subtask 4.2:** `GEMINI.md`에 API 문서화에 대한 새로운 개발 규칙 및 절차를 업데이트한다.