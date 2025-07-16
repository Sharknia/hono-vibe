# Epic: API 에러 응답 표준화 및 문서 자동화 (재수립)

> **`@hono/zod-openapi` 핵심 원칙:**
> API 문서에 포함될 모든 Zod 스키마는 반드시 `import { z } from '@hono/zod-openapi'`를 통해 생성해야 한다. 순수 `zod`의 `z`와 혼용 시, 메타데이터 누락으로 에러가 발생한다.

**목표:** 명확한 원칙 아래 API 에러 응답을 표준화하고, `@hono/zod-openapi`를 안정적으로 도입하여 문서 자동화를 달성한다.

---

## Task 1: Zod Import 표준화 및 기반 안정화

-   [x] **Subtask 1.1:** `src/presentation/schemas/` 내 모든 `*.ts` 파일에서 `import { z } from 'zod'`를 `import { z } from '@hono/zod-openapi'`로 변경한다.
-   [x] **Subtask 1.2:** `npm test`를 실행하여, import 변경으로 인해 기존 테스트가 깨지지 않는지 확인한다. (하위 호환성 검증)

## Task 2: `zod-openapi` 문서 생성 재검증 (PoC)

-   [ ] **Subtask 2.1:** `index.ts`의 `app` 인스턴스를 `new OpenAPIHono()`로 변경하고, 수동 명세 부분을 제거한 뒤 `app.doc()`을 사용하도록 수정한다.
-   [ ] **Subtask 2.2:** `auth.routes.ts`와 `user.routes.ts`를 `OpenAPIHono` 인스턴스를 사용하도록 변경한��.
-   [ ] **Subtask 2.3:** `auth.routes.ts`의 `/register` 라우트를 `createRoute`를 사용하여 OpenAPI 명세를 정의하도록 리팩토링한다.
-   [ ] **Subtask 2.4:** `test/openapi.test.ts`를 수정하여, `/api/openapi.json` 호출 시 `/register` 경로의 명세가 올바르게 포함되는지 검증하는 테스트를 작성한다. (TDD)
-   [ ] **Subtask 2.5:** `npm test`를 실행하여 `openapi.test.ts`가 **반드시 통과함**을 확인하고, 문서 자동화의 기술적 타당성을 최종 확보한다.

## Task 3: 전체 API 라우트의 OpenAPI 문서화 적용

-   [ ] **Subtask 3.1:** `auth.routes.ts`의 모든 라우트를 `createRoute`를 사용하여 OpenAPI 명세를 정의하도록 리팩토링하고, 관련 테스트를 추가한다.
-   [ ] **Subtask 3.2:** `user.routes.ts`의 모든 라우트를 `createRoute`를 사용하여 OpenAPI 명세를 정의하도록 리팩토링하고, 관련 테스트를 추가한다.
-   [ ] **Subtask 3.3:** `index.ts`의 나머지 라우트(`/health`, `/admin`)도 `createRoute`를 사용하여 문서화한다.

## Task 4: 최종 검토 및 정리

-   [ ] **Subtask 4.1:** `npm run dev`로 로컬 서버를 실행하고, Swagger UI (`/api/doc`)에 접속하여 모든 API가 의도대로 문서화되었는지 시각적으로 검증한다.
-   [ ] **Subtask 4.2:** `GEMINI.md`�� API 문서화에 대한 새로운 개발 규칙 및 절차를 업데이트한다.
