const apiService = require('../services/apiService');

const menuCommand = async (client, message, botMessages, args) => {
    await client.sendMessage(message.from, botMessages["cardapio_intro"]);
    
    let categoryName = args;
    let categoryId = null;
    let categories = [];

    try {
        categories = await apiService.fetchCategories();
    } catch (error) {
        console.error("Erro ao buscar categorias:", error.message);
        await client.sendMessage(message.from, botMessages["nenhuma_categoria"]);
        return;
    }

    if (categoryName) {
        const foundCategory = categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
        if (foundCategory) {
            categoryId = foundCategory.id;
        } else {
            await client.sendMessage(message.from, botMessages["categoria_nao_encontrada"].replace("{categoryName}", categoryName));
            categoryName = null; // Reset para mostrar todas as categorias se a específica não for encontrada
        }
    }

    if (!categoryName) { // Show all categories
        if (categories.length > 0) {
            let categoryList = "*Categorias Disponíveis:*\n";
            categories.forEach(cat => { categoryList += `- ${cat.name}\n`; });
            categoryList += botMessages["instrucao_ver_itens"];
            await client.sendMessage(message.from, categoryList);
        } else {
            await client.sendMessage(message.from, botMessages["nenhuma_categoria"]);
        }
        return;
    }

    // Show items for specific category
    try {
        const items = await apiService.fetchMenuItems(categoryId);
        if (items.length > 0) {
            let menuMessage = `*Cardápio - ${categoryName.toUpperCase()}*\n\n`;
            items.forEach(item => {
                menuMessage += `*${item.name}*\n`;
                if (item.description) menuMessage += `_${item.description}_\n`;
                menuMessage += `*R$ ${item.price.toFixed(2).replace('.', ',')}*\n\n`;
            });
            menuMessage += "Para adicionar um item, digite *pedir [nome do item]*.";
            await client.sendMessage(message.from, menuMessage);
        } else {
            await client.sendMessage(message.from, botMessages["nenhum_item_categoria"].replace("{categoryName}", categoryName));
        }
    } catch (error) {
        console.error("Erro ao buscar itens do cardápio:", error.message);
        await client.sendMessage(message.from, "Ocorreu um erro ao buscar os itens do cardápio.");
    }
};

module.exports = menuCommand;