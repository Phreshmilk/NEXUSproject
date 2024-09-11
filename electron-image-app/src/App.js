import React, { useState, useEffect, useCallback } from 'react';
import TagSearchBar from './components/TagSearchBar';
import ImageGrid from './components/ImageGrid';
import Pagination from './components/Pagination';
import './App.css';

function App() {
  const [images, setImages] = useState([]);
  const [tags, setTags] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(25);

  const fetchImages = useCallback(async (pageNumber = 1) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=${tags.join('+')}&pid=${pageNumber - 1}&limit=${limit}`);
      const data = await response.json();
      if (data && data.post) {
        setImages(data.post);
        const totalCount = parseInt(data['@attributes'].count, 10);
        setTotalPages(Math.ceil(totalCount / limit));
      } else {
        setImages([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setImages([]);
      setTotalPages(1);
    }
    setIsLoading(false);
  }, [tags, limit]);

  useEffect(() => {
    fetchImages(page);
  }, [fetchImages, page, limit]);

  const handleTagSearch = (searchTags) => {
    setTags(searchTags);
    setPage(1);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  return (
    <div className="App">
      <nav className="navbar is-primary" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <a className="navbar-item" href="/">
            <h1 className="title is-4 has-text-white">Naughty Nexus</h1>
          </a>
        </div>
        <div className="navbar-menu">
          <div className="navbar-end">
            <div className="navbar-item">
              <TagSearchBar onSearch={handleTagSearch} />
            </div>
            <div className="navbar-item">
              <div className="select">
                <select value={limit} onChange={handleLimitChange}>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <section className="section">
        <div className="container">
          {isLoading && (
            <progress className="progress is-small is-primary" max="100">15%</progress>
          )}
          <ImageGrid images={images} />
          <Pagination currentPage={page} totalPages={totalPages} setPage={setPage} />
        </div>
      </section>
    </div>
  );
}

export default App;
