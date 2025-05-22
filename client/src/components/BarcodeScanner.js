import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const BarcodeScanner = ({ onScan }) => {
  const [hasScanned, setHasScanned] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (hasScanned) return;

    scannerRef.current = new Html5QrcodeScanner("reader", {
      fps: 15,
      qrbox: { width: 250, height: 250 }, // larger area
      aspectRatio: 1.777,
      disableFlip: true,
    });

    scannerRef.current.render(
      (decodedText) => {
        setHasScanned(true);
        onScan(decodedText);
      },
      (error) => {
        // silent scan fail
      }
    );

    return () => {
      scannerRef.current?.clear().catch(() => {});
    };
  }, [onScan, hasScanned]);

  const resetScanner = () => {
    setHasScanned(false);
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2 text-center">Scan a Barcode</h2>
      <div
        id="reader"
        className="rounded-md overflow-hidden shadow-md mx-auto"
        style={{ width: "100%", maxWidth: "300px" }}
      ></div>
      {hasScanned && (
        <div className="text-center mt-4">
          <button
            onClick={resetScanner}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Scan Again
          </button>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
