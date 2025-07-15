# Hono JWT 인증 백엔드 프로젝트

이 프로젝트는 Hono 프레임워크와 Cloudflare D1을 사용하여 구축된 JWT 기반 인증 백엔드 시스템입니다.

## 주요 기술 스택
(내용 동일, 생략)

## 개발 환경
(내용 동일, 생략)

## 시작하기

### 1. 의존성 설치
(내용 동일, 생략)

### 2. 환경 변수 설정
(내용 동일, 생략)

### 3. 로컬 데이터베이스 마이그레이션

로컬 개발 서버를 처음 실행하기 전, 로컬 D1 데이터베이스에 테이블 스키마를 적용해야 합니다.

1.  `wrangler.toml` 파일에 마이그레이션 디렉토리 경로가 올바르게 설정되어 있는지 확인합니다.
    ```toml
    [[d1_databases]]
    binding = "DB"
    database_name = "hono-db"
    database_id = "your-database-id"
    migrations_dir = "drizzle" # 이 줄이 중요합니다.
    ```
2.  다음 명령어를 실행하여 로컬 D1 데이터베이스에 마이그레이션을 적용합니다.
    ```bash
    npx wrangler d1 migrations apply hono-db --local
    ```

### 4. 로컬 개발 서버 실행

이제 로컬 개발 서버를 시작할 수 있습니다.
```bash
npm run dev
```
서버가 실행되면 `http://localhost:8787` 주소로 API 요청을 보낼 수 있습니다.

### 5. 자동화 테스트 실행
(내용 동일, 생략)

## Cloudflare D1 (프로덕션)
(기존 내용과 동일, 제목만 변경)