const apiService = require('../services/apiService');
const userService = require('../services/userService');

const orderCommand = async (client, message, botMessages, args) => {
    const sender = message.from;
    const itemName = args.trim();

    if (!itemName) {
        await client.sendMessage(sender, botMessages["pedir_formato_invalido"]);
        return;
    }

    await client.sendMessage(sender, `Buscando "${itemName}"...`);
    
    try {
        const allItems = await apiService.fetchMenuItems();
        const itemToAdd = allItems.find(item => item.name.toLowerCase() === itemName.toLowerCase());

        if (itemToAdd) {
            const userState = userService.getUserState(sender);
            userState.currentOrder.push(itemToAdd); // Adiciona o item
            userService.updateUserState(sender, userState);

            await client.sendMessage(sender, botMessages["item_adicionado"].replace("{itemName}", itemToAdd.name));
        } else {
            await client.sendMessage(sender, botMessages["item_nao_encontrado"].replace("{itemName}", itemName));
        }
    } catch (error) {
        console.error("Erro ao adicionar item ao pedido:", error.message);
        await client.sendMessage(sender, "Ocorreu um erro ao tentar adicionar o item. Por favor, tente novamente.");
    }
};

module.exports = orderCommand;