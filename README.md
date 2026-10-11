# CVS Scan & Explain — Kiosk

The Scan & Explain flow from the phone prototype ([cvsfeatureaixd.vercel.app](https://cvsfeatureaixd.vercel.app/)), redesigned for a 1920×1080 in-store touchscreen.

The kiosk is one self-contained page in `public/` (`kiosk.html`, `kiosk.css`, `kiosk.js`, and the `scan-explain/` assets). The Next.js app at `/` shows it full-screen in an iframe, the same setup as the phone prototype.

```bash
npm install
npm run dev
```

Open http://localhost:3000, or go to `/kiosk.html` to load the page directly.

## Flow

1. **Attract screen**: tap the shimmering *Tap to scan a product* button.
2. **Camera**: tap the shutter for a flash, then the scanning sheen with four progress steps, then the product page.
3. **Product**: *Description* (overview, used for, ingredients, directions, warnings) and *Explore Options* (Complete Your Routine, Compare your options, ratings).
4. **List +** / **Add to a list**: a bottom sheet with an on-screen keyboard to name the list. Then the *Added to…* sheet, then *View list*.
5. **Scan Another Product**: scans Cetaphil and adds it to the comparison table. **Compare Similar** adds CVS Health Cream.
6. **List**: quantity, remove, check items into *In basket*, collapse the basket, *Remove all*. A side panel shows aisles, an estimated total and a take-home code.

## Microinteractions (kept from the phone build)

- Pages slide in from the right (`.36s cubic-bezier(.3,.7,.2,1)`), and the previous page shifts left and dims.
- The camera flashes, then the scanning view swaps in place without a slide.
- The viewfinder corners breathe, the scan step bar fills step by step, and the progress card rises in.
- The tab thumb slides between Description and Explore Options.
- The bottom sheet slides up (`.42s cubic-bezier(.22,.9,.25,1)`) over a blurred scrim. You can drag the grabber down to dismiss it, and the name field shakes if you submit it empty.
- "Have it" pops when an item is added. A new comparison row is highlighted and scrolled into view. A toast confirms each action.

## Kiosk-only additions

- Type and touch targets are about 1.5× the phone sizes. The fixed 1920×1080 stage scales to fit any display.
- An on-screen keyboard and name suggestions for list names. A physical keyboard also works.
- **Start over** on every screen. After 90 s with no touch, a *Still there?* sheet appears, and the kiosk resets 15 s later.
- *Find it in store* (aisles and total) and *Take this list with you* on the list page. The QR code is decorative only.
