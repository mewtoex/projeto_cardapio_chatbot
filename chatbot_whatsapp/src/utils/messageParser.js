const parseCommand = (text) => {
    const parts = text.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');
    return { command, args };
};

module.exports = {
    parseCommand
};