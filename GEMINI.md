# Hono Vibe API: The Gemini Onboarding Guide

이 문서는 새로운 Gemini 에이전트가 Hono Vibe API 프로젝트의 아키텍처, 핵심 패턴, 개발 워크플로우를 빠르게 이해하고, 기존 개발자와 동일한 컨텍스트와 일관성을 가지고 유지보수 및 기능 개발에 기여할 수 있도록 돕는 것을 목표로 합니다.

---

## 1. 프로젝트 철학과 핵심 아키텍처

이 프로젝트는 **지속 가능한 소프트웨어**를 만들기 위해 다음과 같은 철학을 기반으로 설계되었습니다.

-   **엄격한 계층 분리 (Strict Layering):** Domain-Driven Design(DDD) 원칙에 따라 각 계층(Presentation, Application, Domain, Infrastructure)의 역할과 책임을 명확히 분리하여 코드의 복잡성을 낮추고 유지보수성을 높입니다.
-   **테스트 주도 개발 (Test-Driven Development):** 모든 비즈니스 로직은 반드시 테스트 코드로 검증되어야 합니다. 이는 코드의 안정성을 보장하고 자신감 있는 리팩토링을 가능하게 합니다.
-   **선언적 프로그래밍 (Declarative Programming):** Zod와 같은 라이브러리를 활용하여 "무엇을 할 것인지"를 선언적으로 기술함으로써, "어떻게 할 것인지"에 대한 복잡한 절차적 코드를 줄입니다.

### 1.1. 아키텍처: 요청(Request)의 여정

사용자의 HTTP 요청이 우리 시스템에서 어떻게 처리되는지 이해하는 것은 아키텍처를 파악하는 가장 좋은 방법입니다.

```
[Request] -> index.ts -> Middleware Chain -> Route Handler -> [Response]
```

1.  **`src/index.ts` (진입점):** 모든 API 요청(`/api/*`)은 이 파일에서 시작됩니다. 요청은 가장 먼저 글로벌 미들웨어 체인을 통과합니다.

    -   `cors()`: CORS 정책을 적용합니다.
    -   `dependencyInjection()`: **(핵심)** 요청 처리의 생명주기 동안 필요한 모든 서비스와 리포지토리를 생성하고 Hono 컨텍스트에 주입합니다.

2.  **`src/presentation/middlewares/` (미들웨어):**

    -   **`di.middleware.ts`:** 이 프로젝트 아키텍처의 심장입니다. **모든 요청마다** `DrizzleUserRepository`와 `AuthService` 같은 의존성의 새 인스턴스를 생성하여 컨텍스트(`c.var`)에 설정합니다. 이는 요청 간 완벽한 격리를 보장합니다.
    -   **`auth.middleware.ts`:** 보호가 필요한 라우트에서 사용됩니다. `Authorization: Bearer <token>` 헤더를 검증하고, 유효한 경우 사용자 정보(`userId`, `role`)를 컨텍스트에 추가합니다.
    -   **`error.middleware.ts`:** 애플리케이션 전역에서 발생하는 모든 에러를 마지막에 처리하는 최종 방어선입니다.

3.  **`src/presentation/routes/` (라우트 핸들러):**

    -   요청의 최종 목적지입니다. `zValidator`를 사용해 요청 본문(body)이나 파라미터를 선언적으로 검증합니다.
    -   컨텍스트(`c.var`)에서 필요한 서비스(`authService` 등)를 가져와 비즈니스 로직을 위임합니다.
    -   서비스의 실행 결과를 바탕으로 성공 응답(`c.json(...)`)을 반환합니다.

4.  **`src/application/services/` (애플리케이션 서비스):**

    -   실질적인 비즈니스 로직을 수행합니다.
    -   도메인 엔티티(`User.create`)를 사용하여 도메인 규칙을 실행하고, 데이터 영속성은 도메인 리포지토리 인터페이스(`IUserRepository`)에 위임합니다.

