export default function DisposalResult({ result }) {
  if (!result) return null;

  const getColor = () => {
    if (result.includes("Recyclable")) return "text-green-700";
    if (result.includes("Compostable")) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="mt-6 p-4 bg-gray-100 border rounded w-2/3 mx-auto text-center">
      <h2 className="text-lg font-semibold">Classification Result:</h2>
      <p className={`text-2xl font-bold ${getColor()}`}>{result}</p>
    </div>
  );
}