import React from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

export function DndWrapper({ children, onDragEnd }) {
    const sensors = useSensors(useSensor(PointerSensor));
    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            {children}
        </DndContext>
    );
}