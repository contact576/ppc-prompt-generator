# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-file (`index.html`, ~670 KB) browser app the PPC Guru agency uses to assemble an 11-step prompt chain (P1–P11) for client paid-media research. The app itself does no research — it injects ~40 intake fields into prompt templates, validates everything, and the operator pastes the result into a separate Claude session (with Apify + Adzviser + Meta/Google Ads MCPs + Google Drive connector) that does the actual work and returns markdown reports. A built-in **Beautifier** then renders those reports into a branded client-facing PDF.

No build step. No framework. No dependencies. Open `index.html` in a browser and it just runs.

## Two runtimes — the central architecture fact

A top-of-page toggle (`f_runtime`) decides what the app *outputs*. This is the most important thing to understand before editing anything in the selection/output path:

- **Claude Chat** (`claude-chat`, default) — the original behavior: N separate per-step prompts the operator copies one at a time. `buildPrompt(p1)…buildPrompt(p11)` produce these. **Must stay byte-identical to historical output** — it's the proven path.
- **Claude Code** (`claude-code`) — ONE master prompt that wraps the selected step bodies for autonomous end-to-end execution in a Claude Code session, with embedded sub-agent QC + the `creative-ad-auditor` skill scoring every creative script ≥90/100 before a human sees it. Built by `buildMasterPrompt(f)` (dispatched from `buildPrompt('master')`).

`selectedPrompts` (the checklist selection) is the single source of truth in BOTH runtimes. Any edit to the selection or output pipeline must be reasoned about twice — once per runtime — and `runDiagnostics` smoke-tests both.

## Phase A selection model (platform-separated)

The step picker is organized by **platform**, because ~99% of runs are single-platform. Don't reintroduce the old "bundle grid + hidden custom picker" model — it was removed for being confusing.

- `pickPlatform('meta'|'google'|'both')` — filters the checklist groups (`.stage-group[data-track=…]`), drops out-of-scope checked steps but **preserves in-scope custom selections**, and loads a default only when nothing in scope remains.
- `applyPreset(kind)` — `new` / `existing` (+audit) / `research` / `audit` / `recap` / `clear`, computed per active platform by `presetSteps`.
- `refreshSelection()` — the core: reads checkboxes → `selectedPrompts` → enables/disables Continue (`#toFormBtn`) → updates the live summary. Call this after any selection mutation.
- Platform→step mapping lives in `META_STEPS` / `GOOGLE_STEPS` (module constants). **P10 = Meta** (Creative Production), **P11 = Google** (Build Spec) — this trips people up; see Bug class 6.

## Source of truth — THIS REPO (cutover 2026-06-30)

This repo's `index.html` is the **single source of truth**. Edit it directly here → commit → push → Vercel auto-deploys. There is no separate "canonical" file anymore.

