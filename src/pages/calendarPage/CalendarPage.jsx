import React, { useMemo, useState } from 'react'
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import CalendarGrid from "./components/CalendarGrid.jsx";
import CardModal from "../boardPage/components/CardModal.jsx";
import "./CalendarPage.css";
import {IconLayoutBoard} from "@tabler/icons-react";

const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3,
};

const CalendarPage = () => {
    const { id: boardId } = useParams();
    const [editingCard, setEditingCard] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { board, cards, columns } = useSelector(state => {
        const boardData = state.boards.boards.entities[boardId];
        const columnsData = boardData?.columns.map(id => state.boards.columns.entities[id]) || [];
        const cardIds = columnsData.flatMap(col => col?.cards || []);
        const cardsData = cardIds.map(id => state.boards.cards.entities[id]);

        return {
            board: boardData,
            cards: cardsData.filter(Boolean),
            columns: state.boards.columns.entities
        };
    });

    const cardsByDate = useMemo(() => {
        const grouped = {};
        cards.forEach(card => {
            if (card.dueDate) {
                const date = card.dueDate.split('T')[0];
                if (!grouped[date]) {
                    grouped[date] = [];
                }
                grouped[date].push(card);
            }
        });

        for (const date in grouped) {
            grouped[date].sort((a, b) => {
                const priorityA = priorityOrder[a.priority] || 99; // Se não tiver prioridade, vai para o fim
                const priorityB = priorityOrder[b.priority] || 99;
                return priorityA - priorityB;
            });
        }

        return grouped;
    }, [cards]);

    const handleCardClick = (card) => {
        const parentColumn = Object.values(columns).find(c => c.cards.includes(card.id));
        setEditingCard({ ...card, columnId: parentColumn.id });
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
                boardId={boardId}
            />
        </div>
    );
};

export default CalendarPage;