import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiExternalLink } from 'react-icons/fi';

// --- Helper Data ---
const allImages = [
  { id: 1, src: 'https://photospace.life/ZY5FLR.png', alt: 'A modern glass and concrete building', title: 'Architectural Wonder', description: 'A stunning view of modern architecture.' },
  { id: 2, src: '/view-image/banner-2383908_1280.png', alt: 'A majestic mountain range with a starry night sky', title: 'Mountain Serenity', description: 'The calm and beauty of a mountain range at dawn.' },
  { id: 3, src: '/view-image/car-967387_1280.png', alt: 'A sea turtle swimming gracefully in the deep blue ocean', title: 'Oceanic Depth', description: 'Exploring the vibrant life beneath the waves.' },
  { id: 4, src: '/view-image/christmas-7715230_1280.png', alt: 'A sunlit path winding through a dense green forest', title: 'Forest Path', description: 'A quiet journey through a sunlit forest.' },
  { id: 5, src: '/view-image/dolphin-2708695_1280.png', alt: 'A sprawling cityscape illuminated with vibrant lights at night', title: 'City Lights', description: 'The vibrant energy of a city at night.' },
  { id: 6, src: '/view-image/Blurred-Image.png', alt: 'Blurred-Image', title: 'Blurred', description: 'This is a Blurred-Image.' },
  // ... (add all other local images here with the /view-image/ prefix)
];

const IMAGES_PER_PAGE = 6;

// --- Custom Hook for Intersection Observer ---
const useObserver = (ref, callback, options = {}) => {
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry && entry.isIntersecting) {
        callback();
      }
    }, options);
    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [ref, callback, options]);
};

// --- Reusable Skeleton Card for Loading State ---
const SkeletonCard = () => (
  <div className="rounded-lg shadow-lg bg-gray-800 overflow-hidden animate-pulse">
    <div className="w-full h-64 bg-gray-700"></div>
    <div className="p-4">
      <div className="h-6 w-3/4 bg-gray-700 rounded"></div>
      <div className="mt-2 h-10 w-full bg-gray-700 rounded"></div>
      <div className="mt-2 h-4 w-1/2 bg-gray-700 rounded"></div>
    </div>
  </div>
);

// --- Reusable BlurredImage Component ---
const BlurredImage = ({ src, alt, title, description }) => {
  const [isBlurred, setIsBlurred] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000' || 'https://testingproject-minl.onrender.com';

  const finalSrc = useMemo(() => {
    return src.startsWith('/view-image/') ? `${API_BASE_URL}${src}` : src;
  }, [src, API_BASE_URL]);

  const handleRevealClick = () => setIsBlurred(false);
  const handleImageLoad = () => setIsImageLoaded(true);

  return (
    <div className="group relative overflow-hidden rounded-lg shadow-lg bg-gray-800 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
      <a href={finalSrc} target="_blank" rel="noopener noreferrer" className={isBlurred ? 'pointer-events-none' : ''}>
        <img
          src={finalSrc}
          alt={alt}
          className={`w-full h-64 object-contain transition-all duration-700 ease-in-out ${
            isImageLoaded ? (isBlurred ? 'filter blur-2xl' : 'filter blur-0') : 'opacity-0'
          } ${isImageLoaded ? 'opacity-100' : 'opacity-0'} scale-100 group-hover:scale-105`}
          onLoad={handleImageLoad}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/600x400/ff0000/ffffff?text=Error';
            setIsImageLoaded(true);
          }}
        />
      </a>
      <AnimatePresence>
        {isBlurred && isImageLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleRevealClick}
            className="absolute inset-0 flex items-center justify-center bg-transparent cursor-pointer backdrop-blur-sm"
          >
            <button className="flex items-center gap-2 bg-white/90 text-gray-900 font-bold py-2 px-4 rounded-full shadow-md hover:bg-white transition-colors duration-300 transform hover:scale-105">
              <FiEye /> Click to Reveal
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="p-4 bg-gray-900/80 backdrop-blur-sm">
        <h3 className="font-bold text-lg text-white truncate">{title}</h3>
        <p className="text-gray-400 text-sm mt-1 h-10 overflow-hidden">{description}</p>
        <a href={finalSrc} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs mt-2 inline-flex items-center gap-1.5 truncate max-w-full group/link">
          <FiExternalLink className="transition-transform group-hover/link:scale-110" />
          <span className="group-hover/link:underline">{finalSrc}</span>
        </a>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [displayedImages, setDisplayedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  const loadMoreImages = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setTimeout(() => {
      const currentLength = displayedImages.length;
      const newImages = allImages.slice(currentLength, currentLength + IMAGES_PER_PAGE);
      if (newImages.length > 0) {
        setDisplayedImages((prevImages) => [...prevImages, ...newImages]);
      } else {
        setHasMore(false);
      }
      setIsLoading(false);
    }, 1500);
  }, [displayedImages.length, isLoading, hasMore]);
  useEffect(() => {
    if (displayedImages.length === 0) {
      loadMoreImages();
    }
  }, [displayedImages.length, loadMoreImages]);
  useObserver(loaderRef, loadMoreImages, { rootMargin: '200px' });
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 md:mb-12">
          <motion.h1 initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, type: 'spring' }} className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Secure Image Gallery
          </motion.h1>
          <motion.p initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2, type: 'spring' }} className="mt-3 text-lg text-gray-300 max-w-2xl mx-auto">
            Images are blurred for privacy. Click an image to reveal it, or open the link to view the original.
          </motion.p>
        </header>
        <main>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" variants={containerVariants} initial="hidden" animate="visible">
            {displayedImages.map((image) => (
              <motion.div key={image.id} variants={itemVariants}>
                <BlurredImage src={image.src} alt={image.alt} title={image.title} description={image.description} />
              </motion.div>
            ))}
            {isLoading && Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={`skeleton-${index}`} />)}
          </motion.div>
          <div ref={loaderRef} />
          <div className="text-center py-10">
            {!isLoading && !hasMore && (<p className="text-gray-500">You've reached the end of the gallery! 🎉</p>)}
          </div>
        </main>
        <footer className="text-center mt-12 py-6 border-t border-gray-700">
          <p className="text-gray-500">&copy; {new Date().getFullYear()} Secure Gallery. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
