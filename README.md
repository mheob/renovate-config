# Renovate Config

[Shareable config presets](https://docs.renovatebot.com/config-presets/) for
[Renovate](https://www.mend.io/renovate/), curated by [mheob](https://github.com/mheob).

One line in your repository gives you sensible defaults for dependency updates: semantic commits, grouped non-major PRs, pinned
GitHub Action digests, a monthly lock file refresh, and a scheduled cadence that keeps the noise down.

```json
{
	"$schema": "https://docs.renovatebot.com/renovate-schema.json",
	"extends": ["github>mheob/renovate-config"]
}
```

## Table of contents

- [Why Renovate](#why-renovate)
- [Getting started](#getting-started)
- [What the default preset does](#what-the-default-preset-does)
- [Preset reference](#preset-reference)
- [Customizing](#customizing)
  - [Disabling single presets](#disabling-single-presets)
  - [Composing your own preset](#composing-your-own-preset)
  - [Large or noisy projects](#large-or-noisy-projects)
  - [Small projects with strong CI](#small-projects-with-strong-ci)
- [Contributing](#contributing)
- [License](#license)

## Why Renovate

Keeping dependencies up to date by hand means repeating this loop forever:

1. Find out which dependencies are outdated.
2. For each one, read the release notes, changelog and diff.
3. Open a PR with enough context for the team to review.
4. Group related PRs so reviewers are not buried under hundreds of them.
5. Resolve the lock file conflicts that every one of those PRs creates.
6. Dedupe the lock file afterwards, so you do not end up with two copies of a library such as `react` in the same render tree.
7. Start over.

Renovate does all of that. This repository is the opinionated configuration layer on top of it.

## Getting started

1. Install Renovate. The easiest way is the [GitHub App](https://github.com/marketplace/renovate). Alternatives are the
   [Docker image](https://hub.docker.com/r/renovate/renovate) or a
   [self-hosted instance](https://www.mend.io/free-developer-tools/renovate/on-premises/).
2. Grant it access to your repository. It will open a PR titled `Configure Renovate` on your default branch.
3. Add the config to your repository. This preset onboards into `.github/renovate.json`, but Renovate also accepts
   `renovate.json`, `.renovaterc.json` or a `renovate` key in `package.json`:

   ```json
   {
   	"$schema": "https://docs.renovatebot.com/renovate-schema.json",
   	"extends": ["github>mheob/renovate-config"]
   }
   ```

4. Once Renovate opens an issue titled **Dependency Dashboard**, you are set. With the hosted GitHub App this takes a few
   minutes; a self-hosted instance may take longer.

## What the default preset does

`github>mheob/renovate-config` resolves to [`default.json`](default.json), which is a composition of the presets in this
repository:

```json
{
	"$schema": "https://docs.renovatebot.com/renovate-schema.json",
	"extends": [
		"github>mheob/renovate-config:base",
		"github>mheob/renovate-config:semantic-commit-type",
		"github>mheob/renovate-config:security",
		"github>mheob/renovate-config:strategy",
		"github>mheob/renovate-config:labels",
		"github>mheob/renovate-config:lock-file-maintenance",
		"github>mheob/renovate-config:node-lts",
		"github>mheob/renovate-config:schedule",
		"github>mheob/renovate-config:group-non-major",
		"github>mheob/renovate-config:pin-github-actions",
		"github>mheob/renovate-config:ignore-recommended",
		"github>mheob/renovate-config:dedupe"
	],
	"onboardingConfig": {
		"$schema": "https://docs.renovatebot.com/renovate-schema.json",
		"extends": ["github>mheob/renovate-config"]
	},
	"onboardingConfigFileName": ".github/renovate.json"
}
```

`branding` is not listed there because [`base`](base.json) already extends it.

In practice this means:

- Non-major updates are grouped into a single **all non-major dependencies** PR, package managers excluded.
- Major updates get their own PR, one per major version, labelled `major ⚠️`.
- Every PR is labelled `deps 📦` and `bot 🤖`, and uses conventional commit messages (`fix(deps):`, `chore(deps):`).
- Releases must be at least three days old before an update is proposed.
- Third-party GitHub Actions are pinned to a commit digest and require dashboard approval.
- Production dependencies run weekly, dev dependencies and lock file maintenance monthly, all in `Europe/Berlin`.
- Lock files are deduped after every update.

## Preset reference

Each preset can be extended on its own via `github>mheob/renovate-config:<name>`.

| Preset                                                       | What it does                                                                                                                              |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [`base`](base.json)                                           | `config:recommended` plus semantic commits, config migration PRs, separate PRs per major version, and internal monorepo dependency updates. |
| [`branding`](branding.json)                                   | Adds a footer to PRs and a header to the Dependency Dashboard pointing back at this preset. Pulled in by `base`.                            |
| [`dedupe`](dedupe.json)                                       | Dedupes lock files after updates for npm, pnpm and Yarn.                                                                                   |
| [`group-non-major`](group-non-major.json)                     | Groups every update type except major into one PR. Package managers (`npm`, `pnpm`, `yarn`) stay separate.                                 |
| [`ignore-recommended`](ignore-recommended.json)               | Placeholder list of dependencies that are too noisy to maintain automatically. Empty by default.                                           |
| [`labels`](labels.json)                                       | Labels PRs `deps 📦` and `bot 🤖`, major updates additionally `major ⚠️`, and the dashboard issue `bot 🤖`.                                 |
| [`lock-file-maintenance`](lock-file-maintenance.json)         | Refreshes lock files on the first day of the month, behind dashboard approval.                                                             |
| [`node-lts`](node-lts.json)                                   | Keeps CI images on the latest Node.js LTS by capping updates at `<=24`, unscheduled.                                                       |
| [`pin-github-actions`](pin-github-actions.json)               | Pins GitHub Action digests while keeping the human-readable SemVer tag visible.                                                            |
| [`schedule`](schedule.json)                                   | Dependencies weekly before 3am Monday, dev dependencies and lock file maintenance monthly, engines monthly. Timezone `Europe/Berlin`.       |
| [`security`](security.json)                                   | Requires a `minimumReleaseAge` of three days and pins digests of third-party Actions behind dashboard approval.                            |
| [`semantic-commit-type`](semantic-commit-type.json)           | Runtime dependencies commit as `fix(deps)`, everything else as `chore(deps)`, lock file only updates as `chore(lockfile)`.                  |
| [`strategy`](strategy.json)                                   | `bump` for dependencies and devDependencies, `widen` for engines and peerDependencies, `in-range-only` for overrides.                       |

The `security` preset trusts a small allow list of Action publishers (`actions`, `github`, `google-github-actions`,
`googleapis`, `pnpm`, `sanity-io`, `useblacksmith`) and does not force digest pinning on them.

## Customizing

### Disabling single presets

If you agree with most of the defaults but not all, use `ignorePresets`:

```json
{
	"$schema": "https://docs.renovatebot.com/renovate-schema.json",
	"extends": ["github>mheob/renovate-config"],
	"ignorePresets": ["github>mheob/renovate-config:branding", "github>mheob/renovate-config:labels"]
}
```

### Composing your own preset

You can also skip `default` entirely and pick only the pieces you want:

```json
{
	"$schema": "https://docs.renovatebot.com/renovate-schema.json",
	"extends": [
		"github>mheob/renovate-config:base",
		"github>mheob/renovate-config:security",
		"github>mheob/renovate-config:labels"
	]
}
```

### Large or noisy projects

On a large monorepo with many outdated dependencies and many contributors, the defaults can still produce too much traffic.
Switch to a manual, granular mode:

```json
{
	"$schema": "https://docs.renovatebot.com/renovate-schema.json",
	"extends": ["github>mheob/renovate-config", ":dependencyDashboardApproval"],
	"ignorePresets": ["github>mheob/renovate-config:group-non-major"]
}
```

Renovate now only opens a PR once someone ticks a specific dependency in the Dependency Dashboard issue. Dropping
`group-non-major` lists dependencies individually instead of collapsing every patch and minor update into one large PR.

### Small projects with strong CI

With a short backlog and reliable CI you can go the other way and let non-major dev dependency updates merge themselves:

```json
{
	"$schema": "https://docs.renovatebot.com/renovate-schema.json",
	"extends": ["github>mheob/renovate-config"],
	"packageRules": [
		{
			"automerge": true,
			"matchDepTypes": ["devDependencies"],
			"matchUpdateTypes": ["minor", "patch"]
		}
	]
}
```

Only enable automerge if the repository requires passing checks (and ideally review approval) before merging. Otherwise a
broken release lands on your default branch unattended.

## Contributing

Presets are plain JSON files at the repository root; the file name is the preset name. When adding one:

- Include `"$schema": "https://docs.renovatebot.com/renovate-schema.json"`.
- Add a `description` field explaining what the preset does — Renovate surfaces it in PRs and on the dashboard.
- Add it to the [preset reference](#preset-reference) table, and to [`default.json`](default.json) if it should be on by default.
- Formatting follows [`.editorconfig`](.editorconfig): tabs, LF, final newline.

Validate a change before opening a PR. Passing the files explicitly is required, since the validator only auto-discovers
Renovate's own config file names:

```sh
npx --yes --package renovate -- renovate-config-validator --strict $(find . -maxdepth 1 -name '*.json' ! -name 'package.json')
```

Explicitly passed files are checked as global config, so repository-only options are not flagged, but schema errors and
invalid schedules are.

## License

[MIT](LICENSE) © [Alexander Böhm](https://github.com/mheob)
