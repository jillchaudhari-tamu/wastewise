import React, { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const BarcodeScanner = ({ onScan }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 15,
      qrbox: { width: 250, height: 150 },
      aspectRatio: 1.777, // wide camera ratio
      disableFlip: true,
    });

    scanner.render(
      (decodedText) => {
        scanner.clear(); // stop scanner after 1 successful scan
        onScan(decodedText);
      },
      (error) => {
        // Suppress scan errors
        // console.warn("Scan error", error);
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2 text-center">Scan a Barcode</h2>
      <div
        id="reader"
        className="rounded-md overflow-hidden shadow-md mx-auto"
        style={{ width: "100%", maxWidth: "300px" }}
      ></div>
    </div>
  );
};

export default BarcodeScanner;
