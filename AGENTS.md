# Project instructions

## About this project
Read README.md and any relevant CONTRIBUTING.md, MAINTENANCE.md, and SECURITY.md files before making changes. Use the repository's documentation and existing code to understand its purpose, setup, and verification commands.

## Working style
- Read the relevant code before making changes.
- Keep changes focused on the requested task.
- Follow existing design patterns, coding conventions, and naming conventions.
- Ask when a missing detail would materially change the result.

## Making changes
- Fix the underlying problem when practical.
- Avoid adding dependencies unless they are needed.
- Never commit passwords, API keys, or other secrets.
- Update documentation when behavior or setup changes.

## Verification
- Run the checks relevant to the change using the repository's documented commands.
- Add or update tests when changing important behavior.
- If a check cannot be run, explain why.
- Do not report a check as passing unless it was actually run and passed.

## Git and publishing
- Do not overwrite unrelated work.
- Do not push directly to the main branch. Use a separate branch and pull request.
- Do not deploy or publish unless explicitly requested.

## Reporting back
- Explain what changed in plain language.
- Summarize what was checked.
- Mention any unresolved issues.

## SuperintelligenceNDA specifics
- Read LEGAL.md, LICENSE, INTELLECTUAL_PROPERTY.md, THIRD_PARTY_NOTICES.md, and payments/README.md.
- index.html contains the UI, provider matrix, and document generators. payments/worker.mjs handles payment verification and document access.
- Preserve attribution, customer document rights, and third-party licenses. Do not describe proprietary models as open source or imply provider assent to the NDA.
- Preserve server-side paid-access checks, webhook signature verification, refund/dispute revocation, and existing paid document snapshots.
- Keep private keys, tokens, webhook secrets, customer documents, and payment data out of commits, logs, issues, and PRs.
- Do not change live payments, tax registrations, DNS, or firewall settings unless the user's task authorizes the specific change.
- For payment/access changes, run the relevant Node tests documented in payments/README.md, including payments/copy-lock.test.mjs when copy controls change. Do not charge a card merely to test.
- Documentation-only changes need a review of links, names, ownership scope, and consistency; do not claim runtime tests were run.
