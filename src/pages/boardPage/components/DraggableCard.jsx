import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function DraggableCard({ card, columnId, onRemove }) {
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="card"
            title={card.text}
        >
            <div className="card-content">
                {card.text || 'Cartão sem texto'}
            </div>
            <button
                onClick={e => {
                    e.stopPropagation(); // Evita conflito entre click e drag
                    onRemove();
                }}
                className="card-remove-btn"
                title="Remover cartão"
            >
                ×
            </button>
        </div>
    );
}
