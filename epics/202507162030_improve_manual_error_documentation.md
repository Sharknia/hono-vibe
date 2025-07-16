# Epic: 수동 OpenAPI 명세의 에러 응답 정의 개선

**목표:** 현재의 수동 OpenAPI 명세 방식을 유지하면서, 모든 API 경로에 일관되고 재사용 가능한 표준 에러 응답 정의를 추가하여 문서의 명확성을 높인다.

---

## Task 1: 표준 에러 응답 컴포넌트 정의

-   [ ] **Subtask 1.1:** `src/presentation/schemas/common.schema.ts` 파일에, 수동 OpenAPI 명세에서 참조할 수 있는 순수 JavaScript 객체 형태의 `ErrorResponseComponent`를 정의한다.
-   [ ] **Subtask 1.2:** `src/index.ts` 파일의 OpenAPI 명세(`openApiSpec` 객체) 내 `components.schemas` 섹션에 `ErrorResponseComponent`를 추가한다.
-   [ ] **Subtask 1.3:** `components`에 재사용 가능한 `responses` 섹션을 추가하고, `BadRequest`, `Unauthorized`, `Conflict` 등 공통 에러 응답들을 `$ref`를 사용하여 `ErrorResponse` 스키마를 참조하도록 정의한다.

## Task 2: 기존 API 경로에 표준 에러 응답 적용

-   [ ] **Subtask 2.1:** `src/index.ts`의 `paths` 섹션에서, 에러를 반환할 수 있는 모든 경로(예: `/api/auth/register`, `/api/admin` 등)의 에러 응답(400, 401, 409 등)을 `components.responses`에 정의된 공통 에러 응답을 참조하도록 (`$ref`) 수정한다.

## Task 3: 테스트를 통한 명세 검증

-   [ ] **Subtask 3.1:** `test/openapi.test.ts` 파일의 내용을, 수정된 OpenAPI 명세가 `ErrorResponse` 스키마와 `$ref`를 올바르게 포함하고 참조하는지 검증하는 테스트 코드로 전면 수정한다. (TDD)
-   [ ] **Subtask 3.2:** `npm test`를 실행하여 모든 테스트가 통과하는지 확인한다.

## Task 4: 최종 검토 및 정리

-   [ ] **Subtask 4.1:** `npm run dev`로 로컬 서버를 실행하고, Swagger UI (`/api/doc`)에 접속하여 모든 에러 응답이 명확하고 일관되게 표시되는지 시각적으로 검증한다.
-   [ ] **Subtask 4.2:** `GEMINI.md`에 API 에러 문서화 방식을 간략하게 기록한다.
