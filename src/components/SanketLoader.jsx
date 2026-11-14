import React from 'react';
import '../sanket-loader.css';

/** The mascot peek loader from the Sanket motion pack. */
export function SanketLoader({ label = 'Loading' }) {
  return (
    <div className="sanket-loader" role="status" aria-label={label}>
      <span className="sk-ring" />
      <span className="sk-ring sk-r2" />
      <div className="sk-window">
        <img className="sk-mascot" src="/brand/sanket-mascot-peek.png" alt="" />
      </div>
      <div className="sk-sign">
        <span className="sk-dot" />
        <span className="sk-dot" />
        <span className="sk-dot" />
      </div>
    </div>
  );
}
