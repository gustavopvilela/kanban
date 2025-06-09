import React, {useRef, useState} from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {IconAlertCircle, IconArrowRight, IconDotsVertical} from '@tabler/icons-react';
import DropdownMenu from "../../../components/DropdownMenu.jsx";
import Modal from "../../../components/Modal.jsx";
import {deleteBoard, updateBoard} from "../../../features/boardsSlice.js";

export default function BoardCard({ board }) {
    const dispatch = useDispatch();

    const totalColumns = board.columns?.length || 0;
    const columnsText = `${totalColumns} ${totalColumns === 1 ? 'coluna' : 'colunas'}`;

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const optionsButtonRef = useRef(null);

    /* Variáveis para o modal de editar */
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newBoardTitle, setNewBoardTitle] = useState('');
    const [newBoardDescription, setNewBoardDescription] = useState('');

    const openEditModal = () => setIsEditModalOpen(true);
    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setNewBoardTitle(''); // Limpa o título previamente definido
        setNewBoardDescription('');
        setIsDropdownOpen(false);
    }

    /* Variáveis para o modal de deletar */
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const openDeleteModal = () => setIsDeleteModalOpen(true);
    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setIsDropdownOpen(false);
    }

    const handleOptionsClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDropdownOpen (prevState => !prevState);
    };

    const closeDropdown = () => {
        setIsDropdownOpen(false);
        if (optionsButtonRef.current) {
            optionsButtonRef.current.focus();
        }
    }

    const handleEdit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setNewBoardTitle(board.title);
        setNewBoardDescription(board.description || "");
        openEditModal();
        closeDropdown();
    }

    const edit = () => {
        if (newBoardTitle && newBoardTitle.trim()) {
            dispatch(
                updateBoard({
                    id: board.id,
                    title: newBoardTitle.trim(),
                    description: newBoardDescription ? newBoardDescription.trim() : board.description,
                    columns: board.columns,
                })
            );
            closeEditModal();
        }
        else {
            alert("O nome do quadro não pode estar vazio!");
        }
    }

    const handleDelete = (event) => {
        event.preventDefault();
        event.stopPropagation();
        openDeleteModal();
        closeDropdown();
    }

    const del = (event) => {
        event.preventDefault();
        event.stopPropagation();
        dispatch(deleteBoard(board.id));
        closeDeleteModal();
    }

    const totalCards = board.columns?.reduce(
        (sum, col) => sum + (col.cards?.length || 0),
        0
    ) || 0;
    const cardsText = `${totalCards} ${totalCards === 1 ? 'cartão' : 'cartões'}`;

    return (
        <div className="dashboard-board-card-wrapper">
            <Link
                key={board.id}
                to={`/board/${board.id}`}
                className="dashboard-board-card"
                aria-label={`Abrir quadro ${board.title}`}
            >
                <div className="board-card-content">
                    {/*<div className="board-card-icon">📊</div>*/}
                    <h3 className="board-card-title">{board.title}</h3>
                    <p className="board-card-description">{board.description ? board.description : ""}</p>
                    <div className="board-card-meta">
                        <span className="board-columns-count">{columnsText}</span>
                        <span className="board-cards-count">{cardsText}</span>
                    </div>
                </div>
                <div className="board-card-arrow">
                    <IconArrowRight stroke={2}/>
                </div>

                <button
                    type="button"
                    className="board-card-options-button"
                    onClick={handleOptionsClick}
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                    aria-label={`Opções para o quadro ${board.title}`}
                    ref={optionsButtonRef}
                >
                    <IconDotsVertical stroke={2} width={18} height={18} />
                </button>
            </Link>

            <DropdownMenu
                isOpen={isDropdownOpen}
                onClose={closeDropdown}
                onEdit={handleEdit}
                onDelete={handleDelete}
                triggerRef={optionsButtonRef}
            />

            {/* Modal para editar. */}
            <Modal isOpen={isEditModalOpen} onClose={closeEditModal} >
                <h2>Editar quadro <i>{board.title}</i></h2>
                <form onSubmit={edit}>
                    <label htmlFor="boardTitle">Novo nome do quadro:</label>
                    <input
                        type="text"
                        id="boardTitle"
                        value={newBoardTitle}
                        placeholder="Ex.: Trabalho final do semestre"
                        onChange={(e) => setNewBoardTitle(e.target.value)}
                        autoFocus
                    />

                    <label htmlFor="boardDescription">Nova descrição:</label>
                    <input
                        type="text"
                        id="boardDescription"
                        value={newBoardDescription}
                        placeholder="Ex.: Planejamento"
                        onChange={(e) => setNewBoardDescription(e.target.value)}
                    />

                    <div className="modal-actions">
                        <button type="button" className="btn-danger" onClick={closeEditModal}>Cancelar</button>
                        <button type="submit" className="btn-primary">Atualizar quadro</button>
                    </div>
                </form>
            </Modal>

            {/* Modal para deletar */}
            <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
                <h2>Deletar quadro <i>{board.title}?</i></h2>
                <form onSubmit={del} className="delete-modal-form">
                    <div className="delete-modal-icon">
                        <IconAlertCircle stroke={2} size={64} />
                    </div>
                    <p className="delete-modal-text">
                        Essa ação é irreversível! Deseja prosseguir?
                    </p>
                    <div className="modal-actions">
                        <button type="button" className="btn-danger" onClick={closeDeleteModal}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            Deletar quadro
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
