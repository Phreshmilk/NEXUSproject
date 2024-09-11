import React from 'react';
import './AutoComplete.css';

function AutocompleteList({ suggestions, onSelect }) {
  if (suggestions.length === 0) return null;

  return (
    <div className="autocomplete-list">
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className="autocomplete-item"
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </div>
      ))}
    </div>
  );
}

export default AutocompleteList;