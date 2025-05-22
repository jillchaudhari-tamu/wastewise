import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef } from "react";

export default function BarcodeScanner({ onScan }) {
  const scannerRef = useRef(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    const scannerId = "reader";
    const scanner = new Html5Qrcode(scannerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 15, qrbox: { width: 200, height: 150 } },
        (decodedText) => {
          console.log("Scanned:", decodedText);
          onScan(decodedText);

          // only stop if running
          if (isRunningRef.current) {
            scanner
              .stop()
              .then(() => {
                scanner.clear();
                isRunningRef.current = false;
              })
              .catch((e) => console.error("Stop error:", e));
          }
        },
        (err) => {}
      )
      .then(() => {
        isRunningRef.current = true;

        // Optional: resize the video
        const videoEl = document.querySelector(`#${scannerId} video`);
        if (videoEl) {
          videoEl.style.width = "250px";
          videoEl.style.height = "250px";
          videoEl.style.objectFit = "cover";
          videoEl.style.borderRadius = "8px";
        }
      })
      .catch((err) => console.error("Scanner start failed:", err));

    return () => {
      if (scannerRef.current && isRunningRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current.clear();
            isRunningRef.current = false;
          })
          .catch((e) => console.error("Cleanup stop error:", e));
      }
    };
  }, [onScan]);

  return (
    <div className="flex flex-col items-center mt-6">
      <h2 className="text-xl font-semibold mb-2">Scan a Barcode</h2>
      <div id="reader" className="border" style={{ width: "250px", height: "250px" }}></div>
    </div>
  );
}

