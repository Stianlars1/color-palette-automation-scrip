# Color Palette Automation — Exact Radix Colors

Generate **exact Radix UI color scales** (12 light + 12 dark for both *accent* and *gray*) and ready-to-use CSS variables from a single **brand HEX**.

This tool automates the Radix Colors Custom page (in Chromium) using Playwright, fills your seed colour, then scrapes the resulting swatches so the output **matches Radix exactly**.

---

## Quick summary

- **Input:** one brand **accent** HEX (e.g. `#FFC8DD`)
- **Optional preview:** colour-theory preview (analogous / complementary / triadic / monochromatic)
- **Output:** exact Radix **accent** & **gray** scales (light & dark) and a ready CSS file
- **Exports:** `generated-palette.css` and `color-palette-preview.html`
- **Requires:** Node.js 18+ and Playwright (Chromium)

---

## Prerequisites

- Node.js 18 or newer  
- Internet access (the script loads `https://www.radix-ui.com/colors/custom` at runtime)  
- Playwright Chromium browser installed (one-time)

Install deps and Playwright:

```bash
npm install
npx playwright install chromium
```

---

## Usage

Run via the provided npm script or directly with `tsx`/`ts-node`:

```bash
# Example: using the npm script
npm run generate <hex> [scheme]

# Direct call (if you prefer)
tsx src/cli/cli.ts "<hex>" <scheme>
```

### Accepted inputs

* **HEX (required)** — must be one of:

    * `#RRGGBB` or `RRGGBB` (case-insensitive)
    * shorthand `#RGB` or `RGB` (expanded to `#RRGGBB`)
* **Special:** the literal `random` (causes the script to select an internal seed)
* **Scheme (optional)** — used for the *preview only*: `analogous` (default), `complementary`, `triadic`, `monochromatic`

### Examples

```bash
# Use a 6-digit hex
npm run generate "#FFC8DD"

# Omit the '#'
npm run generate ffc8dd

# With a preview scheme (preview only)
npm run generate "#EF4444" complementary

# Use the special 'random' option
npm run generate random analogous
```

---

## What the script produces

* **`generated-palette.css`** — CSS variables for light and dark themes:

    * Global tokens (background, foreground, primary, accent, etc.)
    * Accent steps: `--accent-1` … `--accent-12`
    * Gray steps: `--gray-1` … `--gray-12`
    * Dark mode block using `@media (prefers-color-scheme: dark)`

* **`color-palette-preview.html`** — visual preview to inspect swatches and hex values

The CLI also prints a friendly terminal summary showing the base colours and the extracted scales.

---

## Notes & behaviour

* The **preview (scheme)** is only a local, optional colour-theory hint. The final extracted scales always come from the Radix page after the script fills the inputs.
* If you pass the same seed with different schemes, extracted scales can be identical — that’s expected unless you change the inputs themselves.
* The special `random` value triggers an internal seed path (implementation detail).

---

## Debugging & troubleshooting

* **Playwright timeouts or stuck clicks:**
  Occasionally a dialog overlay on the Radix page can block swatch clicks. Re-run the script. If it happens often, increase Playwright timeouts or switch extraction to read swatch background styles (faster, more robust).

* **Slow runs in debug mode:**
  Use `npm run debug` to watch the browser (this enables `slowMo` and a headed browser). For faster runs, use the default `npm run generate`.

* **CI / server:**
  Many serverless platforms don’t allow launching browsers. If you plan to run this in CI or a server, use a VM/container with Playwright dependencies installed and `npx playwright install chromium` run during setup.

* **No internet:**
  The script requires the Radix page at runtime. It will not generate exact Radix scales offline.

---

## Output usage tips

* Copy the generated `generated-palette.css` into your codebase or import tokens into your design system.
* Use `color-palette-preview.html` to verify accessibility, contrast and visual balance before committing.

---

## License

MIT



---