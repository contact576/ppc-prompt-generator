# PPC Generator — Session Record, QC Audit & Roadmap

> Durable offline record of the 2026-06 work session: what was built, what was fixed,
> the multi-agent QC verdict, and the prioritized roadmap of what was **proposed but not
> yet built**. Lives in the repo so it survives independently of any chat.

---

## 1. What this session changed (all shipped + deployed)

| Commit | Change |
|---|---|
| `3c425cc` | P8/P10 video storyboards upgraded 4-6 → **8-10 panels**, each with per-panel voiceover + on-screen text + audio cue (music/SFX/voice tone) + aspect ratio, plus a verbatim word-coverage rule. |
| `563db11` | **Claude Code orchestrated mode**: a runtime toggle (Claude Chat vs Claude Code) and a single **master prompt** (`buildMasterPrompt`) that wraps the selected steps for autonomous end-to-end execution — sub-agent QC roster, vault discipline, budget cap, Pass 1 approval gate, Phase B image upload, Pass 2 client doc, and the **creative-ad-auditor 90/100 gate** (every script auto-revised up to 3× until it scores ≥90 before a human sees it). |
| `8517143` | **Platform-separated step picker** (replaces the confusing bundle-grid + hidden custom-picker): platform chips (Meta / Google / Both), preset buttons (Full track new / existing+audit / Research / Audit / Recap), an always-visible grouped checklist, and a live selection summary. **Fixed the grayed-out Continue button.** |
| `4decad5` | **5 QC-surfaced bug fixes** (see §3). |
| `92bda19` | CLAUDE.md updated for the two-runtime architecture + picker. |

**Live:** https://ppc-master-prompt-generator.vercel.app (auto-deploys on push to `main`).

---

## 2. Multi-agent QC verdict (8 reviewers, 2026-06)

**Overall ≈ 72/100** — "very good, with a clear path to best-in-class." It's an excellent
*brief generator* that does not yet *close the loop* to real ad performance.

| Dimension | Score |
|---|---|
| Prompt-chain research quality | 78 |
| Orchestrator / master-prompt design | 78 |
| Technical robustness | 78 (critic: ~72) |
| Creative quality system | 74 |
| UX / operator-proofing | 72 (critic: ~65) |
| Innovation / missing features | 68 |
| Tool / MCP integration | 62 |

---

## 3. Bugs found & FIXED this session (commit `4decad5`)

1. **P10 misclassified as Google** (correctness bug on the creative path). P10 is the Meta
   Creative Production brief but `updateConditionalSections`/`validateForm` treated it as
   Google → the creative step shipped un-validated and revealed the wrong form section.
   Fixed: `hasMeta` includes p10, `hasGoogle` references p11, `hasCreative = p9 || p10`.
2. **Dangling Sequential/Standalone "Mode" row** in Claude Code (a live control its own text
   says is ignored) → now dimmed + disabled in Claude Code.
3. **`copyMasterPrompt` had no clipboard fallback** → silent stale-paste risk on a 230KB+
   payload. Added `execCommand` fallback + failure toast.
4. **Platform switch silently wiped hand-built selections** → now preserves in-scope picks;
   added preset-confirmation toasts.
5. **Load-time drift guard was console-only** (invisible to operators) → now also a toast.

---

## 4. ROADMAP — proposed, NOT yet built (ranked by leverage)

This is the "what could be better" list. Nothing here is started; each needs a green-light.

### Tier 1 — Close the learning loop (highest leverage; 3 reviewers converged here)
- **Account-data-first benchmarks.** Benchmarks in P4/P5 are web-guessed. Rule change:
  query the agency's own connected Meta/Google/Adzviser accounts FIRST; web search is
  fallback. Makes "Target CPL to Beat" real instead of generic. *(prompt change, medium)*
- **Performance Vault** — a persistent, cross-run ledger (2nd Drive folder) of each shipped
  creative + its real CPL/CTR/hook-rate, fed back into the creative scoring so the 90/100
  gate is calibrated to what actually converts for THIS agency. *(high effort, high value)*
- **P12 post-launch review** — pull the launched ad's real numbers 14-30 days out, grade
  prediction vs reality, write results back to the Performance Vault. *(medium)*

### Tier 2 — Make the creative gate predict scroll-stopping (not just compliance)
- **Feed the creative-ad-auditor the competitive context it's currently denied** (Step 2
  decoded hooks + Step 4 cheat codes) and add a scored "does this beat the best competitor
  ad?" criterion. *(prompt change, medium)*
- **Rubric-blind "cold-scroll" check** — a fresh agent sees the concept for ~1 second and
  reports the takeaway, with no knowledge of the rubric. Tests real stopping power. *(medium)*
- **Visual-hook decoding** (owner explicitly wanted this) — Step 7A only transcribes audio;
  add Gemini/keyframe vision to decode the competitor's VISUAL first second. *(medium)*
- **Multiple video story archetypes** (PAS / Demo / Listicle / Founder-POV) instead of one
  fixed 8-10 panel arc, with ≥2 per ad set — mirrors the static archetype variety rule.

### Tier 3 — Tooling & currency
- **Whisper is pinned to `base`** (lowest accuracy) on the chain's highest-value intel →
  bump to `small`/`medium` + `en`/`fr-CA` language hint. *(quick)*
- **Meta 2026 currency** — P4/P6 still frame strategy as "Broad vs Advantage+ vs Lookalike"
  (a 2023 model). Re-baseline to the Advantage+-default / Andromeda creative-volume paradigm.
- **Programmatic image generation** (image-gen MCP) with an in-loop render → re-audit →
  regenerate cycle, replacing the manual "paste into ChatGPT image gen" handoff.
- **Automated A/B hook-variant generation** off the existing auditor loop (3 hooks/script).
- **Higgsfield** video/avatar generation + virality predictor wired to the already-collected
  UGC-production-mode intake field (currently collected then ignored).
- **P3 (Google competitor intel) depth** — add Auction Insights / Search Impression Share +
  branded-term defense + competitor-derived negative keywords (P2 is much deeper than P3).
- **Voice-of-customer mining** — scrape review corpora/forums for the client's real pain
  language and feed it verbatim into creative (serves the 1-second rule directly).

### Tier 4 — Operational safety (the completeness critic's blind-spot finds)
- **Client confidentiality on a PUBLIC repo** — the form holds ~40 fields of named-client
  data; add a guard (notice + `.gitignore` + pre-commit name check) so no real client data
  is ever committed. The repo is public because Vercel Hobby requires it.
- **Master-prompt session resume + MCP pre-flight** — an unattended multi-hour run has no
  checkpoint and discovers a missing connector only mid-run. Add a session-start probe +
  vault-resume protocol.
- **Spend ledger** — make the $10 Apify cap an enforced running counter, not honor-system.
- **Bus-factor 1 / two-folder drift** — one non-developer owner manually syncs two index.html
  files; make `deploy-ppc-generator` the only sync path with an automated parity gate.

### Recommendation
**Do Tier 1 first.** It's the difference between "a very good prompt generator" and "an AI
creative system that compounds," and it directly serves the owner's only real metric (leads,
not rubric scores). Everything else is refinement.

---

## 5. Where the durable records live
- **Code + all changes:** git history (`contact576/ppc-prompt-generator`).
- **Architecture + bug classes + gotchas:** `CLAUDE.md`.
- **This session's narrative + roadmap:** this file (`ROADMAP.md`).
- **Full pre-compact chat transcripts:** `.claude/compact-backups/` (`.md` digests committed).
- **Cross-session memory (the owner's assistant memory):** `~/.claude/projects/…/memory/`.