**Repo location:** `C:\Users\dapat\Downloads\Github Repo (codex & Code)\Prompt Generator\`
(moved 2026-07 from `C:\Users\dapat\Downloads\Prompt Generator\` — the old path is dead; if any doc or skill still references it, fix the doc.)

> The old `C:\Users\dapat\Downloads\Prompt Builder data\` "canonical" folder is **RETIRED**. Do NOT edit or sync it. Its `index.html` was confirmed byte-identical to this repo at cutover, so nothing was lost. (That folder still holds internal strategy docs + stale build artifacts that were deliberately NOT pushed — the repo is PUBLIC.)

**Public-repo caution:** because Vercel Hobby requires the repo to be public, never commit client-confidential intake data or internal strategy/IP docs. Keep those out (or in a separate private repo).

## Deploy workflow

Push to `main` → Vercel auto-deploys to **https://ppc-master-prompt-generator.vercel.app** in ~20s. Repo is public on GitHub `contact576/ppc-prompt-generator` (Hobby plan requires public for auto-deploy — flipping it private without upgrading to Pro will break deploys).

When the auto-log Stop hook touches `CLAUDE.md`, commit that change in the same commit as code rather than leaving a dirty tree.

## Code map (single file — line numbers shift; use grep, not line numbers)

Search for these names with `Grep` to land on the right section of `index.html`:

| Symbol | Role |
|---|---|
| `RAW_PROMPTS` | The 11 prompt template strings (P1–P11). Editing these is the most common change. |
| `buildReplacements(pid, f)` | Returns `{placeholder: value}` map for a given prompt + form data. This is THE bridge between intake form and templates. |
| `buildPrompt(pid)` | Runs the literal `raw.split(key).join(value)` replacement and injects the Research Vault save/load blocks. |
| `INTENTIONAL_BRACKETS`, `INJECTABLE_RX` | Allowlist + regex for the placeholder reconciler. Brackets in templates fall in three classes: A injectables (must be replaced), B output-template (AI fills its own output), C context-fill (`[CURRENT MONTH]` etc.). |
| `reconcilePlaceholders()` | Runs at load. Logs orphan placeholders (token in template but no map key) and dead keys (map key in no template). The `SEARCH`-keyword bug class was killed by this. |
| `runPreFlightCheck`, `runDiagnostics` | Pre-flight is automatic before copy; Diagnostics is the user-clickable button on the output page. |
| `TEST_DATA`, `loadTestData()` | EcoCare fixture used by Diagnostics and for manual testing. |
| `BUNDLES`, `PROMPT_INFO`, `DEPENDENCIES` | Run-order rules. `DEPENDENCIES` is authoritative — never let a template say it depends on a downstream step. `BUNDLES` also holds the `out-*` outcome bundles used only by Diagnostics. |
| `buildMasterPrompt(f)` | Claude Code mode only. Assembles ONE master prompt: 10 sections (mission · operating rules · embedded intake · upfront interview · sub-agent roster · step chain · creative 90/100 protocol · Pass 1 gate · Phase B image upload · Pass 2 client doc). Concatenates step bodies via `buildReplacements` + strips per-step vault headers. |
| `stepsForOutcome(key, customSteps)` | Topo-sorts a step list against `DEPENDENCIES` (cycle-safe). `'out-custom'` uses the live checklist; named bundles use their `prompts`. Used by the master prompt + the selection summary. |
| `pickPlatform`, `applyPreset`, `presetSteps`, `refreshSelection`, `setStepChecked`, `describeSelection`, `META_STEPS`, `GOOGLE_STEPS` | The Phase A platform-separated picker (see "Phase A selection model"). |
| `updateRuntimeUI`, `renderMasterPromptCard`, `copyMasterPrompt` | Runtime toggle handler + the Claude Code output card. `updateConditionalSections` + `validateForm` both carry a platform→step map that must agree with `META_STEPS` (Bug class 6). |
| `_BEAUTIFIER_HTML` (~line 9400+) | The entire Beautifier rendered HTML+CSS+JS as a single template literal. Care: escape `\`` and `\${` inside; doubled backslashes for regex literals. |
| `gmRenderToken`, `gmRenderChart` | Beautifier markdown-cue dispatcher (handles `:::chart`, `:::statstrip`, `:::timeline`, etc.). Any new `:::block-type` MUST get a case here AND in `GM_TOP_LEVEL_TYPES`. |
| `renderExecSummary`, `renderScripts`, etc. | Bespoke section renderers. **DANGER ZONE** — see "Bug classes" below. |
| `Research Vault` block in `buildPrompt` | Injects "save to Drive" footer in every prompt and "load from Drive" header in P6–P11. Lets steps run in fresh chats. |

## Bug classes worth knowing about (paid for in production)

1. **Bespoke section renderers silently discard unknown content.** Functions like `renderExecSummary` extract a few known markdown cues and return — anything they don't recognize vanishes from the rendered PDF. Any new `:::block-type` or `> [!CALLOUT]` added to a P8 prompt MUST be taught to the specific renderer it lands in, not just `gmRenderToken`. If unsure where it lands, render a test fixture that includes the new cue + deliberately-unknown content side-by-side and confirm both survive.

2. **Placeholder map drift.** Templates and the replacements map are two hand-maintained lists. The original "Meta Ad Library SEARCH URLs" bug was a one-word mismatch. The reconciler catches it now — never disable it, and check the browser console for orphan/dead-key warnings after editing either side.

3. **Downstream-step references in upstream prompts.** P8 once said "pull scripts from Step 10" while DEPENDENCIES correctly placed P8 before P10 → circular reference, P8 refused to run. Rule: a prompt's instructions can only reference steps in `DEPENDENCIES[its-own-id]`.

4. **PowerShell em-dash mojibake.** `Get-Content -Raw` guesses ANSI on PS5.1 and corrupts em-dashes. Always read this file with `[System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)`. If you see suspicious encoding issues, this is the cause 90% of the time.

