require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

const { google } = require('googleapis');
const path = require('path');

// Caminho para o arquivo JSON da chave da conta de serviço
const KEYFILEPATH = path.join(__dirname, '../data/frigorifico-caipirao-504d03fb5df3.json');

// --- CORREÇÃO 1: Lendo o ID do arquivo .env ---
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// Autenticação com a conta de serviço
const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Escopo para acesso a planilhas
});

async function readSheetData() {
    try {
        // Verifica se o SPREADSHEET_ID foi carregado
        if (!SPREADSHEET_ID) {
            throw new Error('A variável SPREADSHEET_ID não foi encontrada no arquivo .env');
        }

        const client = await auth.getClient(); // Obtém um cliente autenticado
        const googleSheets = google.sheets({ version: 'v4', auth: client });

        // --- CORREÇÃO 2: Usando o nome correto da aba ---
        const res = await googleSheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: '_Movimentacoes', // Corrigindo para o nome exato da guia
        });

        console.log('Dados da aba "Movimentacoes":');
        console.log(res.data.values); // Exibe os dados lidos no console

    } catch (error) {
        console.error('Erro ao ler a planilha:', error.message);
        if (error.response) {
            // Se o erro vier da API do Google, ele terá mais detalhes
            console.error('Detalhes do erro da API:', error.response.data.error);
        }
    }
}

readSheetData(); // Executa a função