import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuid } from 'uuid';
// CORREÇÃO: Importa a nova ação 'toggleArchiveCard'
import { addCard, updateCard, toggleArchiveCard } from '../../../features/boardsSlice';
import Modal from '../../../components/Modal';
import './styles/CardModal.css';
// CORREÇÃO: Importa o ícone de arquivo
import { IconTrash, IconCircleCheck, IconCircle, IconArchive } from '@tabler/icons-react';

export default function CardModal({ isOpen, onClose, card, columnId, boardId }) {
    const dispatch = useDispatch();

    // Estado interno do formulário
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [dueDate, setDueDate] = useState('');
    const [checklist, setChecklist] = useState([]);
    const [newChecklistItem, setNewChecklistItem] = useState('');

    // Efeito para popular o formulário quando um cartão existente é passado (modo de edição)
    useEffect(() => {
        if (isOpen && card) {
            setTitle(card.title || '');
            setDescription(card.description || '');
            setPriority(card.priority || 'medium');
            setDueDate(card.dueDate ? card.dueDate.split('T')[0] : '');
            setChecklist(card.checklist || []);
        } else {
            // Reseta o formulário para o estado inicial (modo de criação)
            setTitle('');
            setDescription('');
            setPriority('medium');
            setDueDate('');
            setChecklist([]);
        }
    }, [isOpen, card]);

    const handleSave = (e) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('O título do cartão não pode estar vazio.');
            return;
        }

        const cardData = {
            title: title.trim(),
            description: description.trim(),
            priority,
            dueDate,
            checklist,
            // Mantém o estado de arquivamento atual se estiver a editar
            isArchived: card ? card.isArchived : false,
        };

        if (card) {
            // Modo de Edição: atualiza o cartão existente
            dispatch(updateCard({
                boardId,
                columnId,
                updatedCard: { ...card, ...cardData }
            }));
        } else {
            // Modo de Criação: adiciona um novo cartão
            dispatch(addCard({
                boardId,
                columnId,
                newCard: { id: uuid(), ...cardData }
            }));
        }
        onClose(); // Fecha o modal após salvar
    };

    // --- NOVA FUNÇÃO PARA ARQUIVAR/DESARQUIVAR ---
    const handleArchiveToggle = () => {
        if (!card) return; // Segurança: só funciona em modo de edição

        dispatch(toggleArchiveCard({
            boardId,
            columnId,
            cardId: card.id
        }));
        onClose(); // Fecha o modal após a ação
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


    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="card-modal-content">
                <h2 className="modal-title">{card ? 'Editar Cartão' : 'Criar Novo Cartão'}</h2>
                <div className="modal-divider"></div>

                <form onSubmit={handleSave}>
                    {/* ... campos do formulário (título, descrição, etc.) ... */}
                    <div className="form-group">
                        <label htmlFor="cardTitle">Título do Cartão</label>
                        <input
                            type="text"
                            id="cardTitle"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Desenvolver a tela de login"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
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
                        <div className="form-group">
                            <label htmlFor="cardPriority">Prioridade</label>
                            <select id="cardPriority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                                <option value="low">Baixa</option>
                                <option value="medium">Média</option>
                                <option value="high">Alta</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="cardDueDate">Prazo</label>
                            <input
                                type="date"
                                id="cardDueDate"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
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
                            <button type="button" className="btn-secondary" onClick={handleAddChecklistItem}>Adicionar</button>
                        </div>
                    </div>


                    <div className="modal-actions">
                        {/* --- NOVO BOTÃO DE ARQUIVAR --- */}
                        {/* Só aparece em modo de edição */}
                        {card && (
                             <button
                                type="button"
                                className="btn-secondary btn-archive"
                                onClick={handleArchiveToggle}
                            >
                                <IconArchive size={16}/>
                                {card.isArchived ? 'Desarquivar' : 'Arquivar'}
                            </button>
                        )}
                        <button type="button" className="btn-danger" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar</button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
