# momsappfrontend — Progress

Last updated: 2026-02-27

## Current phase
Config alignment + auth integration checks

## Done
- Repo structure + stack review completed
- README/scripts reviewed
- API client/auth token handling reviewed
- Admin dashboard/service call surface scanned

## Findings (high priority)
- API base URL hardcoded in `src/services/api.ts`
- `.env.example` value exists but is not the actual source of truth in code
- Potential mismatch with backend local URL/ports

## In progress
- Preparing reviewable diff summary

## Completed in this pass
- Refactored API client to use `import.meta.env.VITE_API_BASE_URL`
- Added fallback to `https://localhost:7290`
- Updated README to document expected `VITE_API_BASE_URL` value

## Next
1. Add optional startup warning when env var is missing
2. Verify all service modules use shared axios instance
3. Provide PR-ready commit grouping

## Blockers
- None
