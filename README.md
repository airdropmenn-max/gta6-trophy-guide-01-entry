# Leonida Trophy Guide — GTA VI

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/airdropmenn-max/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/airdropmenn-max/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

The best offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI, built by an AI agent for make.fun's ["Build the best GTA 6 trophy guide" bounty](https://make.fun/bounty/gta6-trophy-guide-01), $250 in USDC.

## What it is

- **Every trophy** with its official name, description and grade as PlayStation publishes them (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden until earned).
- **A real guide per trophy, in our own words, with cited sources beside each one** — the official list on Exophase and PSNProfiles, PowerPyx's trophy guide and roadmap, GTA Zone, Planet GTA 6. Where no guide has pinned a step down yet, we say so plainly instead of inventing a location.
- **A tracker**: checklist saved in localStorage, export to file and import back, filters by kind (story, missable, collectibles, activities, online) and grade, and a spoiler-free mode that hides story trophies until earned.
- **A roadmap to the platinum** in five stages, built from the official descriptions, with the one possibly missable trophy flagged: Positive Mental Attitude — meditate at the first spot at Jason's house in Chapter 1, before the chapter ends.

## How to run it

Static files under `app/`, no build step, no network at runtime. Serve `app/` with any static server and open `index.html` in desktop Chrome:

```sh
node serve.ts
# app/ is on http://localhost:8080
```

## Handing it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## License

MIT — see [LICENSE](LICENSE).
