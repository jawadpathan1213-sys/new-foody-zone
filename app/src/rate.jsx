import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";

const App = () => {
  const cards = ["Card A", "Card B", "Card C", "Card D"];

  // Final saved ratings (from localStorage)
  const [ratings, setRatings] = useState(() => {
    const saved = localStorage.getItem("ratings");
    return saved ? JSON.parse(saved) : Array(cards.length).fill(0);
  });

  // Temporary selected ratings (not yet submitted)
  const [tempRatings, setTempRatings] = useState(
    Array(cards.length).fill(0)
  );

  // Hover state as object: { cardIndex, value } or null
  const [hover, setHover] = useState(null);

  // Save to localStorage whenever ratings change
  useEffect(() => {
    localStorage.setItem("ratings", JSON.stringify(ratings));
  }, [ratings]);

  // Totals
  const total = ratings.reduce((sum, v) => sum + v, 0);
  const count = ratings.filter((r) => r > 0).length;
  const average = count > 0 ? (total / count).toFixed(2) : "0.00";

  const handleSubmit = (index) => {
    const newRatings = [...ratings];
    newRatings[index] = tempRatings[index]; // only save when submit clicked
    setRatings(newRatings);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-center mb-6">
        ⭐ Star Rating System (with Submit)
      </h1>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card, cardIndex) => (
          <div
            key={cardIndex}
            className="border p-4 rounded-xl shadow-sm flex flex-col items-center"
          >
            <h2 className="text-lg font-medium mb-2">{card}</h2>

            {/* Stars */}
            <div className="flex space-x-1 mb-2">
              {[...Array(5)].map((_, starIndex) => {
                const currentRate = starIndex + 1;

                // compute "active" level for this card:
                // if hovering this card -> hover.value
                // otherwise use tempRatings[cardIndex] (selected but not submitted)
                // otherwise fallback to saved ratings[cardIndex]
                const active =
                  hover && hover.card === cardIndex
                    ? hover.value
                    : tempRatings[cardIndex] || ratings[cardIndex];

                return (
                  <label key={starIndex}>
                    <input
                      type="radio"
                      name={`rating-${cardIndex}`}
                      value={currentRate}
                      onChange={() => {
                        const updated = [...tempRatings];
                        updated[cardIndex] = currentRate;
                        setTempRatings(updated);
                      }}
                      className="hidden"
                    />
                    <FaStar
                      size={25}
                      color={
                        currentRate <= active ? "#ffc107" : "#e4e5e9"
                      }
                      onMouseEnter={() =>
                        setHover({ card: cardIndex, value: currentRate })
                      }
                      onMouseLeave={() => setHover(null)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    />
                  </label>
                );
              })}
            </div>

            {/* Submit button */}
            <button
              onClick={() => handleSubmit(cardIndex)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1 rounded-full transition-colors"
            >
              Submit Rating
            </button>

            <p className="mt-2 text-sm text-gray-600">
              Saved: {ratings[cardIndex] || 0} / 5
            </p>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 text-center border-t pt-4">
        <h2 className="text-lg font-semibold">📊 Summary</h2>
        <p>Total Stars Given: {total}</p>
        <p>Total Rated Cards: {count}</p>
        <p>Average Rating: {average} / 5</p>
      </div>
    </div>
  );
};

export default App;
