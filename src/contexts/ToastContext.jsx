import React, { createContext, useContext, useState, useCallback } from "react";
import { v4 as uuid } from "uuid";
import Toast from "../components/Toast.jsx";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, options = {}) => {
        const { type = 'warning', icon = null } = options;
        const id = uuid();
        setToasts(prevToasts => [...prevToasts, { id, message, type, icon }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        icon={toast.icon}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToastContext = () => {
    return useContext(ToastContext);
}