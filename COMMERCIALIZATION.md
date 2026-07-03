# PPC Generator — Dogfood Test Run, QC Grade & Commercialization Plan

> A start-to-end evaluation run of the tool using **our own agency as the client** (a
> done-for-you PPC agency selling Meta+Google management to home-services owners), plus an
> honest assessment of what it takes to sell this. Durable record — lives in the repo.
> **No real client data appears in this file** (the repo is public).

---

## 1. What the test run actually did

1. **Generated a real orchestrator prompt** by driving the tool's own `buildMasterPrompt()`
   headlessly with a full intake for PPC Guru as the client, Claude Code runtime, all 11 steps,
   QC sub-agents ON. Result: a **single self-contained ~93K-token prompt** (373K chars) — well
   within Claude Code's window — with all 12 sections present: mission · operating rules · intake ·
   sub-agent roster + **full inline specs** · **inlined 100-point creative rubric** · the 11 step
   bodies · creative protocol · Pass-1 gate · Phase-B image upload · Pass-2 client doc.
2. **Verified the artifact is truly self-contained** — the embedded creative audit rubric,
   competitive gate, and all six sub-agent specs are inlined (portability contract holds; no
   pre-installed skill required).
3. **Placeholder health:** 118 leftover `[TOKENS]`, all expected class-B/C output-template
   values (`[URL]`, `[DATE]`, `[TIER-1]`, per-service loop vars) — zero injection failures.
4. **Live-validated the two fragile MCP links** (free/read-only calls):
   - **Meta Ad Library search works natively** — returned ~137 real competitor agency ads with
     hooks like *"1 Finished Job. 5 New Leads."* and *"How Home Service Contractors Scale Past
     $2M"*. → Step 2's *discovery* layer does **not** require paid Apify; Apify is only needed for
     the deep video **scrape + transcription** (the genuinely unique data).
   - **Adzviser is connected to a full book of live client accounts** (Meta + Google). → the
     "account-data-first benchmarks / learning loop" is **not hypothetical — the fuel already
     exists and is reachable today.**

---

## 2. The grade

Two separate axes — conflating them would mislead. "Quality of the process/output" is high;
"ready to sell to a stranger" is low. Both are true at once.

### A) Process & output quality — **~72 / 100** (pre-fix), lifting toward high-70s after this pass
Blend of two independent expert audits of the generated orchestrator:
- **Domain / paid-media quality: 74/100** — methodology is above agency SOP and 2026-current; capped by web-guessed benchmarks, local-consumer template rigidity, and creative homogenization.
- **Execution reliability: 55/100 (pre-fix)** — no hard crash/deadlock, but two structural defects dragged it down: the vault was **write-only during a run** (mid-run compaction silently guts late steps) and a **duplicated/contradictory creative-gate + deliverable phase**. **This pass fixes both** (in-session vault reload, creative-phase wiring, STOP disambiguation, unattended defaults, enforced spend ledger) — estimated post-fix reliability ~70.

**Strengths (genuinely above agency SOP, and 2026-current):**
- Competitor **decode funnel** (wide scrape → mechanical kill-filters → same-buyer test → deep
  scrape only the true competitors) + **video-ad transcription** (Whisper `small`) — real analyst
  discipline most agencies skip.
- **Advantage+ / "Andromeda" audience currency** — A+ as default with inputs as *suggestions*,
  lookalikes demoted, creative-variety as the optimization lever. Most templates are years behind here.
- **Google auction intel** — Impression Share + Lost-IS(Budget) vs Lost-IS(Rank) budget-vs-rank
  read, branded-term defense, competitor-derived negatives.
- **Fabrication defense** — trace-or-stop, numbers audit, red-team pass, and three QC sub-agents.
- **Creative engine** — 1-second rule, hook frameworks, static + video archetype variety, native-feel
  rule, competitive 90/100 gate.

**Caps (found by dogfooding an off-profile client):**
- **Template is hard-wired for LOCAL-CONSUMER verticals.** Running a B2B agency client through it
  force-fit empty "government rebate / insurance financing / weather-seasonality / named-consumer-
  persona" sections. *(Fixed this pass — see §4.)*
