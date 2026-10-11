# CVS Scan & Explain — Kiosk

The Scan & Explain flow from the phone prototype ([cvsfeatureaixd.vercel.app](https://cvsfeatureaixd.vercel.app/)), redesigned for a 1920×1080 in-store touchscreen.

The kiosk is one self-contained page in `public/` (`kiosk.html`, `kiosk.css`, `kiosk.js`, and the `scan-explain/` assets). The Next.js app at `/` shows it full-screen in an iframe, the same setup as the phone prototype.

```bash
npm install
npm run dev
```

Open http://localhost:3000, or go to `/kiosk.html` to load the page directly.

## Flow

The kiosk has a built-in barcode scanner below the screen. Customers bring any product and scan it there, with no camera, and nothing is personalized or saved.

1. **Idle**: "Scan it here", with the red scan light pointing down to the scanner.
2. **Looking it up**: the barcode is read and the product appears with the AI sheen, then four timed progress steps.
3. **Product**: *Description* (overview, used for, ingredients, directions, warnings) and *Explore Options* (Complete Your Routine with aisle locations, Compare your options, ratings).
4. **Scan Another Product**: the customer scans a second item (Cetaphil), and it's added to the comparison table. **Compare Similar** adds CVS Health Cream.
5. **Start over** is on every screen. After 60 s with no touch, a *Still there?* sheet appears, and the kiosk resets 15 s later.

In the prototype, a tap stands in for the scanner. A real USB or Bluetooth scanner also works: it types the digits and then Enter.

## Microinteractions (kept from the phone build)

- Pages slide in from the right (`.36s cubic-bezier(.3,.7,.2,1)`), and the previous page shifts left and dims.
- A flash on scan, then the lookup. A compare scan swaps in place without a slide.
- The AI sheen over the product, the step bar filling, and the progress card rising in.
- The tab thumb slides between Description and Explore Options.
- A new comparison row is highlighted and scrolled into view. Toasts confirm actions.
- The *Still there?* bottom sheet slides up over a blurred scrim.

## Figma

The screens are also on the **Kiosk** page of the CVS Figma file, in iPad Pro 12.9" frames (1024×1366).
