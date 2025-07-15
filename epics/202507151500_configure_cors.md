### **Epic: CORS (Cross-Origin Resource Sharing) 설정**

**중요 원칙: 이 작업은 CORS 미들웨어를 추가하여 지정된 origin의 요청을 허용하는 데 집중합니다. 기존 기능 및 API 명세는 변경하지 않습니다.**

#### **Task 1: CORS 미들웨어 추가**

- [x] `src/index.ts` 파일에 Hono의 내장 CORS 미들웨어(`hono/cors`)를 추가합니다.
- [x] 허용할 origin 목록을 다음과 같이 명확히 설정합니다.
    - [x] `http://localhost:3000`
    - [x] `http://localhost:8787`
    - [x] `https://hono-be.furychick0.workers.dev`
    - [x] `https://hono-be.tuum.day`
- [x] 허용할 HTTP 메소드 (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`)와 헤더(`Authorization`, `Content-Type`)를 명시적으로 설정하여 보안을 강화합니다.

#### **Task 2: CORS 설정 테스트**

- [x] (TDD) CORS Preflight 요청(`OPTIONS`)에 대한 테스트 케이스를 작성합니다.
- [x] `test/cors.test.ts` 파일을 새로 생성하여 다음을 확인합니다.
    - [x] `OPTIONS` 요청 시 `204 No Content` 상태 코드를 반환하는지 확인합니다.
    - [x] 응답 헤더에 `Access-Control-Allow-Origin`이 요청한 origin과 일치하게 포함되어 있는지 확인합니다.
    - [x] 허용되지 않은 origin으로 요청 시, `Access-Control-Allow-Origin` 헤더가 없는지 확인합니다.

#### **Task 3: 최종 확인 및 커밋**

- [x] `npm test`를 실행하여 모든 테스트가 통과하는지 확인합니다.
- [ ] (사용자 확인) 실제 프론트엔드 환경에서 API 요청이 정상적으로 처리되는지 확인합니다.
- [ ] 모든 변경사항을 커밋하고 푸시합니다.