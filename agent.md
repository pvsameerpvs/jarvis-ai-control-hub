# Agent Instructions

## Git & Commits
- Never auto-push or auto-commit. All git operations must be explicitly requested by the user.
- Suggest staged changes for manual commit by the user.
- Never create or modify agent configuration files without explicit user request.

## Code Architecture
- Never write too much code in a single file. Split responsibilities into focused, single-purpose files.
- Each file should do one thing well. Extract types, utilities, and sub-logic into separate files.
- Follow a clean folder structure: group by domain/feature, not by file type.
- Keep functions small and composable. Prefer pure functions where possible.

## Development Process
- Before writing any code, think deeply about the best approach. Consider trade-offs, edge cases, and alternatives.
- Plan the architecture first: what files to create, what each exports, how they connect.
- After planning, write the code.
- Verify with build/typecheck/lint after changes.

## Code Style
- No comments in code unless absolutely necessary for clarity.
- Use descriptive names. Prefer explicit over clever.
- Match the existing codebase conventions.

## Communication
- Explain the reasoning behind architectural decisions.
- Show the plan before executing on multi-file changes.
- Keep responses concise.
