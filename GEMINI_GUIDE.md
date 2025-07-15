# Hono 기반 JWT 인증 백엔드 프로젝트 가이드

## 1. 개발 원칙 (Gemini-CLI 준수 사항)
(내용 동일, 생략)
---
(기존 내용은 생략)
---
## 6. 개발 계획 및 체크리스트 (To-Do List)

### ✅ Stage 1, 2, 3: 환경 설정, 기본 구현 및 초기 리팩토링
- [x] 완료

### ✅ Stage 3.7: 빌드 시점 환경 분리를 통한 서버 정상화
- [x] **문제 해결:** `wrangler` 빌드 시 테스트 코드 제외 및 `wrangler.toml` 설정 최적화를 통해 로컬 개발 서버 실행 문제 해결
- [x] **DB 환경 분리:** 자동화 테스트(in-memory)와 로컬 개발(D1) 환경 완벽 분리
- [x] **로컬 서버 검증:** `npm run dev` 및 `curl`을 통한 실제 API 호출 및 동작 확인 완료

### 🔲 Stage 4: 핵심 인증/인가 기능 구현 (TDD + DDD)
- [x] **토큰 리프레시 기능 (`POST /api/auth/refresh`)**
- [ ] **로그아웃 기능 (`POST /api/auth/logout`)**
- [ ] **권한(Role) 기반 접근 제어 미들웨어**

### 🔲 Stage 5: 최종 정리 및 문서화
- [ ] 전체 코드 리뷰 및 리팩토링
- [ ] `README.md` 및 `GEMINI_GUIDE.md` 최종 검토 및 업데이트