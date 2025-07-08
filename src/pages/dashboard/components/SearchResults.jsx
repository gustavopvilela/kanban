import React from 'react';
import { Link } from 'react-router-dom';
import {
    IconBox,
    IconLayoutColumns,
    IconCreditCard,
    IconChevronRight,
    IconBrandTrello,
    IconCards, IconSlash
} from '@tabler/icons-react';

const ResultItem = ({ result }) => {
    const getIcon = () => {
        switch (result.type) {
            case 'board': return <IconBrandTrello size={24} />;
            case 'column': return <IconLayoutColumns size={24} />;
            case 'card': return <IconCards size={24} />;
            default: return null;
        }
    };

    return (
        <Link to={`/board/${result.board.id}`} className="result-item-link">
            <div className="result-item">
                <div className="result-item-icon">{getIcon()}</div>
                <div className="result-item-content">
                    {/* Renderiza o título destacado */}
                    <p
                        className="result-item-title"
                        dangerouslySetInnerHTML={{ __html: result.highlightedTitle }}
                    />

                    {/* Mostra o "caminho" para colunas e cartões */}
                    {result.type === 'column' && (
                        <p className="result-item-path">
                            Em: <strong>{result.board.title}</strong>
                        </p>
                    )}
                    {result.type === 'card' && (
                        <p className="result-item-path">
                            Em: {result.column.title} / <strong>{result.board.title}</strong> {result.item.isArchived ? '(Arquivado)' : ''}
                        </p>
                    )}
                </div>
                <div className="result-item-arrow">
                    <IconChevronRight />
                </div>
            </div>
        </Link>
    );
};

export default function SearchResults({ results }) {
    if (results.length === 0) {
        return (
            <div className="search-no-results">
                <p>Nenhum resultado encontrado.</p>
            </div>
        );
    }

    return (
        <div className="search-results-container">
            <h2>Resultados da Busca</h2>
            <div className="search-results-list">
                {results.map((result) => (
                    <ResultItem key={`${result.type}-${result.item.id}`} result={result} />
                ))}
            </div>
        </div>
    );
}