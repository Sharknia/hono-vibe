# Epic: OpenAPI 에러 응답 예시 명확화

**목표:** Swagger UI에서 모든 에러 응답(401, 403, 404 등)이 각각의 상태 코드와 메시지에 맞는 정확한 예시 값을 보여주도록 수정하여, API 문서의 사용성을 개선한다.

---

## Task 1: OpenAPI 명세 수정

-   [x] **Subtask 1.1:** `index.ts`의 `openApiSpec` 객체에서, `components.responses` 섹션을 찾는다.
-   [x] **Subtask 1.2:** `BadRequest`, `Unauthorized`, `Forbidden`, `Conflict` 등 각 공통 에러 응답 정의를 수정한다.
    -   기존: `$ref`를 사용하여 스키마만 참조
    -   변경: 스키마 참조는 유지하되, 각 응답에 맞는 `statusCode`, `error`, `message`를 포함하는 `example`을 명시적으로 추가한다.
    -   예시 (`Unauthorized`):
        ```json
        "Unauthorized": {
          "description": "Unauthorized",
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/ErrorResponse" },
              "example": {
                "statusCode": 401,
                "error": "Unauthorized",
                "message": "Authorization header is missing or invalid"
              }
            }
          }
        }
        ```

## Task 2: 테스트를 통한 검증

-   [x] **Subtask 2.1:** `test/openapi.test.ts`에 새로운 테스트 케이스를 추가한다.
-   [x] **Subtask 2.2:** 추가된 테스트는 `/api/openapi.json`을 호출하여, `components.responses.Unauthorized`와 같은 특정 에러 응답의 `content.application/json.example` 필드에 올바른 `statusCode` (예: 401)가 포함되어 있는지 검증한다. (TDD)
-   [x] **Subtask 2.3:** `npm test`를 실행하여 모든 테스트가 통과하는지 확인한다.

## Task 3: 최종 검토 및 정리

-   [ ] **Subtask 3.1:** `npm run dev`로 로컬 서버를 실행하고, Swagger UI (`/api/doc`)에 접속하여 401, 403, 409 등 각기 다른 에러 응답들이 이제 올바른 예시 값을 보여주는지 시각적으로 최종 검증한다.
-   [ ] **Subtask 3.2:** 에픽 파일의 모든 Task가 완료되었음을 확인하고 체크한다.
