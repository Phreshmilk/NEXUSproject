import React, { useState } from 'react';
import MediaItem from './MediaItem';
import MediaModal from '../MediaModal';
import './ImageGrid.css';

function ImageGrid({ images }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleNext = () => {
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[nextIndex]);
  };

  const handlePrevious = () => {
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const previousIndex = (currentIndex - 1 + images.length) % images.length;
    setSelectedImage(images[previousIndex]);
  };

  return (
    <>
      <div className="image-grid">
        {images.map((image) => (
          <div key={image.id} className="image-item" onClick={() => handleImageClick(image)}>
            <MediaItem image={image} />
          </div>
        ))}
      </div>
      {selectedImage && (
        <MediaModal
          image={selectedImage}
          isOpen={!!selectedImage}
          onClose={handleCloseModal}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
    </>
  );
}

export default ImageGrid;