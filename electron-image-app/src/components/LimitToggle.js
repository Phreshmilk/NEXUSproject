import React, { useState, useEffect } from 'react';

function LimitToggle({ limit, onLimitChange }) {
  const [inputValue, setInputValue] = useState(limit.toString());

  useEffect(() => {
    setInputValue(limit.toString());
  }, [limit]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newLimit = parseInt(inputValue, 10);
    if (!isNaN(newLimit) && newLimit > 0) {
      onLimitChange(newLimit);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="field has-addons">
      <div className="control">
        <input
          className="input"
          type="number"
          min="1"
          value={inputValue}
          onChange={handleChange}
        />
      </div>
      <div className="control">
        <button type="submit" className="button is-info">
          Set Limit
        </button>
      </div>
    </form>
  );
}

export default LimitToggle;