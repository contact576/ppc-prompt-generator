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

### Tier 0 — Creative Persuasion Library ✅ SHIPPED 2026-08-01

> Built after a full creator-script production run (24 scripts, 3 offer structures, 4 verticals).
> The scripts worked because of persuasion decisions made for specific psychological reasons —
> reasons that previously lived only in a chat log. The generator was strong at deciding *what an
> ad is about* and had no library of *why certain moves persuade*, nor any step asking "which of
> these moves are available to THIS client, and did we use them?"
>
> Deliberately generalized: nothing in the library is PPC-Guru-specific. Examples span unrelated
> industries on purpose, and the blind EcoCare test (below) confirms zero client leakage.

**What shipped, all in `RAW_PROMPTS` P10 (template-only — no form changes, Bug class 6 not in play):**

| Piece | Where |
|---|---|
| **Section 9.5 — Creative Persuasion Library**: 10 elements (E1–E10), each with WHAT / WHY IT WORKS (the transferable mechanism) / PRECONDITION / FAILS WHEN | new section between §9 and §10 |
| **9.5.1 Hook taxonomy** — 7 hook types tagged by what each optimises for + audience temperature | 9.5.1 |
| **9.5.2 Default proof-led arc** — hook → offer → cut to proof → proof → division of labour → CTA | 9.5.2 |
| **9.5.3 ELEMENT FIT PASS** — mandatory; every element declared USED / NOT AVAILABLE (naming the missing fact) / AVAILABLE BUT OMITTED (with reason) | 9.5.3 |
| 5th ideation gate ("persuasion potential") + Fit Pass run at concept lock | Execution Step 3 |
| Fit Pass table + "client inputs needed to unlock" | Output Structure §03 |
| Hook-type declaration per script | Output Structure §03 concept block |
| 6 checklist rows | §14 Self-Validation + Final Execution Checks |
| **Persuasion Density** criterion + Fit Pass passed as auditor input (d) | `buildMasterPrompt` creative loop + sub-agent roster |

**The mechanism that makes it work:** the Fit Pass forces a declared outcome for every element, so
a lever the client actually had cannot be skipped silently. Explicitly *not* a score to maximise —
a 20-second cut cannot carry ten elements, and a justified omission is a correct answer.

**Also fixed — the live Before/After evidence gap.** §10.7 selection logic already refused
archetypes whose ingredient was missing (no real review = no Review Screenshot) but omitted
Before/After, while four other places actively recommended it. A client who recently switched
providers has no usable "before" — it sat in the previous provider's account. Absence of a
baseline is the DEFAULT for switchers. Now gated in the 10.7 selection logic, archetype #4, and
video framework #5.

**Verified:** backtick parity 0 · braces 1795/1795 · reconciler 0 orphans / 0 dead keys · all 4
in-app Diagnostics pass · P10 standalone 66.5k chars · master (5 steps) 198k chars, well under the
700k warn threshold · **blind EcoCare run: 12,250-char library section, zero PPC-Guru/vertical
leakage.**

**Companion asset (outside this repo):** `~/.claude/skills/ad-script/SKILL.md` — the
PPC-Guru-specific *instance* of this general library, for script work done outside the chain.
Keep the two in sync when either changes.

#### Remaining from Tier 0 (not built)

- **`f_proof_assets` + availability intake group** — the Fit Pass currently runs on model
  judgment. It would run on *data* if intake captured, once: can this client guarantee (and on
  what unit)? what proof assets exist? any real capacity limit? specialist or generalist? what
  does a prospect get from one call? Touches the form + `validateForm` +
  `updateConditionalSections` → Bug-class-6 sync risk, needs the full `qc-ppc-generator` 5-pass.
  *Deliberately deferred* — see whether judgment alone closes the gap first.
- **Live behavioural validation** — everything above is verified structurally. Nobody has yet run
  the new P10 through a real Claude session to confirm the Fit Pass output is actually useful.
  Do this on the next real client brief before trusting it.

---

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
- **Mechanical creator-safety gates** *(demoted from Tier 0 — real, but minor next to the
  persuasion library)*. The chain verifies storyboard word **coverage** (paste panel voiceovers
  back-to-back, confirm they equal the script) but never **speed or sayability**, which is how
  400–1700 wpm storyboards once shipped. Four one-way gates, since a shoot cannot be re-cut:
  (a) **pace** — words ÷ seconds × 60 must land 150–165, stated per panel; (b) **no [brackets] in
  spoken VO** — these templates use brackets as placeholders throughout, so a creator reading
  word-for-word will literally say "bracket, your industry"; (c) **numbers written as spoken** —
  "fifteen hundred dollars", not "$1,500+"; (d) **no dangling clauses** after an edit removes a
  promise's remedy. Plus a delivery-format rule: full VO block first, on-screen text second,
  never interleaved. Only matters when a human creator reads the script aloud — irrelevant for
  AI-avatar or voiceover-over-stock modes, so gate it on `[UGC_PRODUCTION_MODE]`.
- **Substantiation gate for performance claims** — any "or you don't pay" / "guaranteed" / hard
  number must name its counted unit (lead / qualified inquiry / booked job) or ship marked
  LAUNCH-BLOCKED. Partially covered by 9.5 E1's precondition; not yet a hard checklist gate.
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
