import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaChevronLeft,
  FaChevronRight,
  FaPlay,
  FaPause,
  FaExpand,
  FaArrowRight,
  FaStar,
  FaTrophy,
} from 'react-icons/fa';

const slides = [
  {
    id: 1,
    title: 'Experience the Thrill',
    subtitle: 'Where Legends Are Born',
    description:
      'Witness the electrifying moments of the auction, where dreams become reality and teams forge their destiny.',
    image:
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop',
    category: 'Sports Auction',
    stats: { players: '500+', teams: '32', value: '$50M' },
    color: 'from-purple-600 to-pink-600',
  },
  {
    id: 2,
    title: 'Basketball Blitz',
    subtitle: 'Dominate the Court',
    description:
      'Dribble, shoot, and score! Draft your dream basketball team and rise to championship glory.',
    image:
      'https://images.unsplash.com/photo-1505666287802-931dc83948e9?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'Basketball',
    stats: { players: '300+', teams: '16', value: '$25M' },
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 3,
    title: 'Unleash the Power',
    subtitle: 'Ultimate Sporting Excellence',
    description:
      'Feel the passion, the drama, and the glory of the ultimate sporting showdown that defines champions.',
    image:
      'https://plus.unsplash.com/premium_photo-1671436824817-664338d9bb76?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjZ8fHNwb3J0c3xlbnwwfHwwfHx8MA%3D%3D?q=80&w=2070&auto=format&fit=crop',
    category: 'Multi-Sport',
    stats: { players: '1000+', teams: '50', value: '$75M' },
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 4,
    title: 'Cricket Fever',
    subtitle: 'Master the Pitch',
    description:
      'Step onto the pitch and experience the excitement of cricket auctions. Build your squad of champions.',
    image:
      'https://plus.unsplash.com/premium_photo-1721963697195-a2db88d2d222?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTY1fHxjcmlja2V0fGVufDB8fDB8fHww?q=80&w=2070&auto=format&fit=crop',
    category: 'Cricket',
    stats: { players: '450+', teams: '24', value: '$40M' },
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 5,
    title: 'Volleyball Victory',
    subtitle: 'Spike Your Way to Glory',
    description:
      'Spike, set, and serve your way to victory! Build an unbeatable volleyball team through strategic bidding.',
    image:
      'https://images.unsplash.com/photo-1666901356149-93f2eb3ba5a2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'Volleyball',
    stats: { players: '200+', teams: '12', value: '$15M' },
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: 6,
    title: 'Build Your Dream Team',
    subtitle: 'Champions Are Made Here',
    description:
      'Strategize, bid, and assemble a team of legends that will dominate every league and tournament.',
    image:
      'https://plus.unsplash.com/premium_photo-1675364966233-710334c771c5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZHJlYW0lMjB0ZWFtfGVufDB8fDB8fHww',
    category: 'Team Building',
    stats: { players: '800+', teams: '40', value: '$60M' },
    color: 'from-pink-500 to-rose-600',
  },
  {
    id: 7,
    title: 'The Ultimate Auction',
    subtitle: 'Where Stakes Are Highest',
    description:
      'Where every bid counts and the stakes are higher than ever before. This is where champions emerge.',
    image:
      'https://plus.unsplash.com/premium_photo-1661940814738-5a028d647d3a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXVjdGlvbnxlbnwwfHwwfHx8MA%3D%3D?q=80&w=1932&auto=format&fit=crop',
    category: 'Premium Auction',
    stats: { players: '600+', teams: '28', value: '$80M' },
    color: 'from-yellow-500 to-orange-600',
  },
];