5.  **`src/domain/` & `src/infrastructure/` (도메인 & 인프라):**

    -   **Domain:** `user.entity.ts`, `user.repository.ts`처럼 순수한 비즈니스 규칙과 인터페이스를 정의합니다. 외부 의존성이 전혀 없습니다.
    -   **Infrastructure:** `drizzle.user.repository.ts`처럼 도메인 인터페이스에 대한 실제 구현을 담당합니다. 데이터베이스와 직접 통신하는 코드가 여기에 위치합니다.

6.  **중앙 집중식 에러 처리:**
    -   서비스나 라우트 어디서든 `throw new ConflictError(...)`와 같이 `domain/errors.ts`에 정의된 커스텀 에러를 던지면, `error.middleware.ts`가 이를 가로채 일관된 형식의 JSON 오류 응답을 생성합니다.

---

## 2. "How-To" 가이드: 실전 개발 레시피

새로운 에이전트가 가장 자주 수행할 작업에 대한 단계별 가이드입니다.

### 2.1. How-To: 신규 API 엔드포인트 추가하기 (e.g., 프로필 업데이트)

1.  **테스트 작성 (TDD):** `test/integration/user.spec.ts`에 프로필 업데이트가 성공하는 시나리오와 실패하는 시나리오에 대한 테스트를 먼저 작성합니다.
2.  **스키마 정의:** `src/presentation/schemas/user.schema.ts`에 프로필 업데이트 요청을 위한 Zod 스키마(`UpdateProfileRequestSchema`)를 정의합니다.
    ```typescript
    export const UpdateProfileRequestSchema = z.object({
        nickname: z.string().min(2).max(20).optional(),
        // ... other fields
    });
    ```
3.  **리포지토리 및 서비스 로직 추가:**
    -   (필요시) `src/domain/users/user.repository.ts`에 `updateProfile` 메소드 인터페이스를 추가합니다.
    -   `src/infrastructure/repositories/drizzle.user.repository.ts`에 `updateProfile`을 구현합니다.
    -   `src/application/services/user.service.ts` (없으면 생성)에 `updateProfile` 비즈니스 로직을 작성합니다. 이 서비스는 `di.middleware.ts`에 등록되어야 합니다.
4.  **라우트 추가:** `src/presentation/routes/user.routes.ts`에 새로운 라우트를 추가합니다.

    ```typescript
    import { UpdateProfileRequestSchema } from '../schemas/user.schema';

    userRoutes.put(
        '/me',
        authMiddleware, // 인증 필요
        zValidator('json', UpdateProfileRequestSchema), // 요청 본문 자동 검증
        async (c) => {
            const userService = c.var.userService;
            const { userId } = c.get('authPayload');
            const validData = c.req.valid('json');

            await userService.updateProfile(userId, validData);
            return c.body(null, 204); // 성공 시 No Content 응답
        }
    );
    ```

5.  **API 명세 업데이트:** `src/index.ts`의 OpenAPI `paths` 객체에 새로운 `/api/users/me` (put)에 대한 명세를 추가하여 API 문서를 최신 상태로 유지합니다.
6.  **테스트 실행:** `npm test`를 실행하여 모든 테스트가 통과하는지 확인합니다.

### 2.2. How-To: 에러 처리하기

-   **절대 `try-catch`로 직접 에러 응답을 만들지 마세요.**
-   비즈니스 로직에서 상황에 맞는 에러를 던지기만 하면 됩니다.
    -   **리소스를 찾을 수 없을 때:** `throw new NotFoundError('User not found');`
    -   **중복된 데이터가 있을 때:** `throw new ConflictError('Nickname already exists');`
    -   **권한이 없을 때:** `throw new UnauthorizedError('Invalid credentials');`
-   `error.middleware.ts`가 나머지를 모두 처리해 줄 것입니다.

