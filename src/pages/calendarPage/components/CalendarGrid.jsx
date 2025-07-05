import React, { useState } from "react";
import { Link } from "react-router-dom";
import {IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

const CalendarGrid = ({ cardsByDate, onCardClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const changeMonth = (amount) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const leadingEmptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    return (
        <div className="calendar-grid-container">
            <div className="calendar-grid-header">
                <button onClick={() => changeMonth(-1)} className="calendar-grid-nav-btn">
                    <IconChevronLeft/>
                </button>
                <h2 className="calendar-grid-title">{monthName.charAt(0).toUpperCase() + monthName.slice(1)} de {year}</h2>
                <button onClick={() => changeMonth(1)} className="calendar-grid-nav-btn">
                    <IconChevronRight/>
                </button>
            </div>

            <div className="calendar-grid-weekdays">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day}>{day}</div>
                ))}
            </div>

            <div className="calendar-grid-body">
                {leadingEmptyDays.map(i => <div key={`empty-${i}`} className="calendar-grid-day calendar-grid-empty"></div>)}
                {daysArray.map(day => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const cardsForDay = (cardsByDate[dateStr] || []).filter(card => !card.isArchived);
                    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                    return (
                        <div key={dateStr} className={`calendar-grid-day ${isToday ? 'calendar-grid-today' : ''}`}>
                            <div className="calendar-grid-day-number">{day}</div>
                            <div className="calendar-grid-day-cards">
                                {cardsForDay.map(card => !card.isArchived && (
                                    <div
                                        key={card.id}
                                        className="calendar-grid-card"
                                        title={card.title}
                                        onClick={() => onCardClick(card)}
                                        data-priority={card.priority}
                                    >
                                        {card.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarGrid;