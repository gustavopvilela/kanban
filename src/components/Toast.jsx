import React, { useEffect } from "react";
import './styles/Toast.css';
import {IconX} from "@tabler/icons-react";

export default function Toast ({ message, type = "warning", onClose, icon }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Fechará em 5 segundos

        return () => {
            clearTimeout(timer);
        };
    }, [onClose]);

    return (
        <div className={`toast toast-${type}`}>
            {icon && (
                <div className="toast-icon">
                    {icon}
                </div>
            )}
            <p className="toast-message">{message}</p>
            <button className="toast-close-btn" onClick={onClose}>
                <IconX/>
            </button>
        </div>
    );
}