### 2.3. How-To: 데이터베이스 스키마 변경하기

1.  **스키마 수정:** `src/infrastructure/db/schema.ts` 파일에서 `users` 테이블에 새로운 컬럼을 추가하거나 기존 컬럼을 수정합니다.
2.  **마이그레이션 파일 생성:** 터미널에서 다음 명령을 실행합니다. Drizzle이 변경사항을 감지하여 `drizzle/` 폴더에 SQL 마이그레이션 파일을 생성합니다.
    ```bash
    npx drizzle-kit generate
    ```
3.  **마이그레이션 적용:**
    -   **로컬 DB에 적용:** `npx wrangler d1 migrations apply hono_db --local`
    -   **프로덕션 DB에 적용:** `npx wrangler d1 migrations apply hono_db_prod --remote`

### 2.4. How-To: 작업 계획 제시하기

새로운 작업을 시작하기 전, 아래와 같이 상세한 실행 계획을 먼저 제시하고 사용자의 승인을 받아야 합니다. 이는 사용자가 작업의 범위와 내용을 명확히 이해하고, 의도치 않은 변경을 방지하기 위함입니다.

1.  **핵심 목표 (Core Goal):** 해당 Task/Sub-task가 달성하고자 하는 핵심 목표를 한두 문장으로 요약합니다.
2.  **세부 계획 (Detailed Plan):** TDD 원칙에 따라, 구체적인 실행 단계를 순서대로 나열합니다.
3.  **파일 경로 명시 (Specify File Paths):** 생성되거나 수정될 파일의 전체 경로를 명시합니다. (예: `src/application/services/...`, `test/application/services/...`)
4.  **의존성 및 테스트 전략 (Dependencies & Test Strategy):** 테스트할 코드의 주요 의존성을 밝히고, 테스트에서 이를 어떻게 다룰지(예: `vi.spyOn`을 사용한 Mocking) 설명합니다.
5.  **주요 시나리오 (Key Scenarios):** 구현할 기능의 핵심적인 성공/실패 시나리오를 명시하여 테스트 커버리지를 예측할 수 있게 합니다.
6.  **작업 범위 명확화 (Clarify Scope):** 현재 작업에서 **다루지 않을 내용**을 명확히 하여, 작업의 경계를 설정합니다. (예: '데이터베이스 연동은 다음 Sub-task에서 진행합니다.')

---

# Task Master AI - Agent Integration Guide

## Essential Commands

### Core Workflow Commands

```bash
# Project Setup
task-master init                                    # Initialize Task Master in current project
task-master parse-prd .taskmaster/docs/prd.txt      # Generate tasks from PRD document
task-master models --setup                        # Configure AI models interactively

# Daily Development Workflow
task-master list                                   # Show all tasks with status
task-master next                                   # Get next available task to work on
task-master show <id>                             # View detailed task information (e.g., task-master show 1.2)
task-master set-status --id=<id> --status=done    # Mark task complete

# Task Management
task-master add-task --prompt="description" --research        # Add new task with AI assistance
task-master expand --id=<id> --research --force              # Break task into subtasks
task-master update-task --id=<id> --prompt="changes"         # Update specific task
task-master update --from=<id> --prompt="changes"            # Update multiple tasks from ID onwards
task-master update-subtask --id=<id> --prompt="notes"        # Add implementation notes to subtask

# Analysis & Planning
task-master analyze-complexity --research          # Analyze task complexity
task-master complexity-report                      # View complexity analysis
task-master expand --all --research               # Expand all eligible tasks

# Dependencies & Organization
task-master add-dependency --id=<id> --depends-on=<id>       # Add task dependency
task-master move --from=<id> --to=<id>                       # Reorganize task hierarchy
task-master validate-dependencies                            # Check for dependency issues
task-master generate                                         # Update task markdown files (usually auto-called)
```

## Key Files & Project Structure

### Core Files

