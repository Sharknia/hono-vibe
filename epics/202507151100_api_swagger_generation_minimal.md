### **Epic: API Swagger 문서 생성 (최소 변경)**

기존 코드 변경을 최소화하면서, Hono 애플리케이션에 Swagger UI를 연동하여 API 문서를 생성합니다.

#### **Task 1: 의존성 추가**

- [x] `npm install @hono/swagger-ui @hono/zod-openapi` 실행

#### **Task 2: 문서화를 위한 Zod 스키마 정의**

- [x] 기존 API의 요청/응답 구조와 **동일한** Zod 스키마를 `src/presentation/schemas` 디렉토리에 생성합니다. **(기존 로직, 엔티티, 서비스 변경 절대 없음)**
    - [x] 공통 에러 응답 스키마
    - [x] 인증(Auth) API 스키마 (`/register`, `/login`)
    - [x] 사용자(User) API 스키마 (`/me`)

#### **Task 3: OpenAPI 라우트 래핑(Wrapping) 및 문서화**

- [x] 기존 라우트 로직을 **변경하지 않고**, `createRoute`를 사용하여 각 라우트를 감싸고(wrap) 스키마를 연결하여 문서 정보를 추가합니다.
- [x] `auth.routes.ts`의 `/register`, `/login` 라우트 래핑
- [x] `user.routes.ts`의 `/me` 라우트 래핑

#### **Task 4: Swagger UI 엔드포인트 추가**

- [x] `/api/doc` 경로에서 Swagger UI를 제공하는 `doc.routes.ts` 파일을 생성합니다.
- [x] `src/index.ts`에 OpenAPI 라우트와 Swagger UI 라우트를 등록합니다.

#### **Task 5: 테스트 및 최종 확인**

- [x] (TDD) Swagger UI 라우트(`/api/doc`)가 200 OK를 반환하는지 확인하는 테스트 코드 작성
- [x] `npm test`로 모든 기존 테스트가 깨지지 않고 통과하는지 확인
- [ ] (사용자 확인) `wrangler dev` 실행 후 `/api/doc`에서 문서 확인
