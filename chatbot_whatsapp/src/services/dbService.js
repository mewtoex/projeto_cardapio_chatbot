const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

let db;

const initDb = () => {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(config.dbPath, (err) => {
            if (err) {
                console.error("Erro ao conectar ao banco de dados SQLite:", err.message);
                reject(err);
            } else {
                console.log('Conectado ao banco de dados SQLite.');
                db.run(`CREATE TABLE IF NOT EXISTS bot_messages (
                    command TEXT PRIMARY KEY,
                    response_text TEXT,
                    is_active INTEGER,
                    last_updated TEXT
                )`, (createErr) => {
                    if (createErr) {
                        console.error("Erro ao criar tabela bot_messages:", createErr.message);
                        reject(createErr);
                    } else {
                        resolve();
                    }
                });
            }
        });
    });
};

const closeDb = () => {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    console.error("Erro ao fechar banco de dados SQLite:", err.message);
                    reject(err);
                } else {
                    console.log('Conexão SQLite fechada.');
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
};

const saveBotMessages = (messages) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM bot_messages', (err) => {
            if (err) {
                console.error("Erro ao limpar tabela bot_messages:", err.message);
                return reject(err);
            }
            const stmt = db.prepare('INSERT INTO bot_messages VALUES (?, ?, ?, ?)');
            messages.forEach(msg => {
                stmt.run(msg.command, msg.response_text, msg.is_active ? 1 : 0, msg.last_updated);
            });
            stmt.finalize((finalizeErr) => {
                if (finalizeErr) {
                    console.error("Erro ao finalizar statement:", finalizeErr.message);
                    return reject(finalizeErr);
                }
                resolve();
            });
        });
    });
};

const getActiveBotMessages = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT command, response_text FROM bot_messages WHERE is_active = 1', [], (err, rows) => {
            if (err) {
                console.error("Erro ao carregar mensagens ativas do SQLite:", err.message);
                return reject(err);
            }
            const messages = {};
            rows.forEach(row => {
                messages[row.command] = row.response_text;
            });
            resolve(messages);
        });
    });
};

module.exports = {
    initDb,
    closeDb,
    saveBotMessages,
    getActiveBotMessages
};