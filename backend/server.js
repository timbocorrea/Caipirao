require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Importamos o cors
const { google } = require('googleapis');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares Essenciais ---
app.use(cors()); // Habilita o CORS para todas as rotas
app.use(express.json()); // Habilita o servidor a receber dados em formato JSON no corpo das requisições POST

// --- Configuração da Autenticação (igual a antes) ---
const KEYFILEPATH = path.join(__dirname, '../data/frigorifico-caipirao-504d03fb5df3.json');
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// --- Função Auxiliar para Ler Dados ---
// Transforma o array de arrays num array de objetos, o que é mais útil para o frontend
async function getSheetData(sheetName) {
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: 'v4', auth: client });

    const response = await googleSheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: sheetName,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
        return [];
    }

    const headers = rows[0]; // A primeira linha é o cabeçalho
    const data = rows.slice(1).map(row => {
        const rowData = {};
        headers.forEach((header, index) => {
            rowData[header] = row[index];
        });
        return rowData;
    });

    return data;
}

// --- Função Auxiliar para Escrever Dados ---
async function appendSheetData(sheetName, rowData) {
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: 'v4', auth: client });

    await googleSheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: sheetName,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [rowData], // Os dados a serem adicionados
        },
    });
}


// --- ROTAS DA API ---

// Rota de Status (para verificar se a API está no ar)
app.get('/status', (req, res) => {
    res.json({ status: 'ok', message: 'API está a funcionar' });
});

// Rota para ler dados da aba _Clientes
app.get('/api/clientes', async (req, res) => {
    try {
        const data = await getSheetData('Clientes'); // Usando o nome da sua aba
        res.json(data);
    } catch (error) {
        console.error('Erro ao ler a aba Clientes:', error.message);
        res.status(500).send('Erro no servidor ao ler a aba Clientes.');
    }
});

// Rota para adicionar dados na aba _Clientes
app.post('/api/clientes', async (req, res) => {
    try {
        // A ordem dos dados no array deve corresponder à ordem das colunas na sua planilha
        const newRow = [
            req.body.id, 
            req.body.nome, 
            req.body.contato, 
            req.body.endereco
        ];
        await appendSheetData('Clientes', newRow);
        res.status(201).json({ message: 'Cliente adicionado com sucesso!' });
    } catch (error) {
        console.error('Erro ao adicionar cliente:', error.message);
        res.status(500).send('Erro no servidor ao adicionar cliente.');
    }
});

// Rota para ler dados da aba _Produtos
app.get('/api/produtos', async (req, res) => {
    try {
        const data = await getSheetData('Produtos'); // Usando o nome da sua aba
        res.json(data);
    } catch (error) {
        console.error('Erro ao ler a aba Produtos:', error.message);
        res.status(500).send('Erro no servidor ao ler a aba Produtos.');
    }
});

// Rota para adicionar dados na aba _Produtos
app.post('/api/produtos', async (req, res) => {
    try {
        // A ordem dos dados no array deve corresponder à ordem das colunas
        const newRow = [
            req.body.id, 
            req.body.nome, 
            req.body.descricao, 
            req.body.preco
        ];
        await appendSheetData('Produtos', newRow);
        res.status(201).json({ message: 'Produto adicionado com sucesso!' });
    } catch (error) {
        console.error('Erro ao adicionar produto:', error.message);
        res.status(500).send('Erro no servidor ao adicionar produto.');
    }
});


// --- Inicia o Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
    console.log('Rotas disponíveis:');
    console.log(`  GET http://localhost:${PORT}/status`);
    console.log(`  GET http://localhost:${PORT}/api/clientes`);
    console.log(`  GET http://localhost:${PORT}/api/produtos`);
});