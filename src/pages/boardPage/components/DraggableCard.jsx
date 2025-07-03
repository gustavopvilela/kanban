import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconFlag, IconCalendar, IconChecklist, IconPencil } from '@tabler/icons-react';
import './styles/DraggableCard.css';

// Componente auxiliar para renderizar os ícones/badges
const CardBadges = ({ card }) => {
    const { priority, dueDate, checklist } = card;

    const completedItems = checklist ? checklist.filter(item => item.completed).length : 0;
    const totalItems = checklist ? checklist.length : 0;

    const priorityLabels = {
        low: 'Baixa',
        medium: 'Média',
        high: 'Alta'
    };

    return (
        <div className="card-badges">
            {priority && (
                <span className={`badge priority-${priority}`} title={`Prioridade: ${priorityLabels[priority]}`}>
                    <IconFlag size={16} />
                </span>
            )}
            {dueDate && (
                <span className="badge" title={`Prazo: ${new Date(dueDate).toLocaleDateString()}`}>
                    <IconCalendar size={16} />
                    {new Date(dueDate).toLocaleDateString()}
                </span>
            )}
            {checklist && totalItems > 0 && (
                <span className="badge" title="Progresso da checklist">
                    <IconChecklist size={16} />
                    {completedItems}/{totalItems}
                </span>
            )}
        </div>
    );
};

export default function DraggableCard({ card, columnId, onEdit }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: card.id,
        data: {
            type: 'card',
            card,
            columnId,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    // O título do cartão agora vem de `card.title`
    const cardTitle = card.title || 'Cartão sem título';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="card"
            data-priority={card.priority || 'medium'} // Para estilização via CSS
        >
            <div className="card-content">
                <p>{cardTitle}</p>
                <CardBadges card={card} />
            </div>
            <div className="card-footer">
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Evita que o clique acione o drag
                        onEdit();
                    }}
                    className="card-edit-btn"
                    title="Editar cartão"
                >
                    <IconPencil size={16} />
                </button>
            </div>
        </div>
    );
}
