### **Epic: 누락된 API 문서 추가**

**중요 원칙: 이 작업은 `src/index.ts`의 OpenAPI 명세 객체를 수정하여 누락된 API 정보를 추가하는 데에만 집중합니다. 기존 코드의 스키마, API 명세, 기능적 동작은 절대 변경하지 않습니다.**

#### **Task 1: 누락된 `auth` API 문서 추가**

- [x] `src/index.ts`의 `paths` 객체에 다음 API 명세를 추가합니다.
    - [x] `POST /api/auth/refresh`: 토큰 재발급 API
        - [x] Request Body: `{ refreshToken: string }`
        - [x] Responses: `200 OK`, `401 Unauthorized`
    - [x] `POST /api/auth/logout`: 로그아웃 API
        - [x] Security: BearerAuth 필요
        - [x] Responses: `204 No Content`, `401 Unauthorized`

#### **Task 2: 누락된 `admin` API 문서 추가**

- [x] `src/index.ts`의 `paths` 객체에 다음 API 명세를 추가합니다.
    - [x] `GET /api/admin`: 관리자 전용 API
        - [x] Security: BearerAuth 필요
        - [x] Responses: `200 OK`, `401 Unauthorized`, `403 Forbidden`

#### **Task 3: 최종 확인**

- [x] `npm test`를 실행하여 모든 테스트가 통과하는지 확인합니다.
- [x] (사용자 확인) `wrangler dev` 실행 후, `/api/doc`에서 새로 추가된 API들이 문서에 올바르게 표시되는지 확인합니다.
- [x] 모든 변경사항을 커밋하고 푸시합니다.