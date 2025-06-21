import React, { useState, useEffect } from "react";
//later on we will import the slides by making a differnent file that handles different 
//slides arrays and then we import these arrays and pass as props
const slides = [
  {
    id: 1,
    title: "SLIDER BUTTERFLY",
    description:
      "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Officiis culpa similique consequuntur, reprehenderit dicta repudiandae.",
    image:
      "https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?cs=srgb&dl=pexels-thatguycraig000-1563356.jpg&fm=jpg",
    preview:
      "https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?cs=srgb&dl=pexels-thatguycraig000-1563356.jpg&fm=jpg",
  },
  {
    id: 2,
    title: "SLIDER PARROT",
    description:
      "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Officiis culpa similique consequuntur, reprehenderit dicta repudiandae.",
    image:
      "https://images.pexels.com/photos/461416/pexels-photo-461416.jpeg?cs=srgb&dl=pexels-pixabay-461416.jpg&fm=jpg",
    preview:
      "https://images.pexels.com/photos/461416/pexels-photo-461416.jpeg?cs=srgb&dl=pexels-pixabay-461416.jpg&fm=jpg",
  },
  {
    id: 3,
    title: "SLIDER EAGLE",
    description:
      "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Officiis culpa similique consequuntur, reprehenderit dicta repudiandae.",
    image:
      "https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?cs=srgb&dl=pexels-pixabay-326055.jpg&fm=jpg",
    preview:
      "https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?cs=srgb&dl=pexels-pixabay-326055.jpg&fm=jpg",
  },
  {
    id: 4,
    title: "SLIDER OWL",
    description:
      "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Officiis culpa similique consequuntur, reprehenderit dicta repudiandae.",
    image:
      "https://images.pexels.com/photos/145939/pexels-photo-145939.jpeg?cs=srgb&dl=pexels-pixabay-145939.jpg&fm=jpg",
    preview:
      "https://images.pexels.com/photos/145939/pexels-photo-145939.jpeg?cs=srgb&dl=pexels-pixabay-145939.jpg&fm=jpg",
  },
];

// Helper function to rotate array left or right
const rotateArray = (arr, direction) => {
  if (direction === "left") {
    return [...arr.slice(1), arr[0]];
  } else if (direction === "right") {
    return [arr[arr.length - 1], ...arr.slice(0, arr.length - 1)];
  }
  return arr;
};

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewOrder, setPreviewOrder] = useState(slides);
  const [animating, setAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState(null); // 'next' or 'prev'

  useEffect(() => {
    if (animating) {
      const timer = setTimeout(() => {
        setAnimating(false);
        setAnimationDirection(null);
      }, 600); // duration of animation
      return () => clearTimeout(timer);
    }
  }, [animating]);

  // Auto slide effect with 8 seconds interval
  useEffect(() => {
    if (animating) return; // skip if animating
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(interval);
  }, [animating, currentIndex]);

  const prevSlide = () => {
    if (animating) return;
    setAnimationDirection("prev");
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
      setPreviewOrder((prevOrder) => rotateArray(prevOrder, "right"));
    }, 300); // halfway through animation
  };

  const nextSlide = () => {
    if (animating) return;
    setAnimationDirection("next");
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      setPreviewOrder((prevOrder) => rotateArray(prevOrder, "left"));
    }, 300); // halfway through animation
  };

  return (
    <div className="carousel relative w-full h-screen bg-black text-white overflow-hidden">
      {/* Large image full screen */}
      <div
        className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
          animating
            ? animationDirection === "next"
              ? "translate-x-full"
              : "-translate-x-full"
            : "translate-x-0"
        }`}
        style={{
          backgroundImage: `url(${slides[currentIndex].image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 10,
        }}
      >
        <div className="absolute bottom-20 left-20 max-w-lg">
          <h1 className="text-5xl font-extrabold mb-4">{slides[currentIndex].title}</h1>
          <p className="text-lg">{slides[currentIndex].description}</p>
          {/* Navigation buttons */}
          <div className="flex space-x-4 mt-6">
            <button
              onClick={prevSlide}
              className="w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center"
              aria-label="Previous Slide"
            >
              &#8592;
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center"
              aria-label="Next Slide"
            >
              &#8594;
            </button>
          </div>
        </div>
      </div>

      {/* Preview images floating at bottom right */}
      <div className="absolute bottom-10 right-10 flex space-x-4 z-20">
        {previewOrder
          .filter((slide) => slide.id !== slides[currentIndex].id)
          .map((slide) => (
            <div
              key={slide.id}
              className="flex-shrink-0 w-48 h-48 rounded-lg overflow-hidden cursor-pointer opacity-70 transition-transform duration-500 ease-in-out"
              onClick={() => {
                if (!animating) {
                  const newIndex = slides.findIndex((s) => s.id === slide.id);
                  setCurrentIndex(newIndex);
                  // Rotate previewOrder to match new currentIndex
                  let rotated = [...previewOrder];
                  while (rotated[0].id !== slide.id) {
                    rotated = rotateArray(rotated, "left");
                  }
                  setPreviewOrder(rotated);
                }
              }}
            >
              <img
                src={slide.preview}
                alt={slide.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default Carousel;
