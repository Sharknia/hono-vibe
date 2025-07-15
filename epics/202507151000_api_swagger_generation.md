### **Epic: API Swagger 문서 생성**

Hono 애플리케이션에 Swagger UI를 연동하여 API 문서를 자동으로 생성하고, 이를 통해 API 명세를 명확히 하고 테스트 편의성을 높입니다.

#### **Task 1: 의존성 추가 및 설정**

- [x] `npm install @hono/swagger-ui @hono/zod-openapi` 실행
- [x] `tsconfig.json`에 `compilerOptions.strict` 관련 설정이 없다면 `true`로 추가하여 `@hono/zod-openapi`의 요구사항 충족

#### **Task 2: API 응답 및 요청을 위한 Zod 스키마 정의**

- [x] 공통 에러 응답(4xx, 5xx)을 위한 Zod 스키마 생성
- [x] 인증(Auth) API 관련 Zod 스키마 생성
    - [x] 로그인 요청 (`/auth/login`)
    - [x] 회원가입 요청 (`/auth/register`)
    - [x] 성공 응답 (토큰 포함)
- [x] 사용자(User) API 관련 Zod 스키마 생성
    - [x] 사용자 정보 조회 응답 (`/users/me`)

#### **Task 3: 기존 라우트를 OpenAPI 규격으로 리팩토링**

- [ ] `hono/zod-openapi`의 `createRoute`를 사용하여 기존 라우트 재정의
- [ ] `auth.routes.ts` 리팩토링
- [ ] `user.routes.ts` 리팩토링

#### **Task 4: Swagger UI 라우트 추가 및 연동**

- [ ] `/api/doc` 경로에서 Swagger UI를 확인할 수 있는 신규 라우트(`doc.routes.ts`) 생성
- [ ] `src/index.ts`에 OpenAPI 라우트와 Swagger UI 라우트 등록

#### **Task 5: 테스트 및 최종 확인**

- [ ] (TDD) Swagger UI 라우트가 200 OK를 반환하는지 확인하는 테스트 코드 작성
- [ ] `npm test`로 모든 테스트 통과 확인
- [ ] `wrangler dev`로 로컬 서버 실행 후, 브라우저에서 `/api/doc` 접속하여 Swagger UI가 정상적으로 표시되는지, 모든 API 명세가 올바르게 보이는지 수동으로 확인
