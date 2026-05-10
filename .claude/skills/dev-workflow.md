# Dev Workflow Skill

Use this skill to run the full development cycle for the line-coffee project: branch → develop → lint/typecheck → commit → push.

## Project info

- **Repo**: muhmiied/line-coffee
- **Package manager**: pnpm (lockfile: pnpm-lock.yaml)
- **Framework**: Next.js + TypeScript
- **Active dev branch pattern**: `claude/<feature-slug>`

## Step-by-step workflow

### 1. Branch

```bash
git fetch origin
git checkout -b claude/<feature-slug> origin/main
```

### 2. Develop

- Edit files using Edit/Write tools.
- Follow the design-system skill for any UI work.
- Keep changes focused — one feature/fix per branch.

### 3. Verify before committing

```bash
# Type-check
npx tsc --noEmit

# Lint
npx next lint

# Build check (optional, slower)
pnpm build
```

Fix all errors before proceeding.

### 4. Commit

Stage specific files (never `git add .` blindly):

```bash
git add <file1> <file2>
git commit -m "$(cat <<'EOF'
<type>: <short summary>

<optional body>

https://claude.ai/code/session_01Qm79SphHBu9Yp1qkGiZFwT
EOF
)"
```

Commit types: `feat`, `fix`, `refactor`, `style`, `chore`, `docs`.

### 5. Push

```bash
git push -u origin claude/<feature-slug>
```

Retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s) on network failure.

## UI verification (before marking done)

Use the `puppeteer` MCP tool to:
1. Navigate to `http://localhost:3000` (start dev server first with `pnpm dev` if needed).
2. Screenshot the changed page/component.
3. Confirm it matches the expected design.
4. Check both desktop and mobile viewports.

## Dev server

```bash
pnpm dev   # starts on http://localhost:3000
```
