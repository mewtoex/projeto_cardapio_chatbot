// Este serviço simula um armazenamento em memória.
// Para produção, substitua por um banco de dados real (Redis, PostgreSQL, etc.)
const userStates = {}; // Key: senderId, Value: { currentOrder: [], lastCommand: '' }

const getUserState = (senderId) => {
    if (!userStates[senderId]) {
        userStates[senderId] = {
            currentOrder: [],
            status: 'open', // 'open', 'finalizing', 'closed'
            selectedAddress: null,
            paymentMethod: null,
            cashProvided: null
        };
    }
    return userStates[senderId];
};

const updateUserState = (senderId, newState) => {
    userStates[senderId] = { ...userStates[senderId], ...newState };
};

const clearUserState = (senderId) => {
    delete userStates[senderId];
};

module.exports = {
    getUserState,
    updateUserState,
    clearUserState
};