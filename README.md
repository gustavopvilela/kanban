# Trabalho prático de Desenvolvimento Front-End: _Quadro Kanban Interativo_

![Front-End](https://img.shields.io/badge/IFMG-Desenvolvimento%20Front--End-024e72)  [![React](https://img.shields.io/badge/React-19.1.0-759ed4)](https://react.dev/) [![Live Test](https://img.shields.io/badge/Live%20test-Clique%20aqui!-435898)](https://gustavopvilela.github.io/kanban/)

## Introdução
Este trabalho foi desenvolvido pelos alunos Gustavo Henrique Pereira Vilela e Patrick Nunes Costa.

Este é um aplicativo de quadro Kanban completo, construído com React, que permite aos usuários gerenciar projetos e tarefas de forma visual e intuitiva. A aplicação é inspirada em ferramentas como o Trello, oferencendo, por exemplo, uma experiência *drag-and-drop* para organizar colunas e cartões.

## Principais funcionalidades

- **Dashboard de quadros:** visualize todos os quadros em um só lugar. É possível criar novos quadros, editar ou excluir quadros existentes.
- **Busca global:** é possível pesquisar instantaneamente por quadros, colunas ou cartões por todo o aplicativo. Os resultados são destacados para fácil visualização.
- **Visão de quadros detalhada:**
  - **Colunas e cartões:** é possível adicionar, editar e remover colunas e cartões.
  - **Drag & drop:** com esta funcionalidade, reordene corões dentro e entre colunas, e também reordene as próprias colunas de maneira simples, implementada com `@dnd-kit`.
- **Detalhes avançados dos cartões:**
  - **Prioridades**: existem três níveis de prioridade (alta, média e baixa) para melhorar a organização visual.
  - **Datas de prazo:** uma data limite pode ser adicionada aos cartões.
  - **_Checklist_:** crie sub-tarefas dentro de um cartão e acompanhe o progresso de completude.
  - **Arquivamento:** arquive cartões para limpara a visão de trabalho sem excluí-los permanentemente.
- **Visão de calendário:** inspirado no Google Agenda, visualize todos os cartões com prazos em um calendário mensal interativo, permitindo uma visão clara das próximas entregas.
- **Persistência de dados:** todo o estado da aplicação, incluindo quadros, temas e configurações, é salvo no `localStorage`, garantindo que os dados não sejam perdidos ao recarregar a página.
- **Tema claro e escuro:** alterne entre os modos de tema para uma melhor experiência visual a qualquer hora.
- **Notificações toast:** receba um feedback visual para ações como criar, atualizar ou arquivar um cartão.

## Tecnologias utilizadas

Este projeto foi construído utilizando tecnologias modernas de front-end:

- **Framework:** [React](https://react.dev/) (v19)
- **Build tool:** [Vite](https://vite.dev/)
- **Gerenciamento de estado:** [Redux Toolkit](https://redux-toolkit.js.org/) para um gerenciamento de estado eficiente e previsível.
  - `@reduxjs/toolkit`: inclui a lógica de slices para quadros e temas.
  - `react-redux`: para conectar os componentes do React ao store do Redux.
  - `redux-persist`: para persistir o estado do Reduz no localStorage.
  - `reselect`: para criar seletores de estado memoizados e otimizar a performance.
- **Roteamento:** [React Router](https://reactrouter.com/) (v7) oara navegação e roteamento do lado do cliente.
- **Drag & drop:** [Dnd-kit](https://dndkit.com/) para uma funcionalidade de arrastar e soltar acessível e performática.
- **Ícones:** [Tabler Icons](https://tabler.io/icons) para uma vasta biblioteca de ícones SVG.
- **Utilitários:**
  - `uuid`: para gerar IDs únicos para quadros, colunas e cartões.

## Instalação e execução

Para executar este projeto localmente, siga os passos abaixo:

1. **Clone o repositório:**
```bash
git clone https://github.com/gustavopvilela/kanban.git
cd kanban
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```
O aplicativo estará disponível em `http://localhost:5173` (ou outra porta, se a 5173 estiver em uso).

## Estrutura de pastas

A estrutura de pastas do projeto está organizada para manter a modularidade e a escalabilidade:

```
/src
|
|-- components/       # Componentes globais e reutilizáveis (Modal, Toast, etc.)
|-- contexts/         # Contextos React (ToastProvider, ThemeManager)
|-- features/         # Lógica do Redux (slices e seletores)
|   |-- boardsSlice.js  # Lógica de estado para quadros, colunas e cartões
|   |-- selectors.js    # Seletores de estado memoizados com reselect
|   +-- themeSlice.js   # Lógica de estado para o tema
|
|-- hooks/            # Hooks personalizados (ex: useLocalStorage)
|-- pages/            # Componentes de página (Dashboard, BoardPage, CalendarPage)
|   |-- boardPage/
|   |-- calendarPage/
|   +-- dashboard/
|
|-- routes/           # Configuração do roteador da aplicação
|-- styles/           # Estilos globais e variáveis de CSS
|
|-- App.jsx           # Componente raiz da aplicação
|-- main.jsx          # Ponto de entrada da aplicação
+-- store.js          # Configuração do store do Redux com persistência
```

## Gerenciamento de estado com Redux

O estado da aplicação é centralizado e gerenciado pelo Redux, utilizando uma abordagem de estado normalizado com `createEntityAdapter` do Redux Toolkit. Isso otimiza a performance para buscas e atualizações de dados.

- `boardsSlice.js`: este "slice" gerencia três entidades normalizadas: `boards`, `columns` e `cards`. Ele contém todos os reducers para as operações de CRUD (adicionar, atualizar e excluir), bem como para mover colunas e cartões.
- `themeSlice.js`: um slice simples para gerenciar o estado do tema (claro ou escuro).
- `store.js`: configura o store principal do Redux, combinando os reducers e integrando o `redux-persist` para salvar o estado `boards` e `theme` no `localStorage` do navegador.
- `selectors.js`: utiliza a biblioteca `reselect` para criar seletores memoizados (ou seja, renderizamos os dados novamente somente se eles tiverem tido alterações desde a última atualização de estado), que computam dados derivados do estado de forma eficiente, evitando re-renderizações desnecessárias.
