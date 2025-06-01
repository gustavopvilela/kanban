import React from 'react';
import {
    IconMoodEmpty,
    IconWalk,
    IconThumbUp
} from "@tabler/icons-react";

export default function EmptyColumnMessage({ isOver }) {
    if (isOver) {
        return <p className="drop-hint">Solte o cartão aqui</p>;
    }

    return (
        <span>
            <IconMoodEmpty stroke={2} />
            <p>Nenhum cartão ainda...</p>
        </span>
    );
}
