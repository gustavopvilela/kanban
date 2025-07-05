import React, { useState, useEffect, useRef } from "react";
import ThemeToggleButton from "./ThemeToggleButton.jsx";
import './styles/SettingsMenu.css';
import {IconSettings} from "@tabler/icons-react";

export default function SettingsMenu () {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    /* O menu é fechado quando se clica fora dele */
    useEffect(() => {
        function handleClickOutside (event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    return (
        <div className="settings-menu-container" ref={menuRef}>
            <button className="settings-menu-trigger" onClick={() => setIsOpen(!isOpen)} aria-label="Abrir configurações">
                <IconSettings/>
            </button>

            {isOpen && (
                <div className="settings-menu-dropdown">
                    <ul>
                        <li className="settings-menu-item">
                            <ThemeToggleButton menuStyle={true}/>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );

}