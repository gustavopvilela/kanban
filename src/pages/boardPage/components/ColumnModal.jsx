import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';

export default function ColumnModal({ isOpen, onClose, onSave, column }) {
    const [title, setTitle] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTitle(column ? column.title : '');
        }
    }, [isOpen, column]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (title.trim()) {
            // A função onSave agora só envia o título
            onSave(title.trim());
            onClose();
        } else {
            alert("O título da coluna não pode estar vazio!");
        }
    };

    const modalTitle = column ? 'Editar Coluna' : 'Criar Nova Coluna';

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="modal-title">{modalTitle}</h2>
            <div className="modal-divider"></div>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="columnTitle">Título</label>
                    <input
                        type="text"
                        id="columnTitle"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Em andamento"
                        required
                        autoFocus
                    />
                </div>
                
                <div className="modal-actions">
                    <button type="button" className="btn-danger" onClick={onClose}>Cancelar</button>
                    <button type="submit" className="btn-primary">Salvar</button>
                </div>
            </form>
        </Modal>
    );
}