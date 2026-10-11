// The kiosk is a self-contained page in /public (kiosk.html + kiosk.css + kiosk.js + scan-explain/ assets).
// It runs full-screen in an iframe so its fixed 1024×1366 (iPad Pro 12.9") stage can scale to the display.
export default function Home() {
  return (
    <main className="flex-1 bg-black">
      <iframe
        src="/kiosk.html"
        title="Scan & Explain — in-store kiosk prototype"
        className="block h-dvh w-full border-0"
      />
    </main>
  );
}
