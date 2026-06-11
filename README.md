# PPC Guru — Unified Prompt Generator

Single-file browser app that assembles the agency's 11-step client research prompt chain (P1–P11) for Meta Ads, Google Ads and organic research. The generated prompts are pasted into a Claude chat (with Apify + Adzviser + Meta MCPs + Google Drive connector) which performs the research and produces the reports.

**Live:** https://ppc-master-prompt-generator.vercel.app

## Structure

| Path | What it is |
|---|---|
| `index.html` | The entire app — form, prompt templates (`RAW_PROMPTS`), validation, Diagnostics, and the report Beautifier. No build step, no dependencies. |
| `CLAUDE.md` | Project guidance for Claude Code (auto-log + compact-log blocks are maintained by hooks). |
| `.claude/compact-backups/*.md` | Human-readable digests of past Claude Code sessions (raw `.jsonl` transcripts stay local). |
| `.vercelignore` | Keeps internal docs out of the deployed site. |

## Deploying

Pushes to `main` auto-deploy via the Vercel Git integration. Manual fallback: `vercel deploy --prod --yes` from this folder.

## Key conventions

- `index.html` in this repo is the **canonical source** (mirrored from `C:\Users\dapat\Downloads\Prompt Builder data\` on the original machine).
- Prompt placeholders must match the replacement map byte-for-byte — run the in-app **🔧 Run Diagnostics** button after any template edit.
- Steps save/load research via the **Research Vault** (Google Drive folder per client) so any step can run in a fresh chat.

---
*Repo connected to Vercel auto-deploy on 2026-06-11.*
