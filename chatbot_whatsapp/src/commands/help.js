const helpCommand = async (client, message, botMessages) => {
    await client.sendMessage(message.from, botMessages["ajuda"]);
};

module.exports = helpCommand;