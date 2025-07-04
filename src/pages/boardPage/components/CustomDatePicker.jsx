import React, { useState, useEffect, useRef } from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import "./styles/CustomDatePicker.css"

// Funções auxiliares
const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

const getMonthName = (date, locale = 'pt-BR') => {
    return date.toLocaleString(locale, { month: 'long' });
};

export default function CustomDatePicker({ selectedDate, onDateChange }) {
    // --- ESTADOS ---
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [displayValue, setDisplayValue] = useState(formatDateForDisplay(selectedDate));
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const [viewMode, setViewMode] = useState('days'); // 'days', 'months', 'years'
    const [yearRangeStart, setYearRangeStart] = useState(new Date().getFullYear());

    // --- REFs ---
    const datePickerRef = useRef(null);
    const inputRef = useRef(null);

    // --- Lógica de Data Atual ---
    // Cria uma referência para "hoje" zerando as horas, para comparações precisas.
    const today = new Date();
    today.setHours(0, 0, 0, 0);


    // --- EFEITOS (useEffect) ---
    // (O resto dos useEffects permanece o mesmo)
    useEffect(() => {
        setDisplayValue(formatDateForDisplay(selectedDate));
        const initialDate = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date();
        setCurrentMonth(initialDate);
    }, [selectedDate]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setIsOpen(false);
                setViewMode('days');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            const calendarWidth = 280;
            const gap = 8;
            const spaceOnRight = window.innerWidth - (rect.right + gap + calendarWidth);
            const newLeft = spaceOnRight > 0 ? rect.right + window.scrollX + gap : rect.left + window.scrollX - calendarWidth - gap;
            setPopupPosition({ top: rect.top + window.scrollY, left: newLeft });
        }
    }, [isOpen]);

    // --- MANIPULADORES DE EVENTOS (Handlers) ---
    // (O resto dos handlers permanece o mesmo)
    const handleInputClick = () => {
        if (isOpen) {
            setIsOpen(false);
            setViewMode('days');
        } else {
            setIsOpen(true);
        }
    };

    const handleDateSelect = (day) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const newDateString = newDate.toISOString().split('T')[0];
        onDateChange(newDateString);
        setIsOpen(false);
        setViewMode('days');
    };

    const handleMonthSelect = (monthIndex) => {
        setCurrentMonth(new Date(currentMonth.setMonth(monthIndex)));
        setViewMode('days');
    };

    const handleYearSelect = (year) => {
        setCurrentMonth(new Date(currentMonth.setFullYear(year)));
        setViewMode('days');
    };

    const handleHeaderNavigation = (amount) => {
        if (viewMode === 'days') {
            setCurrentMonth(prev => {
                const newDate = new Date(prev);
                newDate.setMonth(newDate.getMonth() + amount);
                return newDate;
            });
        } else if (viewMode === 'years') {
            setYearRangeStart(prev => prev + (amount * 12));
        }
    };

    // --- LÓGICA DE RENDERIZAÇÃO (COM ATUALIZAÇÕES) ---

    const renderHeader = () => {
        // ... (A função renderHeader não precisa de alterações)
        const year = currentMonth.getFullYear();
        let title;
        switch (viewMode) {
            case 'months':
                title = <span className="calendar-title year-title" onClick={() => setViewMode('years')}>{year}</span>;
                break;
            case 'years':
                { const endYear = yearRangeStart + 11;
                title = <span className="calendar-title">{`${yearRangeStart} - ${endYear}`}</span>;
                break; }
            default: // 'days'
                title = (
                    <>
                        <span className="calendar-title month-title" onClick={() => setViewMode('months')}>
                            {getMonthName(currentMonth)}
                        </span>
                        <span className="calendar-title year-title" onClick={() => {
                            setYearRangeStart(Math.floor(year / 12) * 12);
                            setViewMode('years');
                        }}>
                            {year}
                        </span>
                    </>
                );
        }
        return (
            <div className="calendar-header">
                <button type="button" onClick={() => handleHeaderNavigation(-1)} disabled={viewMode === 'months'}> <IconChevronLeft size={20} /> </button>
                <div className="calendar-title-container">{title}</div>
                <button type="button" onClick={() => handleHeaderNavigation(1)} disabled={viewMode === 'months'}> <IconChevronRight size={20} /> </button>
            </div>
        );
    };

    const renderDaysView = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        const selected = selectedDate ? new Date(`${selectedDate}T00:00:00`) : null;

        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dateOfThisDay = new Date(year, month, day);

            // --- NOVA LÓGICA ---
            const isPastDate = dateOfThisDay < today;
            // --- FIM DA NOVA LÓGICA ---

            const isToday = today.toDateString() === dateOfThisDay.toDateString();
            const isSelected = selected && selected.toDateString() === dateOfThisDay.toDateString();

            let className = 'calendar-day';
            if (isToday) className += ' today';
            if (isSelected) className += ' selected';
            if (isPastDate) className += ' disabled'; // Adiciona classe para estilo

            days.push(
                <button
                    type="button"
                    key={day}
                    className={className}
                    onClick={() => handleDateSelect(day)}
                    disabled={isPastDate} // Desabilita o botão
                >
                    {day}
                </button>
            );
        }
        return (
            <>
                <div className="calendar-weekdays">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <div key={i}>{d}</div>)}
                </div>
                <div className="calendar-grid">{days}</div>
            </>
        );
    };

    const renderMonthsView = () => {
        const monthNames = [...Array(12).keys()].map(i => getMonthName(new Date(0, i)));
        const currentYear = today.getFullYear();
        const currentMonthIndex = today.getMonth();

        return (
            <div className="calendar-grid-large">
                {monthNames.map((name, index) => {
                    // --- NOVA LÓGICA ---
                    const yearInView = currentMonth.getFullYear();
                    const isPastMonth = yearInView < currentYear || (yearInView === currentYear && index < currentMonthIndex);
                    // --- FIM DA NOVA LÓGICA ---

                    return (
                        <button
                            key={name}
                            className={`calendar-cell ${currentMonth.getMonth() === index ? 'selected' : ''} ${isPastMonth ? 'disabled' : ''}`}
                            onClick={() => handleMonthSelect(index)}
                            disabled={isPastMonth}
                        >
                            {name.substring(0, 3)}
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderYearsView = () => {
        const years = Array.from({ length: 12 }, (_, i) => yearRangeStart + i);
        const currentYear = today.getFullYear();

        return (
            <div className="calendar-grid-large">
                {years.map(year => {
                    // --- NOVA LÓGICA ---
                    const isPastYear = year < currentYear;
                    // --- FIM DA NOVA LÓGICA ---
                    return (
                        <button
                            key={year}
                            className={`calendar-cell ${currentMonth.getFullYear() === year ? 'selected' : ''} ${isPastYear ? 'disabled' : ''}`}
                            onClick={() => handleYearSelect(year)}
                            disabled={isPastYear}
                        >
                            {year}
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <div ref={datePickerRef}>
            <div className="date-picker-input" onClick={handleInputClick} ref={inputRef}>
                {displayValue || <span className="placeholder">Selecione uma data</span>}
            </div>

            {isOpen && (
                <div className="calendar-popup" style={{ position: 'fixed', top: popupPosition.top, left: popupPosition.left, zIndex: 1050 }}>
                    {renderHeader()}
                    <div className="calendar-body">
                        {viewMode === 'days' && renderDaysView()}
                        {viewMode === 'months' && renderMonthsView()}
                        {viewMode === 'years' && renderYearsView()}
                    </div>
                </div>
            )}
        </div>
    );
}