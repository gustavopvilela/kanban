import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuid } from 'uuid';
import { addCard, updateCard, toggleArchiveCard } from '../../../features/boardsSlice';
import Modal from '../../../components/Modal';
import CustomDatePicker from './CustomDatePicker.jsx';
import './styles/CardModal.css';
import { IconTrash, IconCircleCheck, IconCircle, IconArchive, IconPlus, IconArchiveOff, IconAlertTriangle, IconExclamationCircle, IconCheck } from '@tabler/icons-react';
import { useToastContext } from "../../../contexts/ToastContext.jsx";

export default function CardModal({ isOpen, onClose, card, columnId, onDeleteCard }) { // Adicionada a prop onDeleteCard
    const dispatch = useDispatch();
    const { addToast } = useToastContext();

    // Estado interno do formulário
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [dueDate, setDueDate] = useState('');
    const [checklist, setChecklist] = useState([]);
    const [newChecklistItem, setNewChecklistItem] = useState('');

    const isEditing = card != null;

    useEffect(() => {
        if (isOpen && card) {
            setTitle(card.title || '');
            setDescription(card.description || '');
            setPriority(card.priority || 'medium');
            setDueDate(card.dueDate ? card.dueDate.split('T')[0] : '');
            setChecklist(card.checklist || []);

            if (card.isArchived) {
                addToast('Este cartão está arquivado e não pode ser editado.', {
                    type: 'warning',
                    icon: <IconAlertTriangle size={24} />
                });
            }

        } else if (isOpen) {
            // Reset para um novo cartão
            setTitle('');
            setDescription('');
            setPriority('medium');
            setDueDate('');
            setChecklist([]);
            setNewChecklistItem('');
        }
    }, [isOpen, card, addToast]);

    const handleSave = (e) => {
        e.preventDefault();
        if (!title.trim()) {
            addToast('O título do cartão não pode estar vazio.', {
                type: 'danger',
                icon: <IconExclamationCircle size={24} />
            });
            return;
        }

        const cardData = {
            title: title.trim(),
            description: description.trim(),
            priority,
            dueDate,
            checklist,
            isArchived: card ? card.isArchived : false,
        };

        if (card) {
            // Edição
            dispatch(updateCard({
                updatedCard: { ...card, ...cardData }
            }));
            addToast('Cartão atualizado com sucesso!', { type: 'success', icon: <IconCheck size={24} /> });
        } else {
            // Criação
            dispatch(addCard({
                columnId,
                newCard: { id: uuid(), ...cardData }
            }));
            addToast('Cartão criado com sucesso!', { type: 'success', icon: <IconCheck size={24} /> });
        }
        onClose();
    };

    const handleArchiveToggle = () => {
        if (!card) return;
        dispatch(toggleArchiveCard({ cardId: card.id }));
        if (!card.isArchived) {
            addToast('Cartão arquivado.', { type: 'info', icon: <IconArchive size={24} /> });
        } else {
            addToast('Cartão desarquivado.', { type: 'info', icon: <IconArchiveOff size={24} /> });
        }
        onClose();
    };

    const handleAddChecklistItem = () => {
        if (newChecklistItem.trim()) {
            const newItem = {
                id: uuid(),
                text: newChecklistItem.trim(),
                completed: false
            };
            setChecklist([...checklist, newItem]);
            setNewChecklistItem('');
        }
    };

    const handleToggleChecklistItem = (itemId) => {
        setChecklist(checklist.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
        ));
    };

    const handleDeleteChecklistItem = (itemId) => {
        setChecklist(checklist.filter(item => item.id !== itemId));
    };

    const formGroup = `form-group ${card && card.isArchived ? "readonly-container" : ""}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="card-modal-content">
                <h2 className="modal-title">{isEditing ? "Editar cartão" : "Criar novo cartão" }</h2>
                <div className="modal-divider"></div>

                <form onSubmit={handleSave}>
                    <div className={formGroup}>
                        <label htmlFor="cardTitle">Título</label>
                        <input
                            type="text"
                            id="cardTitle"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Desenvolver a tela de login"
                        />
                    </div>

                    <div className={formGroup}>
                        <label htmlFor="cardDescription">Descrição</label>
                        <textarea
                            id="cardDescription"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Adicione uma descrição mais detalhada..."
                            rows="3"
                        ></textarea>
                    </div>

                    <div className="form-row">
                        <div className={formGroup}>
                            <label htmlFor="cardPriority">Prioridade</label>
                            <select id="cardPriority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                                <option value="low">Baixa</option>
                                <option value="medium">Média</option>
                                <option value="high">Alta</option>
                            </select>
                        </div>
                        <div className={formGroup}>
                            <label htmlFor="cardDueDate">Prazo</label>
                            <CustomDatePicker
                                selectedDate={dueDate}
                                onDateChange={setDueDate}
                            />
                        </div>
                    </div>

                    <div className={formGroup}>
                        <label>Checklist</label>
                        <div className="checklist-container">
                            {checklist.map(item => (
                                <div key={item.id} className={`checklist-item ${item.completed ? 'completed' : ''}`}>
                                    <button type="button" onClick={() => handleToggleChecklistItem(item.id)}>
                                        {item.completed ? <IconCircleCheck size={20} /> : <IconCircle size={20} />}
                                    </button>
                                    <span>{item.text}</span>
                                    <button type="button" className="btn-delete-item" onClick={() => handleDeleteChecklistItem(item.id)}>
                                        <IconTrash size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="add-checklist-item">
                            <input
                                type="text"
                                value={newChecklistItem}
                                onChange={(e) => setNewChecklistItem(e.target.value)}
                                placeholder="Adicionar um item..."
                            />
                            <button type="button" className="btn-secondary add-item-btn" onClick={handleAddChecklistItem}><IconPlus/></button>
                        </div>
                    </div>

                    <div className="modal-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            {isEditing && (
                                <>
                                    <button
                                        type="button"
                                        className="btn-icon"
                                        onClick={handleArchiveToggle}
                                        title={card.isArchived ? "Desarquivar cartão" : "Arquivar cartão"}
                                    >
                                            {card.isArchived ? <IconArchiveOff size={22}/> : <IconArchive size={22}/>}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-icon btn-delete"
                                        onClick={() => onDeleteCard(card)}
                                        style={{ marginLeft: '8px' }}
                                    >
                                        <IconTrash size={22} />
                                    </button>
                                </>
                            )}
                        </div>
                        <div> {/* Container para os botões da direita */}
                            <button type="button" className="btn-secondary cancel-btn" onClick={onClose} style={{ marginRight: '8px' }}>Cancelar</button>
                            {(!card || !card.isArchived) && (
                                <button type="submit" className="btn-primary">Salvar</button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
}