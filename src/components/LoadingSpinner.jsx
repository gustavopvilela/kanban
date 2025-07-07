import React from 'react';
import './styles/LoadingSpinner.css';

export default function LoadingSpinner({ message }) {
    return (
        <div className="loading-overlay">
            <div className="loading-spinner"></div>
            {message && <p className="loading-message">{message}</p>}
        </div>
    );
}