- **Benchmarks are web-guessed** even though the agency's own connected accounts hold the real
  numbers. The #1 quality gap (three reviewers converged here).
- **Creative homogenization vs premium positioning** — the mandatory service-noun-in-every-hook rule
  fights an explicit "premium, not cheap" brief.
- **The 90/100 "beats best rival" verdict was the model grading its own homework.** *(Hardened this
  pass — must now quote the rival ad it beats.)*
- Minor factual/currency nits: Ad-Library impression-sort overstated as a performance ranking for
  US/CA commercial ads; Advantage+ placements defaulted OFF (2022-era). *(Placements fixed this pass.)*

### B) Commercial readiness — **28 / 100**
The output is strong; the *product* is a pre-commercial "great internal tool." Blockers:
- **No way to charge and no moat.** One static `index.html` on a **public** Vercel Hobby repo — the
  entire IP (all 11 templates, the rubric, the orchestration) ships as plaintext anyone can fork.
  No auth, no accounts, no license gate, no payment wall.
- **Developer-grade onboarding** sold to agency owners: Claude Code + 5 MCP connectors (Apify paid,
  Adzviser paid, Meta, Google, Drive) + a big token plan, with **zero setup documentation** and an
  opaque cost stack.
- **Confidentiality + legal:** ~40 fields of named-client data flowing through a public-repo app,
  the `TEST_DATA` fixture pattern inviting a hardcoded real client, no DPA/privacy/retention posture
  for handling third parties' ad data (Canada/EU).
- **Reliability in a stranger's hands** degrades: quality leans on tacit owner knowledge, identity is
  hard-coded ("PPC Guru / Toronto / India team / home-services"), no unattended-run resume (added
  this pass), honor-system spend cap (enforced this pass).

---

## 3. Commercialization — my honest take

**Is it a good idea? Yes — but not as "sell the HTML."** The generator is a commodity the moment it's
public. Three things are actually valuable, in ascending order of defensibility:

1. **The prompt IP** (the 11-step chain + creative rubric) — good, but copyable. Weak moat.
2. **The packaged outcome** — a client-ready strategy + creative doc + branded PDF in hours. Showable,
   differentiated. This is the demo wedge.
3. **The proprietary performance data** — the agency's book of connected accounts (real CPLs, winning
   creative → actual leads). *This is the only real moat*, and the learning-loop roadmap is what turns
   it into compounding advantage. A competitor can fork the prompts; they can't fork your outcomes data.

**What to sell, and to whom (near-term):** a **done-with-you / productized service**, not SaaS. The hard
part for a buyer is exactly the onboarding (5 MCPs + Claude Code + tacit judgment), so sell **setup +
niche customization + the first 1–2 supervised runs** to an agency close to our own ICP (technical enough
to run Claude Code, same niche/geo, high Meta+Google creative volume). You're selling implementation +
expertise + the outcome — which sidesteps the no-moat problem entirely and earns the right to build
software later. **Not** a solo/non-technical marketer, and **not** self-serve SaaS today.

**The path to a real product (if the service validates demand):**
- Move the app behind auth on private hosting (kills the public-fork problem; requires Vercel Pro).
- Build the **learning loop** (account-data-first benchmarks + a Performance Vault) — the moat.
- De-couple the hard-coded PPC-Guru/Toronto/home-services identity into config so quality is
  repeatable for strangers.
- Add guided onboarding + cost calculator + a hosted run-runner so the buyer doesn't need Claude Code.

---

## 4. Fixes shipped this run (branch `claude/pending-scope-improvements-lv323n`)

Low-risk, high-leverage fixes the test run surfaced (both runtimes, verified: backtick parity 0,
braces balanced, JS parses, master regenerates at ~93K tokens):

