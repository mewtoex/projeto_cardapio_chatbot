const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const config = require('./config');
const dbService = require('./services/dbService');
const apiService = require('./services/apiService');
const userService = require('./services/userService');
const { parseCommand } = require('./utils/messageParser');

const helpCommand = require('./commands/help');
const menuCommand = require('./commands/menu');
const orderCommand = require('./commands/order');
const viewOrderCommand = require('./commands/viewOrder');
const finalizeOrderCommand = require('./commands/finalizeOrder');

const commands = {
    "ajuda": helpCommand,
    "cardapio": menuCommand,
    "menu": menuCommand, 
    "pedir": orderCommand,
    "adicionar": orderCommand, 
    "ver pedido": viewOrderCommand,
    "meu pedido": viewOrderCommand,
    "finalizar pedido": finalizeOrderCommand,
};

let botMessages = {};

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
    }
});

const loadBotMessages = async () => {
    try {
        console.log("Buscando mensagens do bot da API...");
        const messages = await apiService.fetchBotMessages();
        await dbService.saveBotMessages(messages); // Salvar no SQLite
        
        botMessages = {};
        messages.forEach(msg => {
            if (msg.is_active) {
                botMessages[msg.command] = msg.response_text;
            }
        });
        console.log('Mensagens do bot carregadas da API e salvas no SQLite.');
    } catch (error) {
        console.error("Erro ao buscar mensagens do bot da API:", error.message);
        console.log("Tentando carregar mensagens do bot do SQLite local como fallback...");
        try {
            botMessages = await dbService.getActiveBotMessages();
            if (Object.keys(botMessages).length === 0) {
                console.log('Nenhuma mensagem do bot encontrada no SQLite local. Definindo mensagens padrão.');
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
            }
            console.log('Mensagens do bot carregadas do SQLite (fallback).');
        } catch (dbError) {
            console.error("Erro fatal: Não foi possível carregar mensagens do bot da API nem do SQLite. Definindo mensagens padrão.", dbError.message);
            botMessages = {  };
        }
    }
};

client.on("qr", (qr) => {
    console.log("QR Code Received, scan it with your phone!");
    qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
    console.log("WhatsApp client is ready!");
    await dbService.initDb(); 
    await loadBotMessages(); 
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

client.on("message", async (message) => {
    console.log(`Message from ${message.from}: ${message.body}`);

    const sender = message.from;
    const { command, args } = parseCommand(message.body);
    const lowerCaseText = message.body.toLowerCase().trim(); // Manter para saudações e FAQs diretas

    if (["oi", "ola", "olá", "bom dia", "boa tarde", "boa noite"].includes(lowerCaseText)) {
        await client.sendMessage(sender, botMessages["saudacao"]);
        return;
    }

    if (lowerCaseText === "horario" || lowerCaseText === "horário") {
        await client.sendMessage(sender, botMessages["horario_funcionamento"]);
        return;
    }
    if (lowerCaseText === "entrega") {
        await client.sendMessage(sender, botMessages["info_entrega"]);
        return;
    }

    const commandHandler = commands[command];
    
    if (!commandHandler) {
        const complexCommandKey = Object.keys(commands).find(key => lowerCaseText.startsWith(key));
        if (complexCommandKey) {
            commands[complexCommandKey](client, message, botMessages, lowerCaseText.substring(complexCommandKey.length).trim());
            return;
        }
    } else {
        commandHandler(client, message, botMessages, args);
        return;
    }

    await client.sendMessage(sender, botMessages["comando_nao_entendido"]);
});

const startApp = async () => {
    console.log("Client initialization process started.");
    try {
        await client.initialize();
    } catch (err) {
        console.error("Client initialization error:", err);
    }
};

process.on('beforeExit', async () => {
    await dbService.closeDb();
});

module.exports = {
    start: startApp,
    getClient: () => client, 
};