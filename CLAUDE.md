# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-file (`index.html`, ~640 KB) browser app the PPC Guru agency uses to assemble an 11-step copy-paste prompt chain (P1–P11) for client paid-media research. The app itself does no research — it injects ~40 intake fields into prompt templates, validates everything, and pastes the prompts into a separate Claude chat (with Apify + Adzviser + Meta MCPs + Google Drive connector) that does the actual work and returns markdown reports. A built-in **Beautifier** then renders those reports into a branded client-facing PDF.

No build step. No framework. No dependencies. Open `index.html` in a browser and it just runs.

## Two-folder setup — IMPORTANT

There are **two `index.html` files** on the owner's machine. They drift constantly.

| Path | Role |
|---|---|
| `C:\Users\dapat\Downloads\Prompt Builder data\index.html` | **CANONICAL** — the owner edits this one directly |
| `C:\Users\dapat\Downloads\Prompt Generator\index.html` (this repo) | **DEPLOY COPY** — Vercel-linked, GitHub-tracked, must mirror the canonical at deploy time |

Edit the canonical first. Sync to the repo before committing. The `deploy-ppc-generator` skill (see Skills below) does this automatically — invoke it instead of doing the dance manually.

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
| `BUNDLES`, `PROMPT_INFO`, `DEPENDENCIES` | Run-order rules. `DEPENDENCIES` is authoritative — never let a template say it depends on a downstream step. |
| `_BEAUTIFIER_HTML` (~line 9381) | The entire Beautifier rendered HTML+CSS+JS as a single template literal. Care: escape `\`` and `\${` inside; doubled backslashes for regex literals. |
| `gmRenderToken`, `gmRenderChart` | Beautifier markdown-cue dispatcher (handles `:::chart`, `:::statstrip`, `:::timeline`, etc.). Any new `:::block-type` MUST get a case here AND in `GM_TOP_LEVEL_TYPES`. |
| `renderExecSummary`, `renderScripts`, etc. | Bespoke section renderers. **DANGER ZONE** — see "Bug classes" below. |
| `Research Vault` block in `buildPrompt` | Injects "save to Drive" footer in every prompt and "load from Drive" header in P6–P11. Lets steps run in fresh chats. |

## Bug classes worth knowing about (paid for in production)

1. **Bespoke section renderers silently discard unknown content.** Functions like `renderExecSummary` extract a few known markdown cues and return — anything they don't recognize vanishes from the rendered PDF. Any new `:::block-type` or `> [!CALLOUT]` added to a P8 prompt MUST be taught to the specific renderer it lands in, not just `gmRenderToken`. If unsure where it lands, render a test fixture that includes the new cue + deliberately-unknown content side-by-side and confirm both survive.

2. **Placeholder map drift.** Templates and the replacements map are two hand-maintained lists. The original "Meta Ad Library SEARCH URLs" bug was a one-word mismatch. The reconciler catches it now — never disable it, and check the browser console for orphan/dead-key warnings after editing either side.

3. **Downstream-step references in upstream prompts.** P8 once said "pull scripts from Step 10" while DEPENDENCIES correctly placed P8 before P10 → circular reference, P8 refused to run. Rule: a prompt's instructions can only reference steps in `DEPENDENCIES[its-own-id]`.

4. **PowerShell em-dash mojibake.** `Get-Content -Raw` guesses ANSI on PS5.1 and corrupts em-dashes. Always read this file with `[System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)`. If you see suspicious encoding issues, this is the cause 90% of the time.

5. **`get-dataset-items` field projection drops nested arrays** (Apify-specific, relevant when editing P2's scrape instructions). Use `omit` for bulky fields instead of `fields` selection.

## Verify before recommending or deploying

After any non-trivial edit to `index.html`, run these structural checks against the file:

```powershell
$p = "C:\Users\dapat\Downloads\Prompt Builder data\index.html"
$c = [System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8)
$bt = ($c.ToCharArray() | Where-Object {$_ -eq '`'}).Count
$esc = ([regex]::Matches($c, '\\`')).Count
"backtick parity: $(($bt - $esc) % 2) (must be 0)"
$open = ([regex]::Matches($c, '\{')).Count; $close = ([regex]::Matches($c, '\}')).Count
"braces: $open / $close (must match)"
```

Then open the local file in Chrome and click **🔧 Run Diagnostics** on the output page — that's the in-app reconciler + round-trip test.

The `qc-ppc-generator` skill encodes the full 5-pass audit (structural + placeholder + renderer-trap + TEST_DATA round-trip + live render smoke); invoke it before any deploy that touched `RAW_PROMPTS` or the Beautifier.

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

- 2026-06-30 16:35 - session activity
- 2026-06-30 15:56 - session activity
- 2026-06-30 15:15 - Few things: - Whatever we have right now, let's keep this, because if needed, we can use your chat as well, an [...]
- 2026-06-26 21:23 - But before changing anything, I just wanted to know your feedback. What do you suggest, or what is your opinio [...]
- 2026-06-23 23:49 - Please analyze this codebase and create a CLAUDE.md file, which will be given to future instances of Claude Co [...]
- 2026-06-23 23:46 - Check the vercel deploy task bljzy3ynr output and the Vercel project state via MCP to confirm whether the late [...]
- 2026-06-23 23:46 - session activity
- 2026-06-23 23:44 - now try I made that repo public. Now I think it should be fine.
- 2026-06-23 23:42 - is it done?
- 2026-06-23 23:40 - One-time setup (takes ~2 minutes): Log in to Vercel. In Claude Code, tell it: Run npx vercel login and wait fo [...]
<!-- AUTO-LOG:END -->

<!-- COMPACT-LOG:START -->
## Compact-context snapshots
<!-- Maintained automatically by the global PreCompact hook. Newest first, last 5 kept. Each entry = a full pre-compact transcript backup in .claude\compact-backups\. Do not edit between these tags. -->

- 2026-06-11 15:25 - manual compact - full transcript + digest saved: `.claude\compact-backups\2026-06-11_15-25-01_manual_3b3b464a.jsonl/.md`
<!-- COMPACT-LOG:END -->
