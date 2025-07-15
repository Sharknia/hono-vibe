# Epic: 사용자 프로필 유효성 검사 강화

> **주의**: 이 Epic은 사용자 가입 및 프로필 관리 기능의 핵심적인 부분을 변경합니다. 관련된 모든 API와 데이터베이스 스키마, 그리고 테스트 코드를 반드시 함께 수정해야 합니다.

## 목표

사용자 경험을 개선하고 데이터 무결성을 강화하기 위해 닉네임 및 이메일 중복 검사 API를 추가하고, 회원가입 시 닉네임을 필수로 요구하며, 중복된 닉네임 또는 이메일로 가입하는 것을 방지합니다.

## 사용자 스토리

- **US1: 닉네임 중복 검사 API**
  - **As a** 사용자,
  - **I want to** 닉네임이 이미 사용 중인지 확인할 수 있는 API를 통해,
  - **So that** 고유한 닉네임을 쉽게 선택할 수 있다.

- **US2: 이메일 중복 검사 API**
  - **As a** 사용자,
  - **I want to** 이메일이 이미 등록되었는지 확인할 수 있는 API를 통해,
  - **So that** 계정 존재 여부를 미리 알 수 있다.

- **US3: 회원가입 시 닉네임 필수화**
  - **As a** 개발자,
  - **I want to** 회원가입 시 닉네임 필드를 필수로 만들어,
  - **So that** 모든 사용자가 식별 가능한 표시 이름을 갖도록 한다.

- **US4: 가입 시 닉네임/이메일 중복 방지**
  - **As a** 사용자,
  - **I want to** 이미 사용 중인 이메일이나 닉네임으로는 회원가입이 불가능하도록 하여,
  - **So that** 계정 중복 및 혼동을 방지할 수 있다.

## 기술 구현 계획

1.  **데이터베이스 및 엔티티 스키마 업데이트**
    - `src/infrastructure/db/schema.ts`: `users` 테이블의 `nickname` 컬럼에 `notNull()` 제약조건을 추가합니다.
    - `src/domain/users/user.entity.ts`: `User` 엔티티의 `nickname` 속성이 항상 값을 갖도록 타입을 조정합니다. (예: `string | null` -> `string`)

2.  **사용자 Repository 인터페이스 및 구현체 수정**
    - `src/domain/users/user.repository.ts`: `IUserRepository` 인터페이스에 다음 메서드를 추가합니다.
      - `findByEmail(email: string): Promise<User | null>`
      - `findByNickname(nickname: string): Promise<User | null>`
    - `src/infrastructure/repositories/drizzle.user.repository.ts`: `DrizzleUserRepository` 클래스에 위 인터페이스 메서드를 구현합니다.

3.  **회원가입 로직 수정 (AuthService)**
    - `src/application/services/auth.service.ts`: `signUp` 메서드 로직을 수정합니다.
      - 사용자 생성 전, `findByEmail`과 `findByNickname`을 호출하여 이메일과 닉네임이 이미 존재하는지 확인합니다.
      - 만약 존재한다면, `DuplicateEmailError` 또는 `DuplicateNicknameError`와 같은 커스텀 에러를 발생시킵니다.
      - `src/domain/errors.ts`에 관련 커스텀 에러를 추가합니다.

4.  **API 라우트 및 스키마 추가/수정**
    - `src/presentation/schemas/user.schema.ts`:
      - `createUserSchema`: `nickname` 필드를 `required`로 변경합니다.
      - `checkEmailSchema`, `checkNicknameSchema`를 Zod 스키마로 정의하여 경로 파라미터 유효성을 검사합니다.
    - `src/presentation/routes/user.routes.ts`:
      - `POST /users` (회원가입) 라우트의 요청 본문 유효성 검사를 강화된 `createUserSchema`로 업데이트합니다.
      - 아래의 두 가지 GET 라우트를 새로 추가합니다.
        - `GET /users/check-email/:email`: 이메일 중복 검사 API
        - `GET /users/check-nickname/:nickname`: 닉네임 중복 검사 API
    - `src/presentation/routes/auth.routes.ts`:
        - `signUp` 로직이 `user.routes.ts`가 아닌 `auth.routes.ts`에 있다면 해당 파일에서 처리합니다.

5.  **API 컨트롤러 로직 구현**
    - `user.routes.ts` 또는 관련 컨트롤러 파일에서 중복 검사 API의 핸들러 함수를 구���합니다.
      - `IUserRepository`를 사용하여 데이터베이스를 조회하고, 결과에 따라 `{ isAvailable: boolean }` 형태의 JSON을 반환합니다.

6.  **에러 처리 미들웨어**
    - `src/presentation/middlewares/error.middleware.ts`: `DuplicateEmailError`, `DuplicateNicknameError`에 대한 처리 로직을 추가하여 클라이언트에게 409 Conflict 상태 코드와 명확한 에러 메시지를 반환하도록 합니다.

7.  **테스트 코드 작성 및 수정**
    - **Unit Tests**:
      - `DrizzleUserRepository`의 `findByEmail`, `findByNickname` 메서드에 대한 단위 테스트를 작성합니다.
      - `AuthService`의 `signUp` 메서드가 중복된 이메일/닉네임에 대해 에러를 던지는지 테스트합니다.
    - **Integration Tests** (`test/integration/`):
      - 이메일 중복 검사 API (`/users/check-email/:email`) 테스트 케이스를 추가합니다.
      - 닉네임 중복 검사 API (`/users/check-nickname/:nickname`) 테스트 케이스를 추가합니다.
      - 회원가입 API가 필수 닉네임 누락 시 400 Bad Request를 반환하는지 테스트합니다.
      - 회원가IP API가 중복된 이메일/닉네임에 대해 409 Conflict를 반환하는지 테스트합니다.

## 예상되는 영향

- **API 변경**: 새로운 엔드포인트가 추가��고, 기존 회원가입 API의 요구사항이 변경됩니다. (Breaking Change)
- **데이터베이스**: `users` 테이블 스키마가 변경됩니다. (마이그레이션 필요)
- **클라이언트**: 회원가입 폼에서 닉네임을 필수로 입력받아야 하며, 중복 검사 기능을 구현할 수 있습니다.
