### **Epic: API Swagger 문서 생성**

**중요 원칙: 기존 코드의 스키마, API 명세, 기능적 동작은 절대 변경하지 않습니다. 이 작업은 순수하게 문서 정보를 보강하고, 명세가 올바르게 생성되도록 하는 데에만 집중합니다.**

#### **Task 1: 의존성 추가 및 설정**

- [x] `npm install @hono/swagger-ui` 실행
- [x] `@hono/zod-openapi` 의존성 제거 (수동 명세 작성으로 전환)

#### **Task 2: 수동 OpenAPI 명세 작성**

- [x] `src/index.ts`에 OpenAPI 3.0 규격에 맞는 JSON 객체를 직접 작성하여 API 명세를 정의
- [x] 명세에 `paths`, `components`, `securitySchemes` 등을 포함하여 API의 모든 정보를 상세히 기술

#### **Task 3: Swagger UI 엔드포인트 연동**

- [x] `/api/doc` 경로에서 Swagger UI를 제공하고, 수동으로 작성한 `/api/openapi.json`을 바라보도록 설정
- [x] 관련 라우트(`doc.routes.ts`)를 제거하고, `index.ts`에서 직접 라우트 핸들러를 정의

#### **Task 4: 최종 확인**

- [x] `npm test`로 모든 테스트가 통과하는지 확인하여 기능 회귀가 없음을 보장
- [x] `curl`을 통해 `/api/openapi.json`의 내용이 의도대로 생성되었는지 ���인
- [x] (사용자 확인) `wrangler dev` 실행 후 `/api/doc`에서 최종 문서 확인