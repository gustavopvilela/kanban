import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableCard from './DraggableCard';
import EmptyColumnMessage from './EmptyColumnMessage';
import {IconPlus, IconTrash} from "@tabler/icons-react";

export default function DroppableColumn({
                                            column,
                                            onAddCard,
                                            onRemoveColumn,
                                            onRemoveCard
                                        }) {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
        data: {
            type: 'column',
            column
        }
    });

    const columnCards = column.cards || [];
    const columnTitle = column.title || 'Coluna sem título';

    return (
        <div className="column">
            {/* Cabeçalho da coluna */}
            <div className="column-header">
                <h3 title={columnTitle}>{columnTitle}</h3>
                <div className="column-actions">
                    <button
                        onClick={() => onAddCard(column.id)}
                        className="btn-secondary btn-small"
                        title="Adicionar novo cartão"
                    >
                        <IconPlus stroke={2} width={16} height={16} />
                    </button>
                    <button
                        onClick={() => onRemoveColumn(column.id)}
                        className="btn-danger btn-small"
                        title="Remover coluna"
                    >
                        <IconTrash stroke={2} width={16} height={16}/>
                    </button>
                </div>
            </div>

            {/* Área de drop */}
            <div
                ref={setNodeRef}
                className={`cards-container ${isOver ? 'drag-over' : ''}`}
            >
                {columnCards.length === 0 ? (
                    <div className="empty-column">
                        <EmptyColumnMessage isOver={isOver} />
                    </div>
                ) : (
                    <SortableContext
                        items={columnCards.map(card => card.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {columnCards.map(card => (
                            <DraggableCard
                                key={card.id}
                                card={card}
                                columnId={column.id}
                                onRemove={() => onRemoveCard(column.id, card.id)}
                            />
                        ))}
                    </SortableContext>
                )}
            </div>
        </div>
    );
}
