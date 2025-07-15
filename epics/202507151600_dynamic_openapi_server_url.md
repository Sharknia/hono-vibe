### **Epic: OpenAPI 서버 URL 동적 설정**

**중요 원칙: 이 작업은 환경 변수(`ENV`)를 사용하여 OpenAPI 명세의 서버 URL을 동적으로 설정하는 데 집중합니다. 기존 기능 및 다른 API 명세는 변경하지 않습니다.**

#### **Task 1: 환경 변수에 따른 서버 URL 분기 처리**

- [x] `src/index.ts`의 `/api/openapi.json` 핸들러 로직을 수정합니다.
- [x] `c.env.ENV` 값을 읽어 환경을 식별합니다.
    - [x] `ENV`가 `prod`이면 서버 URL을 `https://hono-be.furychick0.workers.dev`로 설정합니다.
    - [x] `ENV`가 `local`이거나 정의되지 않은 경우, `http://localhost:8787`을 기본값으로 설정합니다.

#### **Task 2: 환경별 변수 설정**

- [x] **로컬 환경:** `.dev.vars` 파일에 `ENV="local"`을 추가하여 `wrangler dev` 실행 시 로컬 환경으로 인식되도록 합니다. (`.dev.vars` 파일이 없다면 생성합니다.)
- [x] **프로덕션 환경:** `wrangler.toml` 파일에 `[vars]` 섹션을 추가하고 `ENV = "prod"`를 설정하여 Cloudflare 배포 환경을 명시합니다.

#### **Task 3: 동적 URL 설정 테스트**

- [x] (TDD) `openapi.json`의 `servers` 필드가 환경에 따라 올바르게 변경��는지 확인하는 테스트 케이스를 작성합니다.
- [x] `test/openapi.test.ts` 파일을 새로 생성하여 다음을 확인합니다.
    - [x] `app.fetch`에 `ENV: 'local'`을 전달했을 때, 응답의 `servers[0].url`이 `http://localhost:8787`인지 확인합니다.
    - [x] `app.fetch`에 `ENV: 'prod'`를 전달했을 때, 응답의 `servers[0].url`이 `https://hono-be.furychick0.workers.dev`인지 확인합니다.

#### **Task 4: 최종 확인 및 커밋**

- [x] `npm test`를 실행하여 모든 테스트가 통과하는지 확인합니다.
- [ ] 모든 변경사항을 커밋하고 푸시합니다.