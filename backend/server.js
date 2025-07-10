require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Configuração da Autenticação (igual ao seu ficheiro readSheet.js) ---
const KEYFILEPATH = path.join(__dirname, '../data/frigorifico-caipirao-504d03fb5df3.json');
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
// --- Fim da Configuração da Autenticação ---


// --- Rota Principal da API ---
// Esta é a nossa primeira "rota" ou "endpoint".
// Quando alguém aceder a http://localhost:3000/movimentacoes, este código será executado.
app.get('/movimentacoes', async (req, res) => {
    try {
        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: 'v4', auth: client });

        const sheetData = await googleSheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: '_Movimentacoes', // Lendo a aba inteira
        });

        // Devolve os dados da planilha como uma resposta JSON
        res.json(sheetData.data.values);

    } catch (error) {
        console.error('Erro ao aceder à API:', error.message);
        res.status(500).send('Erro no servidor ao tentar ler a planilha.');
    }
});


// --- Inicia o Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
    console.log(`Aceda a http://localhost:${PORT}/movimentacoes para ver os dados.`);
});