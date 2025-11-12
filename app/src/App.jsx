import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";

const FoodCard = ({ elm, initialRating, onSubmitRating }) => {
  const [hover, setHover] = useState(null);
  const [tempRating, setTempRating] = useState(initialRating ?? 0);

  useEffect(() => {
    setTempRating(initialRating ?? 0);
  }, [initialRating]);

  const handleSubmit = () => {
    const cleanId = (elm.id ?? elm._id ?? "").toString().trim();
    if (!cleanId) return;
    onSubmitRating(cleanId, Number(tempRating));
    setHover(null);
  };

  return (
    <div className='flex flex-col md:flex-row justify-center md:justify-start w-[200px] md:w-[305px] md:h-[190px] h-[300px] xl:w-[400px] xl:h-[200px] backdrop-blur-[7px] bg-white/10 rounded-2xl p-2 border border-gray-400 relative'>
      <div className='flex justify-center p-1'>
        <img
          src={
            elm.image?.startsWith("http")
              ? elm.image
              : `http://localhost:9000${elm.image}`
          }
          alt={elm.name}
          className='rounded-full h-[120px] w-[120px] md:h-[130px] md:w-[130px] object-cover'
        />
      </div>

      <div className='flex flex-col justify-center md:justify-start text-center gap-2 p-2 flex-1'>
        <h1 className='text-white font-semibold'>{elm.name}</h1>
        <p className='text-gray-300 text-[12px]'>{elm.text}</p>

        <div className='flex items-center justify-center md:justify-start space-x-1'>
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              size={18}
              color={star <= (hover ?? tempRating) ? "#ffc107" : "#e4e5e9"}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setTempRating(star)}
              className='cursor-pointer transition-transform hover:scale-110'
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          className='self-center md:self-start bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded'
        >
          Submit Rating
        </button>

        <p className='text-gray-300 text-[12px]'>
          Saved: {initialRating ?? 0} / 5
        </p>
      </div>

      <button className='text-white text-[14px] bg-red-500 py-0.5 px-[5px] absolute bottom-2 right-2 rounded-[5px]'>
        ${elm.price}.00
      </button>
    </div>
  );
};

const App = () => {
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [links] = useState(["All", "Breakfast", "Lunch", "Dinner"]);

  const [ratings, setRatings] = useState(() => {
    try {
      const raw = localStorage.getItem("foodRatings");
      if (!raw) return {};
      const parsed = JSON.parse(raw);

      // remove garbage keys
      const cleaned = Object.fromEntries(
        Object.entries(parsed).filter(
          ([k]) => k.trim() && k !== "undefined" && k !== "null"
        )
      );

      return cleaned;
    } catch {
      return {};
    }
  });
  console.log('ratinggggggggggg', ratings)

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await fetch("http://localhost:9000/");
        const data = await res.json();

        const normalized = (data || []).map((f, i) => {
          const id = (f.id ?? f._id ?? i).toString().trim();
          return { ...f, id };
        });

        setFoods(normalized);
        setFilteredFoods(normalized);
      } catch (err) {
        console.error("API Error:", err);
      }
    };
    fetchFoods();
  }, []);

  useEffect(() => {
    localStorage.setItem("foodRatings", JSON.stringify(ratings));
  }, [ratings]);

  const handleFilter = (type) => {
    if (type === "All") setFilteredFoods(foods);
    else
      setFilteredFoods(
        foods.filter((x) => x.type.toLowerCase() === type.toLowerCase())
      );
  };

  const handleSearch = (e) => {
    const val = e.target.value.toLowerCase();
    setFilteredFoods(
      foods.filter(
        (f) =>
          f.name.toLowerCase().includes(val) ||
          f.type.toLowerCase().includes(val)
      )
    );
  };

  const handleSubmitRating = (id, value) => {
    const key = String(id ?? "").trim();

    if (!key || key === "undefined" || key === "null") return;

    setRatings((prev) => ({ ...prev, [key]: Number(value) || 0 }));
  };

  const totalStars = Object.values(ratings).reduce(
    (a, b) => a + (Number(b) || 0),
    0
  );
  const ratedCount = Object.values(ratings).filter((r) => Number(r) > 0).length;
  const avgRating =
    ratedCount > 0 ? (totalStars / ratedCount).toFixed(1) : "0.00";

  return (
    <div className='overflow-x-hidden m-0 p-0'>
      <div className='bg-[#403e39] h-[190px]'>
        <div className='flex flex-col'>
          <div className='flex flex-col items-center md:flex-row justify-between gap-6 mx-[8vw] my-8 md:my-13'>
            <img src='/foody.svg' alt='' className='w-[180px] md:w-[200px]' />
            <input
              onChange={handleSearch}
              type='text'
              placeholder='Search Food....'
              className='border rounded-[5px] border-red-500 px-3 py-[3px] text-white placeholder:text-gray-300 focus:outline-none text-[18px] w-[200px] md:w-[250px]'
            />
          </div>

          <div className='flex justify-center gap-2 md:gap-3'>
            {links.map((btn) => (
              <button
                key={btn}
                onClick={() => handleFilter(btn)}
                className='px-[5px] py-0.5 bg-red-500 rounded-[5px] text-white md:py-1 md:px-3'
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[url('/back.png')] bg-cover bg-fixed bg-center flex justify-center bg-black">
        <div className='flex flex-wrap gap-4 justify-center md:justify-evenly xl:justify-center md:gap-10 mt-10 pb-72 p-2'>
          {filteredFoods.map((elm) => (
            <FoodCard
              key={elm.id}
              elm={elm}
              initialRating={ratings[elm.id] ?? 0}
              onSubmitRating={handleSubmitRating}
            />
          ))}
        </div>
      </div>

      <div className='text-center bg-[#1c1c1c] text-white py-4'>
        <h2 className='text-lg font-semibold'>📊 Ratings Summary</h2>
        <p className='text-xl'>Total Counts = {ratedCount}.00</p>
        <p className='text-xl'>Total Reviews = {avgRating}</p>
      </div>
    </div>
  );
};

export default App;
