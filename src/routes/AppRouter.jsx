import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import BoardPage from '../pages/BoardPage';

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/board/:id" element={<BoardPage />} />
        </Routes>
    );
}
