import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import Dashboard from '../pages/dashboard/Dashboard.jsx';

const BoardPage = lazy(() => import('../pages/boardPage/BoardPage.jsx'));
const CalendarPage = lazy(() => import('../pages/calendarPage/CalendarPage.jsx'));

export default function AppRouter() {
    return (
        <Suspense fallback={<LoadingSpinner message="Carregando página..." />}>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/board/:id" element={<BoardPage />} />
                <Route path="/board/:id/calendar" element={<CalendarPage />} />
            </Routes>
        </Suspense>
    );
}