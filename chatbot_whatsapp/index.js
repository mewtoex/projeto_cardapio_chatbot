const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const axios = require("axios");
const sqlite3 = require('sqlite3').verbose(); // NOVO: Importar sqlite3

// Use LocalAuth to persist session data
const client = new Client({
    authStrategy: new LocalAuth(), // Persist session
    puppeteer: {
        headless: true, // Run Puppeteer in headless mode
        args: [ // Required for running in sandbox/Docker
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // Might cause issues on Windows
            '--disable-gpu'
        ],
    }
});

// API base URL for the backend - Ensure Flask backend is running
const API_BASE_URL = 'http://localhost:5000/api'; // Adjust if backend is hosted elsewhere

// In-memory storage for user orders (simple example, replace with DB for production)
const userOrders = {}; // Key: senderId, Value: { items: [], status: 'open' }

console.log("Initializing WhatsApp client...");

// NOVO: Configurar o banco de dados SQLite
const DB_PATH = './bot_messages.db'; // Caminho para o arquivo do banco de dados
let db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados SQLite:", err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        db.run(`CREATE TABLE IF NOT EXISTS bot_messages (
            command TEXT PRIMARY KEY,
            response_text TEXT,
            is_active INTEGER,
            last_updated TEXT
        )`);
    }
});

// NOVO: Armazenamento em memória para as mensagens do bot carregadas
let botMessages = {};

client.on("qr", (qr) => {
    console.log("QR Code Received, scan it with your phone!");
    qrcode.generate(qr, { small: true });
});

client.on("ready", async () => { // Marque como async
    console.log("WhatsApp client is ready!");
    await loadBotMessages(); // NOVO: Carregar mensagens ao iniciar
});

client.on("authenticated", () => {
    console.log("Client authenticated!");
});

client.on("auth_failure", msg => {
    console.error("Authentication failed:", msg);
});

client.on("disconnected", (reason) => {
    console.log("Client was logged out:", reason);
});

// NOVO: Função para carregar mensagens do backend e salvar no SQLite
async function loadBotMessages() {
    try {
        console.log("Buscando mensagens do bot da API...");
        const response = await axios.get(`${API_BASE_URL}/bot_messages`); // Rota pública
        const messages = response.data;
        
        // Limpar mensagens antigas e inserir novas no SQLite e em memória
        db.run('DELETE FROM bot_messages', (err) => {
            if (err) console.error("Erro ao limpar tabela bot_messages:", err.message);
            
            const stmt = db.prepare('INSERT INTO bot_messages VALUES (?, ?, ?, ?)');
            messages.forEach(msg => {
                stmt.run(msg.command, msg.response_text, msg.is_active ? 1 : 0, msg.last_updated);
                if (msg.is_active) {
                    botMessages[msg.command] = msg.response_text;
                }
            });
            stmt.finalize();
            console.log('Mensagens do bot carregadas e salvas no SQLite.');
        });
    } catch (error) {
        console.error("Erro ao buscar mensagens do bot da API:", error.message);
        // Se falhar a busca, tentar carregar do SQLite existente
        console.log("Tentando carregar mensagens do bot do SQLite local...");
        db.all('SELECT * FROM bot_messages WHERE is_active = 1', [], (err, rows) => {
            if (err) {
                console.error("Erro ao carregar mensagens do bot do SQLite:", err.message);
                return;
            }
            if (rows.length > 0) {
                rows.forEach(row => {
                    botMessages[row.command] = row.response_text;
                });
                console.log('Mensagens do bot carregadas do SQLite (fallback).');
            } else {
                console.log('Nenhuma mensagem do bot encontrada no SQLite local.');
                // Definir mensagens padrão se nada for carregado
                botMessages = {
                    "saudacao": "Olá! 👋 Bem-vindo ao nosso cardápio virtual. Digite:\n*cardapio* - para ver as categorias\n*cardapio [nome da categoria]* - para ver itens\n*pedir [nome do item]* - para adicionar ao pedido\n*ver pedido* - para revisar seu pedido\n*finalizar pedido* - para confirmar seu pedido\n*ajuda* - para ver os comandos",
                    "cardapio_intro": "Buscando o cardápio... 🍕🍔🍟",
                    "categoria_nao_encontrada": "Categoria \"{categoryName}\" não encontrada. Mostrando todas as categorias.",
                    "nenhuma_categoria": "Não foi possível buscar as categorias. Tente mais tarde.",
                    "instrucao_ver_itens": "\nDigite *cardapio [nome da categoria]* para ver os itens.",
                    "nenhum_item_categoria": "Nenhum item encontrado para a categoria \"{categoryName}\".",
                    "pedir_formato_invalido": "Por favor, especifique o nome do item que deseja pedir. Ex: *pedir Pizza Margherita*",
                    "item_nao_encontrado": "❌ Desculpe, não encontrei o item \"{itemName}\". Verifique o nome ou veja o cardápio novamente.",
                    "item_adicionado": "✅ *{itemName}* adicionado ao seu pedido!\nDigite *ver pedido* para revisar ou *pedir [outro item]* para adicionar mais.",
                    "pedido_vazio": "Seu pedido está vazio. Digite *pedir [nome do item]* para adicionar algo.",
                    "pedido_finalizado_sucesso": "*Pedido Finalizado com Sucesso!* 🎉\n\nItens:\n{items_list}\n\n*Total: R$ {total}*\n\nObrigado pela preferência! Seu pedido está sendo preparado.",
                    "ajuda": "*Comandos Disponíveis:*\n*cardapio* - Ver categorias\n*cardapio [categoria]* - Ver itens da categoria\n*pedir [item]* - Adicionar item ao pedido\n*ver pedido* - Revisar seu pedido\n*finalizar pedido* - Confirmar seu pedido\n*horario* - Ver horário de funcionamento\n*entrega* - Informações sobre entrega\n*ajuda* - Mostrar esta mensagem",
                    "horario_funcionamento": "Nosso horário de funcionamento é das 18:00 às 23:00, de Terça a Domingo.",
                    "info_entrega": "Fazemos entregas na região central. A taxa de entrega é R$ 5,00. Tempo estimado: 30-50 minutos.",
                    "comando_nao_entendido": "Desculpe, não entendi. Digite *ajuda* para ver a lista de comandos disponíveis."
                };
                console.log('Mensagens padrão definidas (sem fallback do SQLite).');
            }
        });
    }
}

// --- Helper Functions ---
async function fetchMenuItems(categoryId = null) {
    try {
        let url = `${API_BASE_URL}/menu_items`;
        if (categoryId) {
            url += `?category_id=${categoryId}`;
        }
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching menu items:", error.message);
        return [];
    }
}

async function fetchCategories() {
    try {
        const response = await axios.get(`${API_BASE_URL}/categories`);
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error.message);
        return [];
    }
}

async function findItemByName(itemName) {
    try {
        const allItems = await fetchMenuItems();
        const foundItem = allItems.find(item => item.name.toLowerCase() === itemName.toLowerCase());
        return foundItem;
    } catch (error) {
        console.error("Error finding item by name:", error.message);
        return undefined;
    }
}

// --- Message Handling Logic ---
client.on("message", async (message) => {
    console.log(`Message from ${message.from}: ${message.body}`);

    const sender = message.from;
    const text = message.body.trim();
    const lowerCaseText = text.toLowerCase();

    // Initialize order for sender if not exists
    if (!userOrders[sender]) {
        userOrders[sender] = { items: [], status: 'open' };
    }

    // 1. Greeting Logic
    if (["oi", "ola", "olá", "bom dia", "boa tarde", "boa noite"].includes(lowerCaseText)) {
        await client.sendMessage(sender, botMessages["saudacao"]);
        return;
    }

    // 2. Cardapio Command Logic
    if (lowerCaseText.startsWith("cardapio")) {
        await client.sendMessage(sender, botMessages["cardapio_intro"]);
        const parts = lowerCaseText.split(" ");
        let categoryName = parts.length > 1 ? parts.slice(1).join(" ") : null;
        let categoryId = null;
        let categories = [];

        if (categoryName) {
            categories = await fetchCategories();
            const foundCategory = categories.find(cat => cat.name.toLowerCase() === categoryName);
            if (foundCategory) {
                categoryId = foundCategory.id;
            } else {
                await client.sendMessage(sender, botMessages["categoria_nao_encontrada"].replace("{categoryName}", categoryName));
                categoryName = null;
            }
        }

        if (!categoryName) { // Show categories
            categories = categories.length > 0 ? categories : await fetchCategories();
            if (categories.length > 0) {
                let categoryList = "*Categorias Disponíveis:*\n";
                categories.forEach(cat => { categoryList += `- ${cat.name}\n`; });
                categoryList += botMessages["instrucao_ver_itens"];
                await client.sendMessage(sender, categoryList);
            } else {
                await client.sendMessage(sender, botMessages["nenhuma_categoria"]);
            }
            return;
        }

        // Show items for specific category
        const items = await fetchMenuItems(categoryId);
        if (items.length > 0) {
            let menuMessage = `*Cardápio - ${categoryName.toUpperCase()}*\n\n`;
            items.forEach(item => {
                menuMessage += `*${item.name}*\n`;
                if (item.description) menuMessage += `_${item.description}_\n`;
                menuMessage += `*R$ ${item.price.toFixed(2).replace('.', ',')}*\n\n`;
            });
            menuMessage += "Para adicionar um item, digite *pedir [nome do item]*.";
            await client.sendMessage(sender, menuMessage);
        } else {
            await client.sendMessage(sender, botMessages["nenhum_item_categoria"].replace("{categoryName}", categoryName));
        }
        return;
    }

    // 3. Order Command Logic ("pedir [item name]")
    if (lowerCaseText.startsWith("pedir ")) {
        const itemName = text.substring(6).trim();
        if (!itemName) {
            await client.sendMessage(sender, botMessages["pedir_formato_invalido"]);
            return;
        }
        
        await client.sendMessage(sender, `Buscando "${itemName}"...`);
        const itemToAdd = await findItemByName(itemName);

        if (itemToAdd) {
            // NOTE: Para adicionais e observações, o chatbot precisaria de uma lógica de conversação mais avançada.
            // Por enquanto, adiciona o item base.
            userOrders[sender].items.push(itemToAdd);
            await client.sendMessage(sender, botMessages["item_adicionado"].replace("{itemName}", itemToAdd.name));
        } else {
            await client.sendMessage(sender, botMessages["item_nao_encontrado"].replace("{itemName}", itemName));
        }
        return;
    }

    // 4. View Order Command
    if (lowerCaseText === "ver pedido") {
        const order = userOrders[sender];
        if (order.items.length === 0) {
            await client.sendMessage(sender, botMessages["pedido_vazio"]);
        } else {
            let orderMessage = "*Seu Pedido Atual:*\n\n";
            let total = 0;
            order.items.forEach((item, index) => {
                // Aqui você precisaria adaptar para mostrar adicionais/observações se implementados
                orderMessage += `${index + 1}. *${item.name}* - R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
                total += item.price;
            });
            orderMessage += `\n*Total: R$ ${total.toFixed(2).replace('.', ',')}*\n\nDigite *finalizar pedido* para confirmar ou *pedir [item]* para adicionar mais.`;
            await client.sendMessage(sender, orderMessage);
        }
        return;
    }

    // 5. Finalize Order Command
    if (lowerCaseText === "finalizar pedido") {
        const order = userOrders[sender];
        if (order.items.length === 0) {
            await client.sendMessage(sender, botMessages["pedido_vazio"]);
        } else {
            let itemsList = "";
            let total = 0;
            order.items.forEach((item, index) => {
                itemsList += `${index + 1}. ${item.name} - R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
                total += item.price;
            });

            // Usar a mensagem configurável e preencher os placeholders
            let confirmationMessage = botMessages["pedido_finalizado_sucesso"]
                .replace("{items_list}", itemsList)
                .replace("{total}", total.toFixed(2).replace('.', ','));

            await client.sendMessage(sender, confirmationMessage);
            
            // Clear the order after finalization
            userOrders[sender] = { items: [], status: 'closed' }; 
        }
        return;
    }

    // 6. Help Command
    if (lowerCaseText === "ajuda") {
         await client.sendMessage(sender, botMessages["ajuda"]);
         return;
    }

    // 7. FAQ - Horario
    if (lowerCaseText === "horario" || lowerCaseText === "horário") {
        await client.sendMessage(sender, botMessages["horario_funcionamento"]);
        return;
    }

    // 8. FAQ - Entrega
    if (lowerCaseText === "entrega") {
        await client.sendMessage(sender, botMessages["info_entrega"]);
        return;
    }

    // Default response for unrecognized commands
    await client.sendMessage(sender, botMessages["comando_nao_entendido"]);
});

// Start the client
client.initialize().catch(err => {
    console.error("Client initialization error:", err);
});

console.log("Client initialization process started.");

process.on('beforeExit', () => { // NOVO: Fechar o banco de dados ao sair
    if (db) {
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Conexão SQLite fechada.');
        });
    }
});