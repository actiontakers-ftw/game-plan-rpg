# Game Plan RPG

A personal 2D life-sim RPG designed to bridge the real-world ↔ dopamine gap.
Built around the blueprint's three rules:

- **Health** → action for the physical body
- **Wealth** → mental performance
- **Relationships** → heart & soul

**Reward Logic (Dundee rule):** only inputs (logged real-world actions) grant
stat rewards in the game. Outputs reward you outside.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Controls

- **WASD / arrow keys** — move
- **E** — interact with the nearest object (Desk, Bed, Gym, etc.)
- **B** — download a JSON backup of your save
- **L** — load a backup file

## MVP actions

Positive: Deep Work, Gym, Meditate, Cook, Talk to Family, Sleep.
Negative (logged for honesty): Smoke, Doomscroll.

Back-to-back same-day Deep Work triggers an **SS** bonus — per the blueprint
note "SS only for B2B Deep Work".

## Save safety

- **Autosave** to `localStorage` after every action.
- **Schema versioning** with forward migrations: future game versions will
  *never* wipe your data; old saves are upgraded in place.
- **Export/Import** (keys **B** / **L**) gives you a portable backup file
  immune to browser cache clears, device switches, and incognito mode.

## Testing

```bash
npm test        # unit tests for Stats/Streak/Save systems
npm run typecheck
```

## Scope

This is the MVP foundation. The full blueprint includes more maps
(Gym interior, Work, Club, Parents', Sister's), NPCs, the remaining
actions, and the Road-to-12% progress arc — tracked for future versions.