5. **`get-dataset-items` field projection drops nested arrays** (Apify-specific, relevant when editing P2's scrape instructions). Use `omit` for bulky fields instead of `fields` selection.

6. **Platform→step classification is duplicated across THREE places and must stay in sync.** `META_STEPS`/`GOOGLE_STEPS` (the picker), the `hasMeta`/`hasGoogle` arrays in `updateConditionalSections` (reveals form sections), and the same arrays in `validateForm` (required fields). A June 2026 bug had P10 (Meta Creative) classified as Google in two of them → the creative-production step shipped un-validated and revealed the wrong form section. When you add/move a step's platform, update all three.

7. **Master-prompt size is in CHARS, not tokens.** A full 11-step master is ~335k chars ≈ 84k tokens — well within Claude Code's window. Diagnostics/pre-flight thresholds are char-based (warn ~700k, fail ~900k). Don't "fix" a large master by capping at 200k chars (an earlier mistake that failed Diagnostics on legitimate full runs).

## Verify before recommending or deploying

After any non-trivial edit to `index.html`, run these structural checks against the file:

```powershell
$p = "C:\Users\dapat\Downloads\Github Repo (codex & Code)\Prompt Generator\index.html"   # the repo copy IS the source of truth now
$c = [System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8)
$bt = ($c.ToCharArray() | Where-Object {$_ -eq '`'}).Count
$esc = ([regex]::Matches($c, '\\`')).Count
"backtick parity: $(($bt - $esc) % 2) (must be 0)"
$open = ([regex]::Matches($c, '\{')).Count; $close = ([regex]::Matches($c, '\}')).Count
"braces: $open / $close (must match)"
```

Then open the local file in Chrome and click **🔧 Run Diagnostics** on the output page — that's the in-app reconciler + round-trip test.

The `qc-ppc-generator` skill encodes the full 5-pass audit (structural + placeholder + renderer-trap + TEST_DATA round-trip + live render smoke); invoke it before any deploy that touched `RAW_PROMPTS` or the Beautifier.

## Browser testing (Claude Preview)

`.claude/launch.json` + `.claude/previewserve.js` serve the repo on `127.0.0.1:8742` for the Claude Preview MCP. Drive the page with `preview_eval` to assert real DOM/JS state (this is how the platform picker, master-prompt build, and Diagnostics were verified). Two gotchas learned the hard way:

- **`loadTestData()` and `resetAll()` call `confirm()`** — a blocking modal freezes the renderer and makes every subsequent `preview_eval` time out. In tests, override first: `window.confirm = () => true; window.alert = () => {};`. If evals start timing out, a stuck modal is the cause, not your code — restart the preview server.
- `preview_screenshot` captures from the top regardless of scroll — verify below-the-fold elements with `preview_eval` (`offsetHeight`, computed state), not screenshots.

## Known gaps / roadmap (from the multi-agent QC audit, 2026-06)

Overall ~72/100. The highest-leverage missing piece (flagged independently by 3 reviewers): **no learning loop** — benchmarks are web-guessed instead of pulled from the agency's own connected Meta/Google/Adzviser accounts, and no record of which shipped creative actually drove leads feeds back into scoring. The `creative-ad-auditor` 90/100 gate is also self-referential (denied the competitor decode it should score against). Treat these as the next big bets, not bugs.

## Skills available (auto-trigger on natural language)

| Skill | Trigger phrases |
|---|---|
| `deploy-ppc-generator` | "deploy", "push it live", "ship the generator" |
| `qc-ppc-generator` | "QC the generator", "verify the prompts", "make sure I didn't break anything" |
| `decode-ads` | "decode ads in [niche]", "scrape competitor ads", "run the ad library funnel" |
| `wrap-session` | "wrap up", "save everything", "I'm done for the day" |

## Hooks (do not fight them)

- **Stop hook** (`~/.claude/hooks/update-claudemd.ps1`) — after every turn, appends a timestamped line to the `<!-- AUTO-LOG -->` block in this file. Keep the tags intact. Only the most recent 10 entries are retained.
- **PreCompact hook** (`~/.claude/hooks/precompact-save.ps1`) — before any `/compact`, copies the full transcript `.jsonl` to `.claude/compact-backups/` and writes a readable digest `.md`. The `.jsonl` files are gitignored (huge); the digests are committed.

## Out of scope for this repo

The SMM Virality Decoder is a **separate project** in a different repo at `C:\Users\dapat\Downloads\Social Media Decoder\`. Do not import its concepts or files into this codebase even if patterns look similar.

<!-- AUTO-LOG:START -->
## Auto session log
<!-- Maintained automatically by the global Stop hook. Newest first, last 10 kept. Do not edit between these tags. -->

- 2026-07-02 20:57 - Why do we have two different types of URLs, and that is causing an issue because we are updating and pushing i [...]
- 2026-07-02 20:34 - ?????????????????????????????????????????????????????????????????????????????????????????????????????????????? [...]
- 2026-06-30 17:07 - so this is running locally. Now can you create a repo with the same name and push everything that we have in a [...]
- 2026-06-30 17:03 - is everything updated on record? Is there anything missing? Not the records. I have updated everything. Can yo [...]
- 2026-06-30 16:57 - Please analyze this codebase and create a CLAUDE.md file, which will be given to future instances of Claude Co [...]
- 2026-06-30 16:47 - session activity
- 2026-06-30 16:35 - session activity
- 2026-06-30 15:56 - session activity
- 2026-06-30 15:15 - Few things: - Whatever we have right now, let's keep this, because if needed, we can use your chat as well, an [...]
- 2026-06-26 21:23 - But before changing anything, I just wanted to know your feedback. What do you suggest, or what is your opinio [...]
<!-- AUTO-LOG:END -->

<!-- COMPACT-LOG:START -->
## Compact-context snapshots
<!-- Maintained automatically by the global PreCompact hook. Newest first, last 5 kept. Each entry = a full pre-compact transcript backup in .claude\compact-backups\. Do not edit between these tags. -->

- 2026-06-11 15:25 - manual compact - full transcript + digest saved: `.claude\compact-backups\2026-06-11_15-25-01_manual_3b3b464a.jsonl/.md`
<!-- COMPACT-LOG:END -->
