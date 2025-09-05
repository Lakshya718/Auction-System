import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const slides = [
  {
    id: 1,
    title: 'Experience the Thrill',
    subtitle: 'Where Legends Are Born',
    description:
      'Witness the electrifying moments of the auction, where dreams become reality and teams forge their destiny.',
    image:
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Basketball Blitz',
    subtitle: 'Dominate the Court',
    description:
      'Dribble, shoot, and score! Draft your dream basketball team and rise to championship glory.',
    image:
      'https://images.unsplash.com/photo-1505666287802-931dc83948e9?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 3,
    title: 'Unleash the Power',
    subtitle: 'Ultimate Sporting Excellence',
    description:
      'Feel the passion, the drama, and the glory of the ultimate sporting showdown that defines champions.',
    image:
      'https://plus.unsplash.com/premium_photo-1671436824817-664338d9bb76?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjZ8fHNwb3J0c3xlbnwwfHwwfHx8MA%3D%3D?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 4,
    title: 'Cricket Fever',
    subtitle: 'Master the Pitch',
    description:
      'Step onto the pitch and experience the excitement of cricket auctions. Build your squad of champions.',
    image:
      'https://plus.unsplash.com/premium_photo-1721963697195-a2db88d2d222?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTY1fHxjcmlja2V0fGVufDB8fDB8fHww?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 5,
    title: 'Volleyball Victory',
    subtitle: 'Spike Your Way to Glory',
    description:
      'Spike, set, and serve your way to victory! Build an unbeatable volleyball team through strategic bidding.',
    image:
      'https://images.unsplash.com/photo-1666901356149-93f2eb3ba5a2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 6,
    title: 'Build Your Dream Team',
    subtitle: 'Champions Are Made Here',
    description:
      'Strategize, bid, and assemble a team of legends that will dominate every league and tournament.',
    image:
      'https://plus.unsplash.com/premium_photo-1675364966233-710334c771c5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZHJlYW0lMjB0ZWFtfGVufDB8fDB8fHww',
  },
  {
    id: 7,
    title: 'The Ultimate Auction',
    subtitle: 'Where Stakes Are Highest',
    description:
      'Where every bid counts and the stakes are higher than ever before. This is where champions emerge.',
    image:
      'https://plus.unsplash.com/premium_photo-1661940814738-5a028d647d3a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXVjdGlvbnxlbnwwfHwwfHx8MA%3D%3D?q=80&w=1932&auto=format&fit=crop',
  },
];

const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        setTimeout(() => setIsAnimating(false), 700);
      }
    }, 4000); // Auto slide every 4 seconds

    return () => clearInterval(interval);
  }, [currentIndex, isAnimating]);

  // Touch handling for mobile swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 700);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 700);
  };

  const goToSlide = (index) => {
    if (isAnimating || currentIndex === index) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 700);
  };

  const currentSlide = slides[currentIndex];

  return (
    <div
      className="relative w-full h-screen bg-black text-white overflow-hidden font-sans"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Background Images */}
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-all duration-700 ease-out transform
              ${
                currentIndex === index
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-105'
              }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center"
            />
            {/* Simple overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50" />
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <button
        onClick={handlePrev}
        className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-30 group"
        aria-label="Previous slide"
      >
        <div className="bg-white/20 backdrop-blur-md rounded-full p-3 md:p-4 hover:bg-white/30 transition-all duration-300">
          <FaChevronLeft className="text-white text-lg md:text-xl" />
        </div>
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-30 group"
        aria-label="Next slide"
      >
        <div className="bg-white/20 backdrop-blur-md rounded-full p-3 md:p-4 hover:bg-white/30 transition-all duration-300">
          <FaChevronRight className="text-white text-lg md:text-xl" />
        </div>
      </button>

      {/* Content Overlay */}
      <div className="relative z-20 flex flex-col justify-center min-h-screen px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`transform transition-all duration-700 ease-out ${
              isAnimating
                ? 'translate-y-4 opacity-0'
                : 'translate-y-0 opacity-100'
            }`}
          >
            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4 text-white drop-shadow-lg">
              {currentSlide.title}
            </h1>

            {/* Subtitle */}
            <h2 className="text-xl md:text-2xl lg:text-3xl font-medium text-white/90 mb-6 drop-shadow-md">
              {currentSlide.subtitle}
            </h2>

            {/* Description */}
            <p className="text-base md:text-lg text-white/80 leading-relaxed mb-8 max-w-2xl mx-auto drop-shadow-md">
              {currentSlide.description}
            </p>
          </div>
        </div>
      </div>

      {/* Simple Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex items-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? 'bg-white scale-125 shadow-lg'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;