-   `.taskmaster/tasks/tasks.json` - Main task data file (auto-managed)
-   `.taskmaster/config.json` - AI model configuration (use `task-master models` to modify)
-   `.taskmaster/docs/prd.txt` - Product Requirements Document for parsing
-   `.taskmaster/tasks/*.txt` - Individual task files (auto-generated from tasks.json)
-   `.env` - API keys for CLI usage

### Claude Code Integration Files

-   `CLAUDE.md` - Auto-loaded context for Claude Code (this file)
-   `.claude/settings.json` - Claude Code tool allowlist and preferences
-   `.claude/commands/` - Custom slash commands for repeated workflows
-   `.mcp.json` - MCP server configuration (project-specific)

### Directory Structure

```
project/
├── .taskmaster/
│   ├── tasks/              # Task files directory
│   │   ├── tasks.json      # Main task database
│   │   ├── task-1.md      # Individual task files
│   │   └── task-2.md
│   ├── docs/              # Documentation directory
│   │   ├── prd.txt        # Product requirements
│   ├── reports/           # Analysis reports directory
│   │   └── task-complexity-report.json
│   ├── templates/         # Template files
│   │   └── example_prd.txt  # Example PRD template
│   └── config.json        # AI models & settings
├── .claude/
│   ├── settings.json      # Claude Code configuration
│   └── commands/         # Custom slash commands
├── .env                  # API keys
├── .mcp.json            # MCP configuration
└── CLAUDE.md            # This file - auto-loaded by Claude Code
```

## MCP Integration

Task Master provides an MCP server that Claude Code can connect to. Configure in `.mcp.json`:

```json
{
    "mcpServers": {
        "task-master-ai": {
            "command": "npx",
            "args": ["-y", "--package=task-master-ai", "task-master-ai"],
            "env": {
                "ANTHROPIC_API_KEY": "your_key_here",
                "PERPLEXITY_API_KEY": "your_key_here",
                "OPENAI_API_KEY": "OPENAI_API_KEY_HERE",
                "GOOGLE_API_KEY": "GOOGLE_API_KEY_HERE",
                "XAI_API_KEY": "XAI_API_KEY_HERE",
                "OPENROUTER_API_KEY": "OPENROUTER_API_KEY_HERE",
                "MISTRAL_API_KEY": "MISTRAL_API_KEY_HERE",
                "AZURE_OPENAI_API_KEY": "AZURE_OPENAI_API_KEY_HERE",
                "OLLAMA_API_KEY": "OLLAMA_API_KEY_HERE"
            }
        }
    }
}
```

### Essential MCP Tools

```javascript
help; // = shows available taskmaster commands
// Project setup
initialize_project; // = task-master init
parse_prd; // = task-master parse-prd

// Daily workflow
get_tasks; // = task-master list
next_task; // = task-master next
get_task; // = task-master show <id>
set_task_status; // = task-master set-status

// Task management
add_task; // = task-master add-task
expand_task; // = task-master expand
update_task; // = task-master update-task
update_subtask; // = task-master update-subtask
update; // = task-master update

// Analysis
analyze_project_complexity; // = task-master analyze-complexity
complexity_report; // = task-master complexity-report
```

## Claude Code Workflow Integration

### Standard Development Workflow

#### 1. Project Initialization

```bash
# Initialize Task Master
task-master init

# Create or obtain PRD, then parse it
task-master parse-prd .taskmaster/docs/prd.txt

# Analyze complexity and expand tasks
task-master analyze-complexity --research
task-master expand --all --research
```

If tasks already exist, another PRD can be parsed (with new information only!) using parse-prd with --append flag. This will add the generated tasks to the existing list of tasks..

#### 2. Daily Development Loop

```bash
# Start each session
task-master next                           # Find next available task
task-master show <id>                     # Review task details

# During implementation, check in code context into the tasks and subtasks
task-master update-subtask --id=<id> --prompt="implementation notes..."

# Complete tasks
task-master set-status --id=<id> --status=done
```

