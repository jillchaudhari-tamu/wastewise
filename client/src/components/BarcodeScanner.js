import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from "html5-qrcode";

const BarcodeScanner = ({ onScan }) => {
  const [hasScanned, setHasScanned] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (hasScanned) return;

    const config = {
      fps: 30,
      qrbox: { width: 300, height: 150 },
      aspectRatio: 1.333,
      facingMode: "environment",
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      formatsToSupport: [
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.EAN_8
      ]
    };

    scannerRef.current = new Html5QrcodeScanner("reader", config, false);

    scannerRef.current.render(
      (decodedText) => {
        setHasScanned(true);
        onScan(decodedText);
      },
      (error) => {
        if (error?.includes("No MultiFormat Readers were able to detect")) {
          console.log("Scanning...");
        } else {
          console.warn("Scan error:", error);
        }
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
