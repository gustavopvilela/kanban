import React, { useState, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DraggableCard from './DraggableCard';
import EmptyColumnMessage from './EmptyColumnMessage';
import QuickAddCard from './QuickAddCard';
import { IconPlus, IconDotsVertical } from "@tabler/icons-react";
import DropdownMenu from '../../../components/DropdownMenu.jsx';

export default function DroppableColumn({
    column,
    cards,
    onAddCard,
    onEditCard,
    onRemoveColumn,
    onEditColumn,
    isArchiveView,
    isMultiSelectEnabled,
    selectedCardIds
}) {
    const {
        setNodeRef: setSortableNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        data: {
            type: 'column',
            column,
        },
    });
    
    const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
        id: column.id,
        data: {
            type: 'column',
            column
        }
    });

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const optionsButtonRef = useRef(null);
    
    const columnTitle = column.title || 'Coluna sem título';

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        border: isDragging ? '2px dashed var(--primary-color)' : '2px solid var(--border-color)',
    };
    
    const handleOptionsClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDropdownOpen(prevState => !prevState);
    };

    const closeDropdown = () => {
        setIsDropdownOpen(false);
    };

    const handleEdit = () => {
        onEditColumn(column);
        closeDropdown();
    };

    const handleDelete = () => {
        onRemoveColumn(column.id);
        closeDropdown();
    };

    return (
        <div ref={setSortableNodeRef} style={style} className="column">
            <div {...attributes} {...listeners} className="column-header" style={{ cursor: 'grab' }}>
                <h3 title={columnTitle}>{columnTitle}</h3>
                {!isArchiveView && (
                    <div className="column-actions">
                        <button
                            // A prop onAddCard agora abre o modal completo, para detalhes
                            onClick={() => onAddCard(column.id)}
                            className="btn-secondary btn-small"
                            title="Adicionar novo cartão com detalhes"
                        >
                            <IconPlus stroke={2} width={16} height={16} />
                        </button>
                        <div style={{position: 'relative'}}>
                            <button
                                ref={optionsButtonRef}
                                onClick={handleOptionsClick}
                                className="btn-secondary btn-small"
                                title="Opções da coluna"
                                aria-haspopup="true"
                                aria-expanded={isDropdownOpen}
                            >
                                <IconDotsVertical stroke={2} width={16} height={16} />
                            </button>
                            <DropdownMenu
                                isOpen={isDropdownOpen}
                                onClose={closeDropdown}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                triggerRef={optionsButtonRef}
                            />
                        </div>
                    </div>
                )}
            </div>

            {!isArchiveView && (
                <div className="quick-add-container">
                    <QuickAddCard columnId={column.id} />
                </div>
            )}

            <div
                ref={setDroppableNodeRef}
                className={`cards-container ${isOver ? 'drag-over' : ''}`}
            >
                {cards.length === 0 && !isArchiveView ? ( // Não mostrar mensagem em modo arquivado
                    <div className="empty-column">
                        <EmptyColumnMessage isOver={isOver} />
                    </div>
                ) : (
                    <SortableContext
                        items={cards.map(card => card.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {cards.map(card => (
                            <DraggableCard
                                key={card.id}
                                card={card}
                                onEdit={() => onEditCard(card, column.id)}
                                isMultiSelectEnabled={isMultiSelectEnabled}
                                isSelected={selectedCardIds.includes(card.id)}
                            />
                        ))}
                    </SortableContext>
                )}
            </div>
        </div>
    );
}