import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import './styles/DropdownMenu.css'
import {IconEdit, IconTrash} from "@tabler/icons-react";

const DropdownMenu = ({
    isOpen,
    onClose,
    onEdit,
    onDelete,
    triggerRef,
    portalRootId = 'dropdown-portal-root' }) => {

    const dropdownRef = useRef(null);

    // NOVO: Estado para controlar se a posição já foi calculada
    const [isPositioned, setIsPositioned] = useState(false);

    let portalRoot = document.getElementById(portalRootId);
    if (!portalRoot) {
        portalRoot = document.createElement("div");
        portalRoot.setAttribute("id", portalRootId);
        document.body.appendChild(portalRoot);
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target)) {

                onClose();
            }
        };

        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscapeKey);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, onClose, triggerRef] ); // Dependências corrigidas anteriormente

    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();

            setPosition({
                top: rect.bottom + window.scrollY + 5,
                left: rect.left + window.scrollX + rect.width - 150,
            });
            
            // NOVO: Marca que o menu já está posicionado
            setIsPositioned(true);
        } else {
             // NOVO: Reseta o estado quando o menu é fechado
            setIsPositioned(false);
        }
    }, [isOpen, triggerRef]);

    if (!isOpen) {
        return null;
    }

    const menuContent = (
        <div
            ref={dropdownRef}
            className="dropdown-menu"
            role="menu"
            aria-orientation="vertical"
            style={{
                position: "absolute",
                top: `${position.top}px`,
                left: `${position.left}px`,
                zIndex: 1000,
                // NOVO: O menu fica invisível até estar posicionado
                visibility: isPositioned ? 'visible' : 'hidden',
            }}
        >
            <ul>
                <li role="none">
                    <button type="button" role="menuitem" className="edit-option" onClick={onEdit}>
                        <div className="option">
                            <IconEdit stroke={2} width={18} height={18}/>
                            Editar
                        </div>
                    </button>
                </li>
                <li role="none">
                    <button type="button" role="menuitem" className="delete-option" onClick={onDelete}>
                        <div className="option">
                            <IconTrash stroke={2} width={18} height={18}/>
                            Excluir
                        </div>
                    </button>
                </li>
            </ul>
        </div>
    );

    // CORREÇÃO: Removido o div extra 'dropdown-content' que não era necessário no portal
    return ReactDOM.createPortal(menuContent, portalRoot);
}

export default DropdownMenu;