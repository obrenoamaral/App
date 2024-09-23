import { CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';

const createDatabase = async () => {
    try {
        const db = await CapacitorSQLite.createConnection({
            database: 'securepass-db',
            version: 1,
            encrypted: false,
            mode: 'no-encryption',
        });

        await db.open();

        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS os (
            numero TEXT PRIMARY KEY,
            dataRegistro TEXT NOT NULL,
            senhaFoto TEXT -- O caminho do arquivo será salvo aqui
        );
        `;

        await db.execute(createTableQuery);

        return db;
    } catch (error) {
        console.error('Erro ao criar banco de dados:', error);
        return null;
    }
};

const insertOS = async (db, os) => {
    try {
        const insertQuery = `
        INSERT INTO os (numero, dataRegistro, senhaFoto)
        VALUES (?, ?, ?);
        `;
        const values = [os.numero, os.dataRegistro, os.senhaFoto];

        // Tenta inserir e captura erro se o número já existir
        await db.run(insertQuery, values);
        return true; // Retorna true se a inserção foi bem-sucedida
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed: os.numero')) {
            throw new Error('O número da OS já existe. Por favor, use um número único.');
        } else {
            throw error; // Lança outros erros
        }
    }
};

const getAllOS = async (db) => {
    const query = 'SELECT * FROM os';
    const result = await db.query(query);
    return result.values;
};

const updateOS = async (db, os) => {
    const updateQuery = `
    UPDATE os
    SET dataRegistro = ?, senhaFoto = ?
    WHERE numero = ?; -- Atualiza pelo número
    `;
    const values = [os.dataRegistro, os.senhaFoto, os.numero];
    return db.run(updateQuery, values);
};

const deleteOS = async (db, numero) => {
    const deleteQuery = 'DELETE FROM os WHERE numero = ?'; // Usa número como referência
    return db.run(deleteQuery, [numero]);
};

export { createDatabase, insertOS, getAllOS, updateOS, deleteOS };
