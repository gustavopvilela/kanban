import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {IconFlag, IconCalendar, IconChecklist, IconPencil, IconCircleCheck} from '@tabler/icons-react';
import './styles/DraggableCard.css';
import {toggleCardSelection} from "../../../features/boardsSlice.js";
import {useDispatch} from "react-redux";

const ChecklistProgress = ({ checklist }) => {
    // Continua a não mostrar nada se não houver checklist
    if (!checklist || checklist.length === 0) {
        return null;
    }

    const totalItems = checklist.length;
    const completedItems = checklist.filter(item => item.completed).length;
    
    const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    // CORREÇÃO: A condição que escondia o progresso em 0% foi removida.

    return (
        <div className="badge checklist-badge" title={`${completedItems} de ${totalItems} tarefas concluídas`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <IconChecklist size={16} />
                <span>{completedItems}/{totalItems}</span>
            </div>
            <div className="progress-bar-background">
                <div 
                    className="progress-bar-foreground" 
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>
    );
};

const CardBadges = ({ card }) => {
    const { priority, dueDate, checklist } = card;

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
                <span className="badge" title={`Prazo: ${new Date(dueDate + 'T00:00:00').toLocaleDateString()}`}>
                    <IconCalendar size={16} />
                    {new Date(dueDate + 'T00:00:00').toLocaleDateString()}
                </span>
            )}
            <ChecklistProgress checklist={checklist} />
        </div>
    );
};

const DraggableCard = React.memo(({ card, onEdit, isMultiSelectEnabled, isSelected }) => {
    const dispatch = useDispatch();
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
        },
        disabled: isMultiSelectEnabled,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const cardTitle = card.title || 'Cartão sem título';

    const handleCardClick = () => {
        if (isMultiSelectEnabled) {
            dispatch(toggleCardSelection(card.id));
        }
    }

    const cardClassName = `card ${isSelected ? 'selected' : ''} ${isMultiSelectEnabled ? 'selectable' : ''}`;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(!isMultiSelectEnabled ? attributes : {})}
            {...(!isMultiSelectEnabled ? listeners : {})}
            onClick={handleCardClick}
            className={cardClassName}
            data-priority={card.priority || 'medium'}
        >
            {isMultiSelectEnabled && (
                <div className="selection-indicator">
                    {isSelected && <IconCircleCheck size={20} stroke={2.5} />}
                </div>
            )}

            <div className="card-content">
                <p>{cardTitle}</p>
                <CardBadges card={card} />
            </div>

            {!isMultiSelectEnabled && (
                <div className="card-footer">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="card-edit-btn"
                        title="Editar cartão"
                    >
                        <IconPencil size={16} />
                    </button>
                </div>
            )}
        </div>
    );
});

export default DraggableCard;