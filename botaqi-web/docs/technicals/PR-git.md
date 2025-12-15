A PR (pull request) is a GitHub object requesting that commits on one branch be reviewed and merged into another branch — it bundles the branch’s commits/diff, discussion, CI checks, and merge action.

- Core parts: source branch, target branch, commits, diff, title/body, reviewers, CI/status checks, merge commit or squash.
- Purpose: code review, CI validation, discussion, and controlled merge/deploy.
- Typical flow: push branch → open PR → automated checks run → reviewers approve → merge (merge/squash/rebase) → CI/deploy.

Quick commands:
``
# push your feature branch
git push -u origin feat/your-branch
# create PR via GitHub CLI
gh pr create --base main --head feat/your-branch --title "Short title" --body "Description"
``

## PR Checklist (minimal, mandatory)

- Title and short description explain intent and user-visible impact.
- Link to issue or ticket (if applicable).
- Branch name follows convention (feat/, fix/, chore/).
- Changes are scoped to this PR only.
- Run locally: `npm ci && npm run build` (no build errors).
- CI: all checks pass (lint, tests, build).
- Tests: new behavior covered; existing tests not broken.
- Lint: code formatted and lint warnings fixed.
- Secrets: no secrets or credentials committed (`.env`, `service-account.json`, API keys).
- .gitignore includes local secret paths (e.g., `/envs/`, `/botaqi-web/.env`).
- Docs: update README or docs if public API or behavior changed.
- Migration/DB: include migration script or rollback steps if applicable.
- Deployment: confirm Vercel rootDirectory and `vercel-build` are correct for this project.
- Rollback: include simple rollback steps (revert PR or deploy previous tag).

## PR Body Template (paste and edit)
- Summary: one-line
- Why: short rationale
- Changes:
  - bullet list of code changes
- Steps to test locally:
  1. cd botaqi-web
  2. npm ci
  3. npm run build
  4. (describe runtime checks)
- Risk & rollback: (how to revert quickly)
- Linked issues: #123
