import React, { useState, useRef, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');

function MediaItem({ image }) {
  const fileExtension = image.file_url.split('.').pop().toLowerCase();
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const mediaRef = useRef(null);

  useEffect(() => {
    const handleProgress = (event, { videoUrl, chunk }) => {
      if (videoUrl === image.file_url) {
        setProgress(prev => prev + chunk);
      }
    };

    ipcRenderer.on('video-processing-progress', handleProgress);

    return () => {
      ipcRenderer.removeListener('video-processing-progress', handleProgress);
    };
  }, [image.file_url]);

  const processVideo = () => {
    if (!videoSrc && ['webm', 'mp4'].includes(fileExtension)) {
      setIsProcessing(true);
      ipcRenderer.invoke('process-video', image.file_url).then(processedVideoPath => {
        setVideoSrc(processedVideoPath);
        setIsProcessing(false);
      }).catch(error => {
        console.error('Error processing video:', error);
        setIsProcessing(false);
      });
    }
  };

  const togglePlay = (e) => {
    e.stopPropagation();
    if (mediaRef.current && ['webm', 'mp4'].includes(fileExtension)) {
      if (!videoSrc) {
        processVideo();
      } else if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play().catch(e => console.error("Playback failed", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (['webm', 'mp4', 'gif'].includes(fileExtension)) {
    return (
      <div className="media-container">
        {fileExtension === 'gif' ? (
          <img src={image.file_url} alt={image.tags} loading="lazy" />
        ) : (
          <>
            <video 
              ref={mediaRef}
              src={videoSrc || ''}
              poster={image.preview_url}
              muted 
              playsInline
            />
            {isProcessing && (
              <div className="progress-bar">
                <div className="progress" style={{ width: `${(progress / 1000000) * 100}%` }}></div>
              </div>
            )}
          </>
        )}
        {['webm', 'mp4'].includes(fileExtension) && (
          <button className="play-pause-btn" onClick={togglePlay} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : (isPlaying ? '❚❚' : '▶')}
          </button>
        )}
      </div>
    );
  } else {
    return (
      <img 
        src={image.preview_url || image.file_url} 
        alt={image.tags} 
        loading="lazy"
      />
    );
  }
}

export default MediaItem;