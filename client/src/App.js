import Header from "./components/Header";
import ItemInput from "./components/ItemInput";
import DisposalResult from "./components/DisposalResult";
import BarcodeScanner from "./components/BarcodeScanner";
import { useState, useRef } from "react";
import "./styles/scanner.css";


function App() {
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [lastScanned, setLastScanned] = useState("");
  const [log, setLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const retryCount = useRef(0);
  const MAX_RETRIES = 3;

  const classifyWithOpenAI = async (productName, packaging) => {
    const packagingInfo = packaging === "unknown packaging" ? "" : ` with packaging "${packaging}"`;
    const prompt = `As a waste classification expert, analyze "${productName}"${packagingInfo}. 
      Consider material composition and local recycling rules. 
      Should this be: Recyclable, Compostable, or Trash in most U.S. municipalities?
      Respond ONLY with one word: Recyclable, Compostable, or Trash.`;

    try {
      const response = await fetch("http://localhost:5000/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      return data.result || "Trash";
    } catch (error) {
      console.error("OpenAI error:", error);
      return "Trash";
    }
  };

  const handleClassify = async (item) => {
    setIsLoading(true);
    try {
      const classification = await classifyWithOpenAI(item, "manual input");
      setResult(`${classification} (${item})`);
      setLog((prev) => [
        ...prev,
        {
          product: item,
          classification,
          time: new Date().toLocaleString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarcodeScan = async (barcode) => {
    console.log("Scanned barcode:", barcode);
    setLastScanned(barcode);
    setError("");
    setIsLoading(true);

    try {
      if (retryCount.current >= MAX_RETRIES) {
        setError("Maximum retries reached. Try manual input.");
        return;
      }

      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();

      if (data.status === 1) {
        retryCount.current = 0;
        const productName =
          data.product.product_name ||
          data.product.generic_name ||
          data.product.brands ||
          "Unnamed product";
        const packaging = data.product.packaging || "unknown packaging";

        const classification = await classifyWithOpenAI(productName, packaging);
        setResult(`${classification} (${productName})`);
        setLog((prev) => [
          ...prev,
          {
            product: productName,
            classification,
            time: new Date().toLocaleString(),
          },
        ]);
      } else {
        throw new Error("Product not found");
      }
    } catch (error) {
      console.error("API error:", error);
      retryCount.current += 1;
      
      if (retryCount.current < MAX_RETRIES) {
        setTimeout(() => handleBarcodeScan(barcode), 1000);
        setError(`Retrying... (${retryCount.current}/${MAX_RETRIES})`);
      } else {
        setResult("🗑 Product not found");
        setError("Product not found. Try manual input?");
        setLog((prev) => [
          ...prev,
          {
            product: `Unknown barcode: ${barcode}`,
            classification: "Trash",
            time: new Date().toLocaleString(),
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <Header />

        <DisposalResult result={result} />

        {isLoading && (
          <div className="text-center mt-4 text-gray-600">Analyzing...</div>
        )}

        {error && (
          <div className="text-red-600 text-center mt-2">
            <p>{error}</p>
            <button
              onClick={() => handleBarcodeScan(lastScanned)}
              className="mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
            >
              Retry Scan
            </button>
          </div>
        )}

        <BarcodeScanner onScan={handleBarcodeScan} />

        {/* Fallback Manual Input */}
        <div className="mt-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Manual Classification</h3>
          <p className="text-sm text-gray-600 mb-2">Not sure about a product? Type it in:</p>
          <ItemInput onClassify={handleClassify} />
        </div>

        {/* Waste Totals */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="bg-green-100 p-2 rounded">
            <div className="text-xl font-bold">
              {log.filter((i) => i.classification.includes("Recyclable")).length}
            </div>
            <div className="text-sm">Recycled</div>
          </div>
          <div className="bg-yellow-100 p-2 rounded">
            <div className="text-xl font-bold">
              {log.filter((i) => i.classification.includes("Compostable")).length}
            </div>
            <div className="text-sm">Composted</div>
          </div>
          <div className="bg-red-100 p-2 rounded">
            <div className="text-xl font-bold">
              {log.filter((i) => i.classification.includes("Trash")).length}
            </div>
            <div className="text-sm">Trashed</div>
          </div>
        </div>

        {/* Scan History */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Scan History</h3>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {log.map((item, idx) => (
              <li key={idx} className="bg-gray-100 p-2 rounded shadow-sm">
                <div className="font-medium">{item.classification}</div>
                <div className="text-sm text-gray-600">{item.product}</div>
                <div className="text-xs text-gray-500">{item.time}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;