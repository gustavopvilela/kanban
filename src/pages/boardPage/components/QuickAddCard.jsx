import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuid } from 'uuid';
import { addCard } from '../../../features/boardsSlice';
import './styles/QuickAddCard.css';
import { IconPlus, IconX } from '@tabler/icons-react';

export default function QuickAddCard({ columnId }) {
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState('');
    const dispatch = useDispatch();
    const formRef = useRef(null);

    useEffect(() => {
        if (isAdding) {
            const inputElement = document.getElementById(`quick-add-input-${columnId}`);
            if (inputElement) {
                inputElement.focus();
            }
        }
    }, [isAdding, columnId]);


    const handleActivate = () => {
        setIsAdding(true);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setTitle('');
    };

    const handleSave = () => {
        if (title.trim()) {
            dispatch(addCard({
                columnId,
                newCard: {
                    id: uuid(),
                    title: title.trim(),
                    description: '',
                    priority: 'medium',
                    dueDate: null,
                    checklist: [],
                    isArchived: false,
                }
            }));
            setTitle('');
        } else {
            handleCancel();
        }
    };

    const handleBlur = () => {
        setTimeout(() => {
            if (document.activeElement === document.getElementById(`quick-add-input-${columnId}`)) {
                return;
            }
            handleSave();
            handleCancel();
        }, 100);
    };


    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    const handleCancelMouseDown = (e) => {
        e.preventDefault();
        handleCancel();
    };

    if (!isAdding) {
        return (
            <div onClick={handleActivate} className="quick-add-placeholder">
                <IconPlus size={16} />
                <span>Adicionar um cartão rapidamente</span>
            </div>
        );
    }

    return (
        <div className="quick-add-form" ref={formRef}>
            <input
                type="text"
                id={`quick-add-input-${columnId}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Insira um título..."
                autoFocus
                onBlur={handleBlur}
            />
            <button onMouseDown={handleCancelMouseDown} className="quick-add-cancel-btn" title="Cancelar">
                <IconX size={18} />
            </button>
        </div>
    );
}