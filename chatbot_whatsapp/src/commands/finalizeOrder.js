const userService = require('../services/userService');

const finalizeOrderCommand = async (client, message, botMessages) => {
    const sender = message.from;
    const userState = userService.getUserState(sender);

    if (userState.currentOrder.length === 0) {
        await client.sendMessage(sender, botMessages["pedido_vazio"]);
    } else {
        let itemsList = "";
        let total = 0;
        userState.currentOrder.forEach((item, index) => {
            itemsList += `${index + 1}. ${item.name} - R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
            total += item.price;
        });


        let confirmationMessage = botMessages["pedido_finalizado_sucesso"]
            .replace("{items_list}", itemsList)
            .replace("{total}", total.toFixed(2).replace('.', ','));

        await client.sendMessage(sender, confirmationMessage);
        
        userService.clearUserState(sender); 
    }
};

module.exports = finalizeOrderCommand;