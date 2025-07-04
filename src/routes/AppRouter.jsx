import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/dashboard/Dashboard.jsx';
import BoardPage from '../pages/boardPage/BoardPage.jsx';
import CalendarPage from "../pages/calendarPage/CalendarPage.jsx";

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/board/:id" element={<BoardPage />} />
            <Route path="/board/:id/calendar" element={<CalendarPage />} />
        </Routes>
    );
}