#### 3. Multi-Claude Workflows

For complex projects, use multiple Claude Code sessions:

```bash
# Terminal 1: Main implementation
cd project && claude

# Terminal 2: Testing and validation
cd project-test-worktree && claude

# Terminal 3: Documentation updates
cd project-docs-worktree && claude
```

### Custom Slash Commands

Create `.claude/commands/taskmaster-next.md`:

```markdown
Find the next available Task Master task and show its details.

Steps:

1. Run `task-master next` to get the next task
2. If a task is available, run `task-master show <id>` for full details
3. Provide a summary of what needs to be implemented
4. Suggest the first implementation step
```

Create `.claude/commands/taskmaster-complete.md`:

```markdown
Complete a Task Master task: $ARGUMENTS

Steps:

1. Review the current task with `task-master show $ARGUMENTS`
2. Verify all implementation is complete
3. Run any tests related to this task
4. Mark as complete: `task-master set-status --id=$ARGUMENTS --status=done`
5. Show the next available task with `task-master next`
```

## Tool Allowlist Recommendations

Add to `.claude/settings.json`:

```json
{
    "allowedTools": [
        "Edit",
        "Bash(task-master *)",
        "Bash(git commit:*)",
        "Bash(git add:*)",
        "Bash(npm run *)",
        "mcp__task_master_ai__*"
    ]
}
```

## Configuration & Setup

### API Keys Required

At least **one** of these API keys must be configured:

-   `ANTHROPIC_API_KEY` (Claude models) - **Recommended**
-   `PERPLEXITY_API_KEY` (Research features) - **Highly recommended**
-   `OPENAI_API_KEY` (GPT models)
-   `GOOGLE_API_KEY` (Gemini models)
-   `MISTRAL_API_KEY` (Mistral models)
-   `OPENROUTER_API_KEY` (Multiple models)
-   `XAI_API_KEY` (Grok models)

An API key is required for any provider used across any of the 3 roles defined in the `models` command.

### Model Configuration

```bash
# Interactive setup (recommended)
task-master models --setup

# Set specific models
task-master models --set-main claude-3-5-sonnet-20241022
task-master models --set-research perplexity-llama-3.1-sonar-large-128k-online
task-master models --set-fallback gpt-4o-mini
```

## Task Structure & IDs

### Task ID Format

-   Main tasks: `1`, `2`, `3`, etc.
-   Subtasks: `1.1`, `1.2`, `2.1`, etc.
-   Sub-subtasks: `1.1.1`, `1.1.2`, etc.

### Task Status Values

-   `pending` - Ready to work on
-   `in-progress` - Currently being worked on
-   `done` - Completed and verified
-   `deferred` - Postponed
-   `cancelled` - No longer needed
-   `blocked` - Waiting on external factors

### Task Fields

```json
{
    "id": "1.2",
    "title": "Implement user authentication",
    "description": "Set up JWT-based auth system",
    "status": "pending",
    "priority": "high",
    "dependencies": ["1.1"],
    "details": "Use bcrypt for hashing, JWT for tokens...",
    "testStrategy": "Unit tests for auth functions, integration tests for login flow",
    "subtasks": []
}
```

## Claude Code Best Practices with Task Master

### Context Management

-   Use `/clear` between different tasks to maintain focus
-   This CLAUDE.md file is automatically loaded for context
-   Use `task-master show <id>` to pull specific task context when needed

### Iterative Implementation

1. `task-master show <subtask-id>` - Understand requirements
2. Explore codebase and plan implementation
3. `task-master update-subtask --id=<id> --prompt="detailed plan"` - Log plan
4. `task-master set-status --id=<id> --status=in-progress` - Start work
5. Implement code following logged plan
6. `task-master update-subtask --id=<id> --prompt="what worked/didn't work"` - Log progress
7. `task-master set-status --id=<id> --status=done` - Complete task

