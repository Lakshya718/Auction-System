
import React, { useState, useEffect } from "react";

const slides = [
  {
    id: 1,
    title: "Experience the Thrill",
    description:
      "Witness the electrifying moments of the auction, where legends are made and teams are born.",
    image:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Unleash the Power of Sport",
    description:
    "Feel the passion, the drama, and the glory of the ultimate sporting showdown.",
    image:
    "https://plus.unsplash.com/premium_photo-1671436824817-664338d9bb76?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjZ8fHNwb3J0c3xlbnwwfHwwfHx8MA%3D%3D?q=80&w=2070&auto=format&fit=crop",
  },
  
  {
    id: 5,
    title: "Cricket Fever",
    description:
    "Step onto the pitch and experience the excitement of cricket auctions. Bid for your favorite batsmen, bowlers, and all-rounders.",
    image:
    "https://plus.unsplash.com/premium_photo-1721963697195-a2db88d2d222?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTY1fHxjcmlja2V0fGVufDB8fDB8fHww?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTV8fGNyaWNrZXQlMjBiYWxsfGVufDB8fDB8fHww?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGNyaWNrZXR8ZW58MHx8MHx8fDA%3D?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y3JpY2tldHxlbnwwfHwwfHx8MA%3D%3D?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "Volleyball Victory",
    description:
    "Spike, set, and serve your way to victory! Build an unbeatable volleyball team through strategic bidding.",
    image:
    "https://images.unsplash.com/photo-1666901356149-93f2eb3ba5a2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  
  {
    id: 2,
    title: "Basketball Blitz",
    description:
    "Dribble, shoot, and score! Draft your dream basketball team and dominate the court.",
    image:
    "https://images.unsplash.com/photo-1505666287802-931dc83948e9?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Replace with a valid image URL
  },
  {
    id: 7,
    title: "Build Your Dream Team",
    description:
      "Strategize, bid, and assemble a team of champions that will dominate the league.",
      image:
      "https://plus.unsplash.com/premium_photo-1675364966233-710334c771c5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZHJlYW0lMjB0ZWFtfGVufDB8fDB8fHww?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHNwb3J0cyUyMHRlYW18ZW58MHx8MHx8fDA%3D?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  {
    id: 4,
    title: "The Ultimate Auction",
    description:
    "Where every bid counts and the stakes are higher than ever before.",
    image:
    "https://plus.unsplash.com/premium_photo-1661940814738-5a028d647d3a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXVjdGlvbnxlbnwwfHwwfHx8MA%3D%3D?q=80&w=1932&auto=format&fit=crop",
  },
  
];

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Preload images
  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      setTimeout(() => setIsAnimating(false), 1000); // Animation duration
    }, 4000); // 5 seconds interval
    return () => clearInterval(interval);
  }, [currentIndex]);

  const goToSlide = (index) => {
    if (isAnimating || currentIndex === index) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden font-sans">
      {/* Image Container */}
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${currentIndex === index ? "opacity-100" : "opacity-0"}`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-50" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <div
          key={currentIndex} // Re-trigger animation on slide change
          className="animate-fade-in-down"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white uppercase tracking-wider mb-4 shadow-text-lg">
            {slides[currentIndex].title}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto shadow-text-md">
            {slides[currentIndex].description}
          </p>
        </div>
      </div>

      {/* Thumbnails/Dots */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${currentIndex === index ? "bg-white scale-125" : "bg-white bg-opacity-50 hover:bg-opacity-75"}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
