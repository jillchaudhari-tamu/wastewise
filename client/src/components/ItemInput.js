import { useState } from "react";

export default function ItemInput({ onClassify }) {
  const [item, setItem] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (item.trim()) {
      onClassify(item);
      setItem("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center mt-6">
      <input
        type="text"
        placeholder="Enter an item (e.g. plastic cup)"
        value={item}
        onChange={(e) => setItem(e.target.value)}
        className="w-2/3 p-2 border rounded mb-2"
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Classify Item
      </button>
    </form>
  );
}
