const userService = require('../services/userService');

const viewOrderCommand = async (client, message, botMessages) => {
    const sender = message.from;
    const userState = userService.getUserState(sender);

    if (userState.currentOrder.length === 0) {
        await client.sendMessage(sender, botMessages["pedido_vazio"]);
    } else {
        let orderMessage = "*Seu Pedido Atual:*\n\n";
        let total = 0;
        userState.currentOrder.forEach((item, index) => {
            orderMessage += `${index + 1}. *${item.name}* - R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
            total += item.price;
        });
        orderMessage += `\n*Total: R$ ${total.toFixed(2).replace('.', ',')}*\n\nDigite *finalizar pedido* para confirmar ou *pedir [item]* para adicionar mais.`;
        await client.sendMessage(sender, orderMessage);
    }
};

module.exports = viewOrderCommand;