1. **MCP pre-flight + resume + spend ledger (STEP 0 of the orchestrator).** Before Step 1 the run now
   probes exactly the connectors it needs (derived from the selected steps), fails fast with a specific
   "connect X" brief instead of dying two hours in; detects an interrupted run from the vault and
   **resumes** from the first missing step; and keeps an **enforced** Apify spend tally (no longer
   honor-system).
2. **Business-model classification (P1) + downstream adaptation (P4).** Step 1 now locks the client as
   LOCAL-CONSUMER / B2B / E-COMMERCE, and B2B/e-comm clients SKIP the rebate/insurance/weather-seasonality
   modules (targeting cost-per-booked-call instead) rather than emitting empty filler. Directly fixes the
   biggest dogfood failure.
3. **Creative-auditor anti-self-inflation.** "Beats best rival: YES" now REQUIRES quoting the specific
   rival ad (by name, verbatim hook) + one concrete reason it wins; unnamed → NO by default.
4. **Advantage+ placements default → ON** (2026 best practice; analyze via breakdowns), replacing the
   2022-era "default OFF."
5. **Client-confidentiality guard** — `.gitignore` now blocks the common client-data leak paths on the
   public repo.
6. **In-session vault RELOAD (not just save).** Operating Rule 2 now mandates reloading a prior step's
   vault file before using its exact figures/names/scripts, with a deterministic filename convention —
   closing the #1 silent-degradation path (mid-run auto-compaction eating late-step inputs). A
   RELOAD-ON-ENTRY line was added to all 10 inter-step transitions.
7. **Creative-phase wiring (resolves the dual Pass-1/Pass-2 contradiction).** The 90/100 creative gate
   now provably runs *at Step 8, before the single human approval*, and the post-"END OF CHAIN" block is
   reframed as reference executed during Step 8 — no double human pause, no ambiguous "final" document.
8. **STOP disambiguation + unattended defaults.** Rule 4 now separates hard-fail (retry→STOP) from
   empty/partial (note-and-continue); Step 9's runner-up question defaults to single-service in an
   unattended run instead of stalling.
9. **Sub-agents real, not role-played** — QC gates must spawn a separate agent and paste its raw
   scorecard ("a gate with no pasted output did not run"); the creative "beats best rival" verdict must
   quote the actual rival ad. Kills the QC-theater / self-grading risk.
10. **Enforced spend ledger** now counts video transcription (previously uncounted) toward the $10 cap.

*(Prior to this run, same branch: Whisper `base`→`small`, Meta 2026 audience currency, video story
archetypes, P3 Google depth.)*

---

## 5. Scope of improvement — ranked backlog (not yet built)

**Tier 1 — the moat (highest leverage):**
- Account-data-first benchmarks + Performance Vault + P12 post-launch review (the learning loop).
  *Fuel confirmed available (connected accounts). Heavy; deferred by owner for runtime cost — revisit
  as the commercialization moat.*

**Tier 2 — sellability blockers (before charging money):**
- A way to charge + protect IP (private hosting + auth, or pivot to hosted service).
- Guided onboarding: MCP connection walkthrough, account-ID capture, cost calculator.
- Legal posture: DPA / privacy policy / Drive-vault retention policy.

**Tier 3 — quality/repeatability:**
- De-couple hard-coded identity (brand/niche/geo) into config.
- Full B2B/e-commerce template branch (this pass adds conditioning; a full branch is deeper).
- Relax service-noun homogenization for premium positioning (≥1 authority/proof-led concept per ad set).
- Fix Step 3 scale-similarity filter vs Step 2 force-add of national competitors.
- Temper "longest-running = proven winner" and the Ad-Library impressions-sort heuristics.

**Tier 4 — resilience:** enforced spend ledger *(done)*, session resume + in-session vault reload
*(done)*, STOP disambiguation *(done)*. Remaining: fully **restructure** `buildMasterPrompt` so the
creative-production phase is assembled *inside* Step 8 rather than appended after the chain (this pass
adds strong wiring directives that mitigate the contradiction; the clean fix is structural), selective
(not all-at-once) vault reload on resume, and an automated repo parity/QC gate in CI.
