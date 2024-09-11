import React, { useState, useEffect, useRef } from 'react';
import AutocompleteList from './AutocompleteList';
import tagsData from '../gelbooru_tags.json';

function TagSearchBar({ onSearch }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    // Load tags from the local JSON file
    setAllTags(tagsData);
    console.log('Loaded tags:', tagsData.slice(0, 10)); // Log first 10 tags
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    const currentTags = value.toLowerCase().split(',').map(tag => tag.trim());
    const lastTag = currentTags[currentTags.length - 1];

    console.log('Current input:', lastTag);

    if (lastTag) {
      const filtered = allTags
        .filter(tag => {
          const lowercaseTag = tag.toLowerCase();
          for (let i = 0; i < lastTag.length; i++) {
            if (lowercaseTag[i] !== lastTag[i]) {
              return false;
            }
          }
          return true;
        })
        .slice(0, 5); // Limit to 5 suggestions
      setSuggestions(filtered);
      console.log('Filtered suggestions:', filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(input.split(',').map(tag => tag.trim()).filter(tag => tag !== ''));
    setInput('');
    setSuggestions([]);
  };

  const handleSuggestionSelect = (suggestion) => {
    setInput(prevInput => {
      const tags = prevInput.split(',').map(tag => tag.trim());
      const lastTag = tags[tags.length - 1];
      const completedTag = suggestion.startsWith(lastTag) ? suggestion : lastTag + suggestion;
      tags[tags.length - 1] = completedTag;
      return tags.join(', ');
    });
    setSuggestions([]);
    inputRef.current.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="field">
        <div className="control has-icons-right">
          <input
            ref={inputRef}
            className="input"
            type="text"
            placeholder="Enter tags"
            value={input}
            onChange={handleInputChange}
          />
          <span className="icon is-small is-right">
            <i className="fas fa-search"></i>
          </span>
        </div>
        {suggestions.length > 0 && (
          <AutocompleteList suggestions={suggestions} onSelect={handleSuggestionSelect} input={input} />
        )}
      </div>
      <div className="field">
        <div className="control">
          <button type="submit" className="button is-primary">
            Search
          </button>
        </div>
      </div>
    </form>
  );
}

export default TagSearchBar;