const Carousel = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState('next');
  const [isLoaded, setIsLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Preload images with loading state
  useEffect(() => {
    const preloadImages = async () => {
      const promises = slides.map(
        (slide) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve;
            img.src = slide.image;
          })
      );
      await Promise.all(promises);
      setIsLoaded(true);
    };
    preloadImages();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || !isLoaded) return;

    const interval = setInterval(() => {
      if (!isAnimating) {
        setDirection('next');
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        setTimeout(() => setIsAnimating(false), 700);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, isPlaying, isLoaded, isAnimating]);

  // Touch handling
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
    setDirection('next');
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 700);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setDirection('prev');
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 700);
  };

  const goToSlide = (index) => {
    if (isAnimating || currentIndex === index) return;
    setDirection(index > currentIndex ? 'next' : 'prev');
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 700);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleJoinAuction = () => {
    navigate('/login');
  };

  const handleWatchDemo = () => {
    const demoSection = document.getElementById('demo-section');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isLoaded) {
    return (
      <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">
            Loading Experience...
          </p>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <div
      className="relative w-full h-screen bg-black text-white overflow-hidden font-sans"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Background Images with Parallax Effect */}
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-all duration-700 ease-out transform
              ${
                currentIndex === index
                  ? 'opacity-100 scale-100'
                  : currentIndex === index - 1 ||
                      (currentIndex === 0 && index === slides.length - 1)
                    ? 'opacity-0 scale-110 -translate-x-full'
                    : currentIndex === index + 1 ||
                        (currentIndex === slides.length - 1 && index === 0)
                      ? 'opacity-0 scale-110 translate-x-full'
                      : 'opacity-0 scale-105'
              }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center filter brightness-75"
            />
            {/* Dynamic gradient overlay based on slide color */}
            <div
              className={`absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60 opacity-80`}
            />
            <div
              className={`absolute inset-0 bg-gradient-to-r ${slide.color} opacity-20`}
            />
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <button
        onClick={handlePrev}
        className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-30 group"
        aria-label="Previous slide"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-3 md:p-4 hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
          <FaChevronLeft className="text-white text-lg md:text-xl" />
        </div>
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-30 group"
        aria-label="Next slide"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-3 md:p-4 hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
          <FaChevronRight className="text-white text-lg md:text-xl" />
        </div>
      </button>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col justify-center min-h-screen px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <div
              className={`transform transition-all duration-700 ease-out ${
                isAnimating
                  ? direction === 'next'
                    ? '-translate-x-full opacity-0'
                    : 'translate-x-full opacity-0'
                  : 'translate-x-0 opacity-100'
              }`}
            >
              {/* Category Badge */}
              <div className="inline-flex items-center gap-2 mb-4">
                <div
                  className={`px-3 py-1 bg-gradient-to-r ${currentSlide.color} rounded-full text-xs font-bold uppercase tracking-wider`}
                >
                  {currentSlide.category}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-xs" />
                  ))}
                </div>
              </div>

              {/* Main Title */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-4">
                <span
                  className={`bg-gradient-to-r ${currentSlide.color} bg-clip-text text-transparent animate-gradient`}
                >
                  {currentSlide.title}
                </span>
              </h1>

              {/* Subtitle */}
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white/90 mb-6 tracking-wide">
                {currentSlide.subtitle}
              </h2>

              {/* Description */}
              <p className="text-base md:text-lg text-white/80 leading-relaxed mb-8 max-w-lg">
                {currentSlide.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <div
                    className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${currentSlide.color} bg-clip-text text-transparent`}
                  >
                    {currentSlide.stats.players}
                  </div>
                  <div className="text-xs md:text-sm text-white/60 uppercase tracking-wider">
                    Players
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${currentSlide.color} bg-clip-text text-transparent`}
                  >
                    {currentSlide.stats.teams}
                  </div>
                  <div className="text-xs md:text-sm text-white/60 uppercase tracking-wider">
                    Teams
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${currentSlide.color} bg-clip-text text-transparent`}
                  >
                    {currentSlide.stats.value}
                  </div>
                  <div className="text-xs md:text-sm text-white/60 uppercase tracking-wider">
                    Value
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleJoinAuction}
                  className={`group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r ${currentSlide.color} rounded-full font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-current/25`}
                >
                  <FaTrophy className="text-lg" />
                  <span>Join Auction</span>
                  <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={handleWatchDemo}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full font-bold text-white hover:bg-white/20 transition-all duration-300">
                  <FaPlay className="text-sm" />
                  <span>Watch Demo</span>
                </button>
              </div>
            </div>

            {/* Right Content - Visual Elements */}
            <div className="hidden lg:flex flex-col items-center justify-center">
              <div
                className={`relative transform transition-all duration-700 ease-out ${
                  isAnimating
                    ? direction === 'next'
                      ? 'translate-x-full opacity-0 rotate-12'
                      : '-translate-x-full opacity-0 -rotate-12'
                    : 'translate-x-0 opacity-100 rotate-0'
                }`}
              >
                {/* Floating Cards */}
                <div className="relative">
                  <div
                    className={`w-64 h-80 bg-gradient-to-br ${currentSlide.color} rounded-3xl p-1 transform rotate-6 hover:rotate-12 transition-transform duration-500`}
                  >
                    <div className="w-full h-full bg-black/20 backdrop-blur-sm rounded-3xl p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-white font-bold text-xl mb-2">
                          Live Auction
                        </h3>
                        <p className="text-white/80 text-sm">
                          Real-time bidding
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-white">
                          {currentIndex + 1}
                        </div>
                        <div className="text-white/60 text-sm">
                          of {slides.length}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center transform -rotate-12 hover:rotate-0 transition-transform duration-500">
                    <FaTrophy className="text-yellow-400 text-3xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Progress Bar with Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex flex-col items-center gap-4">
          {/* Slide Counter */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2">
            <span className="text-white font-bold text-sm">
              {String(currentIndex + 1).padStart(2, '0')} /{' '}
              {String(slides.length).padStart(2, '0')}
            </span>
          </div>

          {/* Control Buttons and Progress Indicators */}
          <div className="flex items-center gap-6">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-3 hover:bg-white/20 transition-all duration-300"
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isPlaying ? (
                <FaPause className="text-white" />
              ) : (
                <FaPlay className="text-white ml-1" />
              )}
            </button>

            {/* Progress Indicators */}
            <div className="flex items-center gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="group relative"
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <div
                    className={`w-12 h-2 rounded-full transition-all duration-300 ${
                      currentIndex === index
                        ? `bg-gradient-to-r ${slides[index].color}`
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                  >
                    {currentIndex === index && isPlaying && (
                      <div className="h-full bg-white/40 rounded-full animate-progress-fill"></div>
                    )}
                  </div>
                  <div
                    className={`absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-white whitespace-nowrap`}
                  >
                    {slides[index].title}
                  </div>
                </button>
              ))}
            </div>

            {/* Fullscreen Button */}
            <button
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-3 hover:bg-white/20 transition-all duration-300"
              aria-label="Toggle fullscreen"
            >
              <FaExpand className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carousel;
