import React, { useEffect, useRef } from "react";
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
    }, );

    const [position, setPosition] = React.useState({ top: 0, left: 0 });

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();

            setPosition({
                top: rect.bottom + window.scrollY + 5,
                left: rect.left + window.scrollX + rect.width - 150,
            });
        }
    }, [isOpen, triggerRef]);

    if (!isOpen) {
        return null;
    }

    const menuContent = (
        <div className="dropdown-content">
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
        </div>
    );

    return ReactDOM.createPortal(menuContent, portalRoot);
}

export default DropdownMenu;