### Complex Workflows with Checklists

For large migrations or multi-step processes:

1. Create a markdown PRD file describing the new changes: `touch task-migration-checklist.md` (prds can be .txt or .md)
2. Use Taskmaster to parse the new prd with `task-master parse-prd --append` (also available in MCP)
3. Use Taskmaster to expand the newly generated tasks into subtasks. Consdier using `analyze-complexity` with the correct --to and --from IDs (the new ids) to identify the ideal subtask amounts for each task. Then expand them.
4. Work through items systematically, checking them off as completed
5. Use `task-master update-subtask` to log progress on each task/subtask and/or updating/researching them before/during implementation if getting stuck

### Git Integration

Task Master works well with `gh` CLI:

```bash
# Create PR for completed task
gh pr create --title "Complete task 1.2: User authentication" --body "Implements JWT auth system as specified in task 1.2"

# Reference task in commits
git commit -m "feat: implement JWT auth (task 1.2)"
```

### Parallel Development with Git Worktrees

```bash
# Create worktrees for parallel task development
git worktree add ../project-auth feature/auth-system
git worktree add ../project-api feature/api-refactor

# Run Claude Code in each worktree
cd ../project-auth && claude    # Terminal 1: Auth work
cd ../project-api && claude     # Terminal 2: API work
```

## Troubleshooting

### AI Commands Failing

```bash
# Check API keys are configured
cat .env                           # For CLI usage

# Verify model configuration
task-master models

# Test with different model
task-master models --set-fallback gpt-4o-mini
```

### MCP Connection Issues

-   Check `.mcp.json` configuration
-   Verify Node.js installation
-   Use `--mcp-debug` flag when starting Claude Code
-   Use CLI as fallback if MCP unavailable

### Task File Sync Issues

```bash
# Regenerate task files from tasks.json
task-master generate

# Fix dependency issues
task-master fix-dependencies
```

DO NOT RE-INITIALIZE. That will not do anything beyond re-adding the same Taskmaster core files.

## Important Notes

### AI-Powered Operations

These commands make AI calls and may take up to a minute:

-   `parse_prd` / `task-master parse-prd`
-   `analyze_project_complexity` / `task-master analyze-complexity`
-   `expand_task` / `task-master expand`
-   `expand_all` / `task-master expand --all`
-   `add_task` / `task-master add-task`
-   `update` / `task-master update`
-   `update_task` / `task-master update-task`
-   `update_subtask` / `task-master update-subtask`

### File Management

-   Never manually edit `tasks.json` - use commands instead
-   Never manually edit `.taskmaster/config.json` - use `task-master models`
-   Task markdown files in `tasks/` are auto-generated
-   Run `task-master generate` after manual changes to tasks.json

### Claude Code Session Management

-   Use `/clear` frequently to maintain focused context
-   Create custom slash commands for repeated Task Master workflows
-   Configure tool allowlist to streamline permissions
-   Use headless mode for automation: `claude -p "task-master next"`

### Multi-Task Updates

-   Use `update --from=<id>` to update multiple future tasks
-   Use `update-task --id=<id>` for single task updates
-   Use `update-subtask --id=<id>` for implementation logging

### Research Mode

-   Add `--research` flag for research-based AI enhancement
-   Requires a research model API key like Perplexity (`PERPLEXITY_API_KEY`) in environment
-   Provides more informed task creation and updates
-   Recommended for complex technical tasks

---

_This guide ensures Claude Code has immediate access to Task Master's essential functionality for agentic development workflows._

---

## 3. 작업 수행 규칙 (Task Execution Rules)
-   **명시적 승인:** 새로운 Task 또는 Sub-task를 시작하기 전, 사용자에게 진행 계획을 보고하고 명시적인 승인을 받아야 합니다. 절대로 임의로 작업을 진행하지 않습니다.