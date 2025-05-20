# Projeto Cardápio Virtual com Chatbot WhatsApp

Este projeto integra um cardápio virtual web (Progressive Web App - PWA) com um chatbot para WhatsApp, utilizando um backend Flask para gerenciar os dados do cardápio.

## Estrutura do Projeto

```
/projeto_cardapio_chatbot
├── backend/
│   └── backend_app/        # Aplicação Flask (API)
│       ├── src/
│       │   ├── models/     # Modelos SQLAlchemy (category.py, menu_item.py)
│       │   ├── routes/     # Blueprints Flask (category_routes.py, menu_item_routes.py)
│       │   ├── static/     # Arquivos estáticos (opcional)
│       │   └── main.py     # Ponto de entrada da API Flask
│       ├── venv/           # Ambiente virtual Python
│       └── requirements.txt # Dependências Python
├── frontend_pwa/
│   └── cardapio_pwa/       # Aplicação React (PWA)
│       ├── public/         # Arquivos públicos (index.html, manifest.json, icons)
│       ├── src/            # Código fonte React (App.tsx, main.tsx, etc.)
│       ├── package.json    # Dependências Node.js e scripts
│       ├── pnpm-lock.yaml  # Lockfile do pnpm
│       └── vite.config.ts  # Configuração do Vite (incluindo PWA plugin)
└── chatbot_whatsapp/       # Aplicação Node.js (Chatbot)
    ├── node_modules/     # Dependências Node.js
    ├── index.js          # Código principal do chatbot
    └── package.json      # Dependências Node.js
```

## Componentes

1.  **Backend (Flask API):**
    *   Localização: `backend/backend_app`
    *   Tecnologia: Python, Flask, SQLAlchemy, PyMySQL
    *   Funcionalidade: Gerencia categorias e itens do cardápio através de uma API RESTful. Utiliza um banco de dados MySQL (configurado para `localhost:3306`, usuário `root`, senha `password`, banco `mydb` por padrão - ajuste `src/main.py` se necessário).

2.  **Frontend (React PWA):**
    *   Localização: `frontend_pwa/cardapio_pwa`
    *   Tecnologia: React, TypeScript, Vite, Tailwind CSS, `vite-plugin-pwa`
    *   Funcionalidade: Exibe o cardápio virtual, permitindo filtrar por categorias e buscar itens. É um Progressive Web App, permitindo instalação e (com o service worker configurado) funcionamento offline básico.

3.  **Chatbot (Node.js):**
    *   Localização: `chatbot_whatsapp`
    *   Tecnologia: Node.js, `whatsapp-web.js`, `qrcode-terminal`, `axios`
    *   Funcionalidade: Interage com usuários via WhatsApp, permitindo visualizar o cardápio (categorias e itens), adicionar itens a um pedido (simulado em memória), revisar e finalizar o pedido. Responde a perguntas frequentes básicas.
    *   **Importante:** Utiliza `whatsapp-web.js`, uma biblioteca não oficial que automatiza o WhatsApp Web. Requer escanear um QR code e pode ser instável devido a atualizações do WhatsApp. Para produção, APIs oficiais (Twilio, Meta Cloud API) são recomendadas.

## Como Executar

**Pré-requisitos:**
*   Python 3.11+
*   Node.js (v20+ recomendado)
*   npm ou pnpm
*   MySQL Server (ou Docker com imagem MySQL)

**1. Backend (Flask API):**

```bash
# Navegue até o diretório do backend
cd backend/backend_app

# Crie e ative o ambiente virtual (se ainda não existir)
# python3.11 -m venv venv # Descomente se necessário
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Execute a API (verifique se o MySQL está rodando)
python src/main.py

# A API estará rodando em http://localhost:5000
```

**2. Frontend (React PWA):**

```bash
# Navegue até o diretório do frontend
cd ../../frontend_pwa/cardapio_pwa

# Instale as dependências (use pnpm se disponível, senão npm)
# pnpm install # ou npm install

# Execute o servidor de desenvolvimento
# pnpm run dev # ou npm run dev

# O PWA estará acessível em http://localhost:3000 (ou outra porta se configurado)
# Certifique-se que a URL da API no App.tsx (API_BASE_URL) está correta
```

**3. Chatbot (Node.js):**

```bash
# Navegue até o diretório do chatbot
cd ../../chatbot_whatsapp

# Instale as dependências
npm install

# Execute o chatbot
node index.js

# Um QR code será exibido no terminal. Escaneie-o com seu WhatsApp.
# O chatbot começará a responder às mensagens após a autenticação.
# Certifique-se que a URL da API no index.js (API_BASE_URL) está correta
```

## Observações

*   **Banco de Dados:** O backend está configurado para usar MySQL. Certifique-se de que o servidor MySQL esteja rodando e acessível com as credenciais definidas em `backend/backend_app/src/main.py` (ou via variáveis de ambiente).
*   **Chatbot:** A estabilidade do chatbot depende da biblioteca `whatsapp-web.js`. Problemas de conexão podem ocorrer.
*   **Implantação:** A implantação em produção foi pulada a pedido do usuário. O backend Flask e o frontend React (após build `pnpm run build`) podem ser implantados separadamente em plataformas adequadas (ex: Heroku, Vercel, Netlify, servidores próprios).


