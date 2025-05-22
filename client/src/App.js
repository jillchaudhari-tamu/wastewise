import Header from "./components/Header";
import ItemInput from "./components/ItemInput";
import DisposalResult from "./components/DisposalResult";
import BarcodeScanner from "./components/BarcodeScanner";
import { useState } from "react";

function App() {
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [lastScanned, setLastScanned] = useState("");
  const [log, setLog] = useState([]);

  const handleClassify = async (item) => {
    if (item.toLowerCase().includes("bottle")) {
      setResult("♻️ Recyclable");
    } else {
      setResult("🗑 Trash");
    }
  };

  const classifyWithOpenAI = async (prompt) => {
    try {
      const response = await fetch("http://localhost:5000/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      return data.result || "Trash";
    } catch (error) {
      console.error("OpenAI error:", error);
      return "Trash";
    }
  };

  const handleBarcodeScan = async (barcode) => {
    console.log("Scanned barcode:", barcode);
    setLastScanned(barcode);
    setError("");

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();

      if (data.status === 1) {
        const productName =
          data.product.product_name ||
          data.product.generic_name ||
          data.product.brands ||
          "Unnamed product";
        const packaging = data.product.packaging || "unknown packaging";

        const prompt = `Is "${productName}" with packaging "${packaging}" recyclable, compostable, or trash in most U.S. cities? Respond with only one word: Recyclable, Compostable, or Trash.`;

        const classification = await classifyWithOpenAI(prompt);
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
        setResult("🗑 Product not found");
        setError("Product not found. Try again?");
        setLog((prev) => [
          ...prev,
          {
            product: `Unknown barcode: ${barcode}`,
            classification: "Trash",
            time: new Date().toLocaleString(),
          },
        ]);
      }
    } catch (error) {
      console.error("API error:", error);
      setResult("Error fetching product info.");
      setError("Network error. Try again?");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <Header />
        <ItemInput onClassify={handleClassify} />
        <DisposalResult result={result} />

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


