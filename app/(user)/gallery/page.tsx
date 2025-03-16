  'use client'

  import { useState, useCallback } from 'react'
  import Image from 'next/image'
  import { motion, AnimatePresence } from 'framer-motion'

  const GalleryPage = () => {
    const [selectedImage, setSelectedImage] = useState<{
      id: number
      src: string
      alt: string
      category: string
    } | null>(null)
    const [filter, setFilter] = useState<string>('all')

    const galleryImages = [
      {
        id: 1,
        src: "/hero-bg-img.jpg",
        alt: 'Modern Haircut',
        category: 'Haircuts'
      },
      {
        id: 2,
        src: "/hero-bg-img.jpg",
        alt: 'Hair Coloring',
        category: 'Color'
      },
      {
        id: 3,
        src: "/hero-bg-img.jpg",
        alt: 'Facial Treatment',
        category: 'Spa'
      },
      {
        id: 4,
        src: "/hero-bg-img.jpg",
        alt: 'Manicure',
        category: 'Nails'
      },
      {
        id: 5,
        src: "/hero-bg-img.jpg",
        alt: 'Hair Styling',
        category: 'Styling'
      },
      {
        id: 6,
        src: "/hero-bg-img.jpg",
        alt: 'Massage Treatment',
        category: 'Spa'
      },
    ]

    const categories = ['all', ...new Set(galleryImages.map(img => img.category))]
    
    const filteredImages = useCallback(() => {
      return filter === 'all' 
        ? galleryImages 
        : galleryImages.filter(img => img.category === filter)
    }, [filter])

    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-center mb-8 text-gray-900 tracking-tight"
          >
            Our Gallery
          </motion.h1>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(category)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  filter === category
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </motion.button>
            ))}
          </div>

          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filteredImages().map((image) => (
                <motion.div
                  layout
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.03 }}
                  className="relative group overflow-hidden rounded-2xl shadow-xl bg-white cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="relative w-full h-[400px]">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      priority={image.id === 1}
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end"
                  >
                    <div className="p-6 w-full">
                      <p className="text-white text-xl font-bold mb-1">{image.alt}</p>
                      <span className="text-neutral-200 text-sm font-medium">{image.category}</span>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {selectedImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setSelectedImage(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative max-w-5xl w-full h-[85vh]"
                >
                  <Image
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    fill
                    priority
                    className="object-contain"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-3 hover:bg-black/75 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImage(null)
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </motion.button>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold">{selectedImage.alt}</h3>
                    <p className="text-neutral-200">{selectedImage.category}</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }
  export default GalleryPage