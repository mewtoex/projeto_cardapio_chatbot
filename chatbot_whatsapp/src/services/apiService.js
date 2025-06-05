const axios = require('axios');
const config = require('../config');

const API_BASE_URL = config.apiBaseUrl;

const apiService = {
    fetchBotMessages: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/bot_messages`);
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar mensagens do bot da API:", error.message);
            throw new Error("Não foi possível carregar as mensagens do bot da API.");
        }
    },

    fetchCategories: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/categories`);
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar categorias da API:", error.message);
            throw new Error("Não foi possível carregar as categorias do cardápio.");
        }
    },

    fetchMenuItems: async (categoryId = null) => {
        try {
            let url = `${API_BASE_URL}/menu_items`;
            if (categoryId) {
                url += `?category_id=${categoryId}`;
            }
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar itens do cardápio da API:", error.message);
            throw new Error("Não foi possível carregar os itens do cardápio.");
        }
    },
};

module.exports = apiService;