# PPC Generator — Session Record, QC Audit & Roadmap

> Durable offline record of the 2026-06 work session: what was built, what was fixed,
> the multi-agent QC verdict, and the prioritized roadmap of what was **proposed but not
> yet built**. Lives in the repo so it survives independently of any chat.

---

## 0c. Session record — 2026-07-11 (pre-launch QC + fast-follow batch)

> Full start-to-end QC before merging to main for team use. 3 read-only sub-agents (architecture,
> prompt-chain/domain, beautifier/learning-loop) + live Apify actor tests. No client data recorded.

**Scores:** Architecture & Reliability 88 · Prompt Chain & Domain Quality 88 · Beautifier + Rendering 83 ·
External Data Plumbing (Apify) 82 (post-fix) · **overall ~85/100.** Verdict: client-grade; cleared to merge
after the launch-blocker fix.

**Live actor tests (2026-07-11):**
- `curious_coder/facebook-ads-library-scraper` — healthy (99.8% success, not deprecated). Real scrape returned
  video ads with populated `snapshot.videos[].video_hd_url` (snake_case).
- **Launch-blocker found + fixed** (`b560ae8`): P2/Step 7A read camelCase `videoHdUrl`; actor returns snake_case
  `video_hd_url` → transcription would silently skip. Corrected both references + the actor-call example.
- `donjuan_mime/audio-video-to-text` — the $5/mo rental; live but audio-only, low-adoption, accepts only
  `{source_url, model}` (the `language` hint was being ignored). No cheap dedicated *visual* decoder exists.

**Fast-follow batch shipped this pass:**
- **Transcription upgraded** to a robust direct-URL + auto-language primary (`hgservices/speech-to-text` /
  `truefetch/video-to-text`), $5 actor demoted to fallback.
- **Native visual decode** added to Step 7A — orchestrator reads on-screen text / visual hook / format /
  visual proof from `video_preview_image_url` + sampled frames using its own multimodal vision, fused with the
  transcript. (This is the "visual decoder" — free, better than any $5 audio-only actor.)
