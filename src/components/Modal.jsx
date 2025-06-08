import React from 'react';
import ReactDOM from 'react-dom';
import './styles/Modal.css';
import {IconX} from "@tabler/icons-react";

const modalRoot = document.getElementById('modal-root');

export default function Modal ({ isOpen, onClose, children }) {
    if (!isOpen) return null; // Não renderiza nada se não estiver aberto

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose}><IconX stroke={2}/></button>
                {children}
            </div>
        </div>,
        modalRoot
    );
}