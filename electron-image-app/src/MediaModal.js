import React, { useEffect, useRef, useState } from 'react';
const { ipcRenderer } = window.require('electron');

function MediaModal({ image, isOpen, onClose, onNext, onPrevious }) {
  const mediaRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrevious();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      if (['mp4', 'webm'].includes(image.file_url.split('.').pop().toLowerCase())) {
        setVideoSrc(image.file_url);
        setIsProcessing(true);
        ipcRenderer.invoke('process-video', image.file_url).then(processedVideoPath => {
          setVideoSrc(processedVideoPath);
          setIsProcessing(false);
        }).catch(error => {
          console.error('Error processing video:', error);
          setIsProcessing(false);
        });
      }
    }

    const handleDownloadComplete = (event, filePath) => {
      setDownloadStatus(`File saved to: ${filePath}`);
      setTimeout(() => setDownloadStatus(null), 3000);
    };

    const handleDownloadError = (event, errorMessage) => {
      setDownloadStatus(`Download failed: ${errorMessage}`);
      setTimeout(() => setDownloadStatus(null), 3000);
    };

    ipcRenderer.on('download-complete', handleDownloadComplete);
    ipcRenderer.on('download-error', handleDownloadError);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      ipcRenderer.removeListener('download-complete', handleDownloadComplete);
      ipcRenderer.removeListener('download-error', handleDownloadError);
    };
  }, [isOpen, onClose, onNext, onPrevious, image]);

  const togglePlay = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play().catch(error => {
          if (error.name !== 'AbortError') {
            console.error('Playback error:', error);
          }
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = () => {
    ipcRenderer.invoke('download-file', image.file_url, image.id);
  };

  if (!isOpen || !image) return null;

  const fileExtension = image.file_url.split('.').pop().toLowerCase();

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-content">
        <div className="media-wrapper">
          {['mp4', 'webm', 'gif'].includes(fileExtension) ? (
            fileExtension === 'gif' ? (
              <img src={image.file_url} alt={image.tags} />
            ) : (
              <div className="video-container">
                <video
                  ref={mediaRef}
                  src={videoSrc || image.file_url}
                  controls
                  autoPlay
                  loop
                  onClick={togglePlay}
                />
                <button className="play-pause-btn" onClick={togglePlay}>
                  {isPlaying ? '❚❚' : '▶'}
                </button>
              </div>
            )
          ) : (
            <img src={image.file_url} alt={image.tags} />
          )}
          <button className="button is-primary is-small download-btn" onClick={handleDownload}>
            <span className="icon">
              <i className="fas fa-download"></i>
            </span>
            <span>Download</span>
          </button>
        </div>
        {downloadStatus && (
          <div className="download-notification">
            {downloadStatus}
          </div>
        )}
      </div>
      <button className="modal-close is-large" aria-label="close" onClick={onClose}></button>
    </div>
  );
}

export default MediaModal;