import React, { useMemo, useState } from 'react';
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import CalendarGrid from "./components/CalendarGrid.jsx";
import CardModal from "../boardPage/components/CardModal.jsx";
import "./CalendarPage.css";
import { IconLayoutBoard } from "@tabler/icons-react";
import { makeSelectCalendarCards } from '../../features/selectors';

const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3,
};

const CalendarPage = () => {
    const { id: boardId } = useParams();
    const [editingCard, setEditingCard] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const selectCalendarCards = useMemo(makeSelectCalendarCards, []);
    const { board, cardsWithDueDate, allColumns } = useSelector(state => selectCalendarCards(state, boardId));

    const cardsByDate = useMemo(() => {
        const grouped = {};
        cardsWithDueDate.forEach(card => {
            const date = card.dueDate.split('T')[0];
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(card);
        });

        for (const date in grouped) {
            grouped[date].sort((a, b) => {
                const priorityA = priorityOrder[a.priority] || 99;
                const priorityB = priorityOrder[b.priority] || 99;
                return priorityA - priorityB;
            });
        }

        return grouped;
    }, [cardsWithDueDate]);

    const handleCardClick = (card) => {
        const parentColumn = Object.values(allColumns).find(c => c.cards.includes(card.id));
        setEditingCard({ ...card, columnId: parentColumn?.id });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCard(null);
    };

    if (!board) {
        return <div>Quadro não encontrado!</div>;
    }

    return (
        <div className="calendar-page-container">
            <div className="calendar-page-header">
                <h1>Calendário: {board.title}</h1>
                <Link to={`/board/${board.id}`} className="btn-secondary">
                    <IconLayoutBoard size={16}/>
                    Voltar ao quadro
                </Link>
            </div>

            <CalendarGrid cardsByDate={cardsByDate} boardId={boardId} onCardClick={handleCardClick} />

            <CardModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                card={editingCard}
                columnId={editingCard?.columnId}
            />
        </div>
    );
};

export default CalendarPage;