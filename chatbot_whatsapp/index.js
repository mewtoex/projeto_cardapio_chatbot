const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const axios = require("axios");

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

client.on("qr", (qr) => {
    console.log("QR Code Received, scan it with your phone!");
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("WhatsApp client is ready!");
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
        // Fetch all items and filter - inefficient for large menus, consider backend search endpoint
        const allItems = await fetchMenuItems(); 
        const foundItem = allItems.find(item => item.name.toLowerCase() === itemName.toLowerCase());
        return foundItem; // Returns item object or undefined
    } catch (error) {
        console.error("Error finding item by name:", error.message);
        return undefined;
    }
}

// --- Message Handling Logic ---
client.on("message", async (message) => {
    console.log(`Message from ${message.from}: ${message.body}`);

    const sender = message.from;
    const text = message.body.trim(); // Keep original case for item names initially
    const lowerCaseText = text.toLowerCase();

    // Initialize order for sender if not exists
    if (!userOrders[sender]) {
        userOrders[sender] = { items: [], status: 'open' };
    }

    // 1. Greeting Logic
    if ([ "oi", "ola", "olá", "bom dia", "boa tarde", "boa noite"].includes(lowerCaseText)) {
        await client.sendMessage(sender, "Olá! 👋 Bem-vindo ao nosso cardápio virtual. Digite:\n*cardapio* - para ver as categorias\n*cardapio [nome da categoria]* - para ver itens\n*pedir [nome do item]* - para adicionar ao pedido\n*ver pedido* - para revisar seu pedido\n*finalizar pedido* - para confirmar seu pedido\n*ajuda* - para ver os comandos");
        return;
    }

    // 2. Cardapio Command Logic
    if (lowerCaseText.startsWith("cardapio")) {
        await client.sendMessage(sender, "Buscando o cardápio... 🍕🍔🍟");
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
                await client.sendMessage(sender, `Categoria "${categoryName}" não encontrada. Mostrando todas as categorias.`);
                categoryName = null; 
            }
        }

        if (!categoryName) { // Show categories
            categories = categories.length > 0 ? categories : await fetchCategories();
            if (categories.length > 0) {
                let categoryList = "*Categorias Disponíveis:*\n";
                categories.forEach(cat => { categoryList += `- ${cat.name}\n`; });
                categoryList += "\nDigite *cardapio [nome da categoria]* para ver os itens.";
                await client.sendMessage(sender, categoryList);
            } else {
                await client.sendMessage(sender, "Não foi possível buscar as categorias. Tente mais tarde.");
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
            await client.sendMessage(sender, `Nenhum item encontrado para a categoria "${categoryName}".`);
        }
        return;
    }

    // 3. Order Command Logic ("pedir [item name]")
    if (lowerCaseText.startsWith("pedir ")) {
        const itemName = text.substring(6).trim(); // Get item name, preserving case
        if (!itemName) {
            await client.sendMessage(sender, "Por favor, especifique o nome do item que deseja pedir. Ex: *pedir Pizza Margherita*");
            return;
        }
        
        await client.sendMessage(sender, `Buscando "${itemName}"...`);
        const itemToAdd = await findItemByName(itemName);

        if (itemToAdd) {
            userOrders[sender].items.push(itemToAdd);
            await client.sendMessage(sender, `✅ *${itemToAdd.name}* adicionado ao seu pedido!\nDigite *ver pedido* para revisar ou *pedir [outro item]* para adicionar mais.`);
        } else {
            await client.sendMessage(sender, `❌ Desculpe, não encontrei o item "${itemName}". Verifique o nome ou veja o cardápio novamente.`);
        }
        return;
    }

    // 4. View Order Command
    if (lowerCaseText === "ver pedido") {
        const order = userOrders[sender];
        if (order.items.length === 0) {
            await client.sendMessage(sender, "Seu pedido está vazio. Digite *pedir [nome do item]* para adicionar algo.");
        } else {
            let orderMessage = "*Seu Pedido Atual:*\n\n";
            let total = 0;
            order.items.forEach((item, index) => {
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
            await client.sendMessage(sender, "Seu pedido está vazio. Adicione itens antes de finalizar.");
        } else {
            // In a real scenario, you'd save the order to a DB, notify the kitchen, etc.
            let confirmationMessage = "*Pedido Finalizado com Sucesso!* 🎉\n\nItens:\n";
            let total = 0;
            order.items.forEach((item, index) => {
                confirmationMessage += `${index + 1}. ${item.name} - R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
                total += item.price;
            });
            confirmationMessage += `\n*Total: R$ ${total.toFixed(2).replace('.', ',')}*\n\nObrigado pela preferência! Seu pedido está sendo preparado.`;
            await client.sendMessage(sender, confirmationMessage);
            
            // Clear the order after finalization
            userOrders[sender] = { items: [], status: 'closed' }; 
        }
        return;
    }

    // 6. Help Command
    if (lowerCaseText === "ajuda") {
         await client.sendMessage(sender, "*Comandos Disponíveis:*\n*cardapio* - Ver categorias\n*cardapio [categoria]* - Ver itens da categoria\n*pedir [item]* - Adicionar item ao pedido\n*ver pedido* - Revisar seu pedido\n*finalizar pedido* - Confirmar seu pedido\n*horario* - Ver horário de funcionamento\n*entrega* - Informações sobre entrega\n*ajuda* - Mostrar esta mensagem");
         return;
    }

    // 7. FAQ - Horario
    if (lowerCaseText === "horario" || lowerCaseText === "horário") {
        await client.sendMessage(sender, "Nosso horário de funcionamento é das 18:00 às 23:00, de Terça a Domingo.");
        return;
    }

    // 8. FAQ - Entrega
    if (lowerCaseText === "entrega") {
        await client.sendMessage(sender, "Fazemos entregas na região central. A taxa de entrega é R$ 5,00. Tempo estimado: 30-50 minutos.");
        return;
    }

    // Default response for unrecognized commands
    await client.sendMessage(sender, "Desculpe, não entendi. Digite *ajuda* para ver a lista de comandos disponíveis.");
});

// Start the client
client.initialize().catch(err => {
    console.error("Client initialization error:", err);
});

console.log("Client initialization process started.");