- **Brain hardening:** concurrency-safe write (re-read + merge before write) + **sample-size gating** (thin run
  can't clobber a well-sampled median); `sample_size`/`window_days` added to schema.
- **evolution-log read-back** at STEP 0 (loop now learns process, not just numbers) + benchmark re-validation
  (>20% live-vs-cache drift → use live + refresh).
- **Team runtime standard = Claude Code** — now the default `f_runtime` (Chat demoted to "legacy").
- **CI gate** (`.github/workflows/qc.yml`) — brace/backtick/`node --check` on every push/PR.
- CLAUDE.md documents the Brain, folder-restriction requirement, and verified actor facts.
- Verified: backtick parity 0, braces 1807/1807, inline JS parses, master regenerates ~94K tokens, all
  learning-loop wiring checks pass.

**Deliberately deferred (routed to the weekly evolve-job / follow-up draft PR — cannot be render-tested headlessly, or are roadmap-scale):**
- Beautifier `renderExecSummary` / `renderNext` hardening (pass leftover content through instead of silent
  drop) — Low severity, needs a live browser render smoke test before shipping.
- **Creative-outcome → score feedback loop** (shipped creative → realized CPL/lead-quality feeding the 90-gate) —
  the agency's flagged #1 gap; still open, roadmap-scale.
- P5 static IS-target refinement + P4 expert-roster rebalance toward local-lead-gen — Low.

## 0b. Session record — 2026-07-09 (learning loop wired — the "Brain")

> Lightweight version of the Tier-1 learning loop, built after the owner confirmed the storage model.
> **No client-confidential data is recorded here — the repo is public.**

**What & why.** The orchestrator prompt is pasted into a *separate, sealed* Claude session (Drive + ad
connectors, no repo access), so nothing it learns can travel back on its own. The only shared, persistent
surface both the run session and any future session can reach is **Google Drive**. So Drive is the memory.

**Storage model (decided with owner).** One master Drive folder → a subfolder per client (operator selects
it per run, deliverables land there) **+ one fixed shared "Brain" folder** that every run reads/writes
regardless of which client folder was selected. The Drive connector sees the whole Drive, so "selecting a
client folder" is only an instruction about where deliverables go — the Brain is reached directly by its
folder **ID** (not name, to avoid collisions). Recommended (not yet done): move the master folder to a
Google **Shared Drive** so team access survives any one person's account.

**Created in Drive** (`_Prompt Generator Brain`, id `186o14Efv63ExoYYdg7Q-OYozu_jSQ-V5`, inside the owner's
master folder): `benchmark-cache.json` (real CPL/CPM/CTR by vertical+geo+platform), `evolution-log.md`
(per-run hurdle retrospective), `README.md` (team). All seeded empty of data.

**Wired into `buildMasterPrompt`** (id overridable via `f.f_brain_folder_id`):
- **ABSORB** — STEP 0 pre-flight gains **Section D "Brain read"**: open `benchmark-cache.json` first; if a
  fresh (<180d) entry matches the client vertical+geo, use it as the real "target to beat" (tagged
  `🧠 BRAIN BENCHMARK`) instead of a web guess. Brain unavailable → note + continue, never STOP.
- **EMIT** — new **FINAL STEP "Brain write"** (last section, after Pass 2): upsert the real own-account
  numbers observed this run into `benchmark-cache.json`, and append one retrospective entry to
  `evolution-log.md`. Aggregate only — no client names / no raw account IDs. Brain unreachable → skip + finish.
- Verified: backtick parity 0, braces 1805/1805, inline JS parses, master regenerates ~94K tokens with both
  Brain sections present and the write as the final section.

**Not yet built (next):** the weekly **evolve-job** — a scheduled Claude Code session on THIS repo that reads
`evolution-log.md` from the Brain, clusters recurring hurdles, and opens a **draft PR** improving the prompts
(owner-gated merge, not auto-merge). Also recommended: a proof-asset intake section so creative scripts clear
the 90 gate on the first pass (real rating/license/#installs/warranty/photo collected up front, never fabricated).

## 0. Session record — 2026-07-05/06 (reliability + accuracy + first real dogfood run)

> Work on branch `claude/pending-scope-improvements-lv323n` (PR #2). Direction: make the
> tool reliable + accurate for our OWN use (a month of real client runs), NOT commercialization.
> **No client-confidential data is recorded here — the repo is public.**

### Shipped
- **Creative-phase restructure (reliability, the biggest fix).** `buildMasterPrompt` now SPLITS the
  step chain and injects the Embedded Creative Audit Rubric + 90/100 gate + the single Pass-1 approval
  **between Step 8 (script authoring) and the steps that consume the scripts (P9/P11/P10)** — instead of
  appending them after the "END OF CHAIN" marker. This removes the old contradiction where the audit
  gate could be skipped, the human paused twice, or three "final" documents emitted. Phase B image
  upload + Pass 2 client doc still follow at the end. (Implementation: `stepBodies` returns `{pid,text}`
  objects; `chainThroughGate`/`chainAfterGate` split at P8 (or P10 if P8 absent); return array places
  the rubric/protocol/gate between the two halves.)
- **Account-data-first benchmarks (accuracy).** P4/P5 now query our own connected accounts via Adzviser
  (`list_workspace` + `retrieve_reporting_data`) for real CPL/CPM/CTR/CPA **before** web-guessing; web is
  fallback + sanity-check; aggregate-only output (never another client's name/figures). Pre-flight probes
  Adzviser for P4/P5 too.
- **P2 discovery-first + broader search URLs (from the live run).** Use the FREE native Meta
  `ads_library_search` for broad competitor discovery before any paid Apify scrape; keep keyword search
  URLs broad (one keyword, `media_type=all`); reserve `media_type=video` + `view_all_page_id` for the
  Phase-D deep scrape; temper the "impressions-sort = performance ranking" claim (the public Ad Library
  does not expose impressions for US/CA commercial ads).

### Dogfood live run — what we learned (validated with real MCPs, ~$0.03 Apify total)
- **The pipeline works end-to-end.** Native discovery returned 100+ real in-market competitors; the Apify
  page-scrape returned real structured competitor ad data (bodies, offers, formats) in seconds; the
  account-first benchmark returned the client's real cost-per-lead.
- **Real bug found & fixed:** a multi-keyword + `media_type=video` search URL returned **1 ad** vs. 100+
  from native discovery → drove the P2 discovery-first fix above.
- **The creative-audit gate works AS DESIGNED — and this is the key operating lesson.** Each script is
  scored per-script; the auto-revise loop lifts scripts on strategy (ours all passed the competitive gate
  using the real competitor decode); and **trace-or-stop correctly BLOCKS fabricating proof to reach 90.**
  So the 90 gate does **not** force fabrication or generic scripts. When a strong, research-driven script
  is capped below 90 by a **missing REAL proof asset** (a real install photo, star rating, license, or
  warranty), the correct behavior is to **surface it flagged and request the real asset — never invent
  one.** Practical implication: to consistently clear 90, the client must supply real proof points
  (rating + review count, TSSA/HRAI license, years/installs, warranty) and a real creative photo.

### Process lessons for future runs (operator + assistant)
- A "test run" is not the deliverable. When asked to run it, run the chain **through to the audited
  scripts** and stop at the Pass-1 human gate — don't halt at a plumbing check.
- Never hand over scripts that haven't passed the scored audit + the auto-revise loop first.
- Never suggest inventing proof (ratings/reviews) to lift a score — that violates trace-or-stop.

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
- ✅ **SHIPPED (2026-07)** — **Fed the creative-ad-auditor the competitive context it was
  denied** (Step 2 decoded hooks + Step 4 cheat codes) and added a scored **Competitive gate**
  ("Differentiated?" + "Beats the best competitor ad?") that caps craft-polished clones below
  90. Lives in `buildMasterPrompt`: Section 7 (protocol loop, now 6 steps), Section 5 (auditor
  roster I/O), Section 6 (authoritative rule), Section 8 (Pass 1 "Beats best rival" verdict).
- ✅ **SHIPPED (2026-07)** — **Made the master prompt device-independent (portability fix).**
  The `creative-ad-auditor` skill lived only on the owner's device, so employees pasting the
  master prompt into their own Claude Code sessions got degraded/divergent output. Fix: inlined
  everything the run depends on — a new **SUB-AGENT SPECIFICATIONS** section (all 6 agents fully
  specified) + an **EMBEDDED CREATIVE AUDIT RUBRIC** (the auditor's weighted criteria, hard caps,
  Competitive Gate, revision loop, Visual-Fidelity pass — built on the Step 8 Script Derivation
  Rules) + operating **rule 0** ("no pre-installed skills; inline spec is authoritative"). The
  prompt now needs only the MCP connectors, so any device produces the same quality. The embedded
  rubric was then **reconciled to the owner's real `creative-ad-auditor` SKILL.md (2026-07)**:
  the authoritative 11-criterion scorecard (total 100), the mandatory cold-audience clarity gate,
  the minimum-launch standards, and the static/video/copy framework anchors are inlined verbatim,
  with the Competitive Gate (fed by Step 2 decode + Step 4 cheat codes) layered on as a hard gate
  since the scorecard is already full — that gate is the piece the standalone skill was missing.
- **Rubric-blind "cold-scroll" check** — a fresh agent sees the concept for ~1 second and
  reports the takeaway, with no knowledge of the rubric. Tests real stopping power. *(medium)*
- **Visual-hook decoding** (owner explicitly wanted this) — Step 7A only transcribes audio;
  add Gemini/keyframe vision to decode the competitor's VISUAL first second. *(medium)*
- ✅ **SHIPPED (2026-07-03)** — **Multiple video story archetypes** (PAS / Demo / Listicle /
  Founder-POV / Testimonial-UGC) instead of one fixed 8-10 panel arc. P8 SCRIPT DERIVATION RULES
  gained a "video declares a STORY archetype" gate + a per-ad-set variety gate (≥2 videos ⇒ ≥2
  different archetypes, mirroring the static rule); the storyboard derivation now branches its
  panel arc on the declared archetype; P10 carries the archetype into the editor handoff; both
  Pass 1 and P10 checklists validate the variety rule.

### Tier 3 — Tooling & currency
- ✅ **SHIPPED (2026-07-03)** — **Whisper bumped `base` → `small` + language hint.** P2 Step 7A
  transcription now requests `model: "small"` with a `language` hint derived from `[GEOGRAPHY]`
  (`en`/`fr`…), with a graceful fallback to `base` if `small` is unavailable. Better word-error
  rate on the chain's highest-value intel (competitor scripts) with negligible added runtime.
- ✅ **SHIPPED (2026-07-03)** — **Meta 2026 currency re-baseline.** P4's audience sub-section and
  P6's audience-audit section were reframed from the 2023 "Broad vs Advantage+ vs Lookalike" menu
  to the **Advantage+-default → when-to-override** model, plus a **creative-volume ("Andromeda")**
  angle (variety is the optimization lever, not audience slicing). P6 now audits A+ adoption and
  creative-volume-per-ad-set as findings.
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
- **Programmatic image generation** (image-gen MCP) with an in-loop render → re-audit →
  regenerate cycle, replacing the manual "paste into ChatGPT image gen" handoff.
- **Automated A/B hook-variant generation** off the existing auditor loop (3 hooks/script).
- **Higgsfield** video/avatar generation + virality predictor wired to the already-collected
  UGC-production-mode intake field (currently collected then ignored).
- ✅ **SHIPPED (2026-07-03)** — **P3 (Google competitor intel) depth.** Added Source 4 (client's
  own-account **Auction Insights / Impression Share**, conditional on an existing account, with a
  budget-vs-rank loss read), **branded-term defense** (poaching check + client brand-defense check),
  and **competitor-derived negative keywords** (10–20 grounded in the excluded/irrelevant ads).
  New output sections 12–14 + checklist items. Brings P3 toward P2's depth.
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
