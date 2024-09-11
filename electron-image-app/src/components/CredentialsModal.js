import React, { useState } from 'react';

function CredentialsModal({ isOpen, onSubmit }) {
  const [apiKey, setApiKey] = useState('');
  const [userId, setUserId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(apiKey, userId);
  };

  if (!isOpen) return null;

  return (
    <div className="modal is-active">
      <div className="modal-background"></div>
      <div className="modal-content">
        <div className="box">
          <h2 className="title is-4">Enter Your Credentials</h2>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="label">API Key</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label className="label">User ID</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="field">
              <div className="control">
                <button type="submit" className="button is-primary">Submit</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CredentialsModal;