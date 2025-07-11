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

// --- Configuração da Autenticação ---
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// Lógica para usar as credenciais do Render ou o ficheiro local
const creds = process.env.GOOGLE_CREDENTIALS ? 
              JSON.parse(process.env.GOOGLE_CREDENTIALS) : 
              require(path.join(__dirname, '../data/frigorifico-caipirao-504d03fb5df3.json'));

const auth = new google.auth.GoogleAuth({
    credentials: creds,
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

// Rota para ler dados da aba _Movimentacoes
app.get('/api/movimentacoes', async (req, res) => {
    try {
        const data = await getSheetData('_Movimentacoes'); // Usando o nome exato da sua aba
        res.json(data);
    } catch (error) {
        console.error('Erro ao ler a aba _Movimentacoes:', error.message);
        res.status(500).send('Erro no servidor ao ler a aba _Movimentacoes.');
    }
});

// Rota para adicionar dados na aba _Movimentacoes
app.post('/api/movimentacoes', async (req, res) => {
    try {
        // A ordem dos dados no array deve corresponder EXATAMENTE à ordem das colunas na sua planilha
        const newRow = [
            req.body.id_mov,      // Coluna A: ID Mov.
            req.body.data,        // Coluna B: Data
            req.body.tipo,        // Coluna C: Tipo (Entrada/Saída)
            req.body.categoria,   // Coluna D: Categoria
            req.body.descricao,   // Coluna E: Descrição
            req.body.valor,       // Coluna F: Valor
            req.body.responsavel, // Coluna G: Responsável
            req.body.observacoes  // Coluna H: Observações
        ];
        await appendSheetData('_Movimentacoes', newRow);
        res.status(201).json({ message: 'Movimentação adicionada com sucesso!' });
    } catch (error) {
        console.error('Erro ao adicionar movimentação:', error.message);
        res.status(500).send('Erro no servidor ao adicionar movimentação.');
    }
});

// Rota para ler dados da aba _Precos
app.get('/api/precos', async (req, res) => {
    try {
        const data = await getSheetData('_Precos'); // Usando o nome da sua aba
        res.json(data);
    } catch (error) {
        console.error('Erro ao ler a aba _Precos:', error.message);
        res.status(500).send('Erro no servidor ao ler a aba _Precos.');
    }
});

// Rota para adicionar/atualizar dados na aba _Precos
app.post('/api/precos', async (req, res) => {
    try {
        // A ordem aqui deve corresponder às suas colunas na planilha _Precos
        const newRow = [
            req.body.id_produto,   // Coluna A
            req.body.nome_produto, // Coluna B
            req.body.preco_venda   // Coluna C
        ];
        await appendSheetData('_Precos', newRow);
        res.status(201).json({ message: 'Preço adicionado/atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao adicionar preço:', error.message);
        res.status(500).send('Erro no servidor ao adicionar preço.');
    }
});

// Rota para apagar uma linha na aba _Movimentacoes
app.delete('/api/movimentacoes/:rowIndex', async (req, res) => {
    try {
        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: 'v4', auth: client });
        
        // O :rowIndex na URL virá como um parâmetro
        const rowIndex = parseInt(req.params.rowIndex, 10);

        // A API do Google Sheets precisa de um pedido mais complexo para apagar linhas
        await googleSheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            resource: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: 0, // 0 geralmente é o ID da primeira aba. Ajuste se necessário.
                                dimension: 'ROWS',
                                startIndex: rowIndex,
                                endIndex: rowIndex + 1
                            }
                        }
                    }
                ]
            }
        });

        res.json({ message: `Linha ${rowIndex} apagada com sucesso!` });

    } catch (error) {
        console.error('Erro ao apagar linha:', error.message);
        res.status(500).send('Erro no servidor ao apagar a linha.');
    }
});

// Rota para apagar uma linha na aba Clientes
app.delete('/api/clientes/:rowIndex', async (req, res) => {
    try {
        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: 'v4', auth: client });
        const rowIndex = parseInt(req.params.rowIndex, 10);

        await googleSheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            resource: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: 123456789, // SUBSTITUA PELO ID DA SUA ABA 'Clientes'
                            dimension: 'ROWS',
                            startIndex: rowIndex,
                            endIndex: rowIndex + 1
                        }
                    }
                }]
            }
        });
        res.json({ message: 'Cliente apagado com sucesso!' });
    } catch (error) {
        console.error('Erro ao apagar cliente:', error.message);
        res.status(500).send('Erro no servidor ao apagar cliente.');
    }
});

// Rota para apagar uma linha na aba Produtos
app.delete('/api/produtos/:rowIndex', async (req, res) => {
    try {
        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: 'v4', auth: client });
        const rowIndex = parseInt(req.params.rowIndex, 10);

        await googleSheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            resource: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: 18808149, // SUBSTITUA PELO ID DA SUA ABA 'Produtos'
                            dimension: 'ROWS',
                            startIndex: rowIndex,
                            endIndex: rowIndex + 1
                        }
                    }
                }]
            }
        });
        res.json({ message: 'Produto apagado com sucesso!' });
    } catch (error) {
        console.error('Erro ao apagar produto:', error.message);
        res.status(500).send('Erro no servidor ao apagar produto.');
    }
});

// --- Inicia o Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
    console.log('Rotas disponíveis:');
    console.log(`  GET http://localhost:${PORT}/status`);
    console.log(`  GET http://localhost:${PORT}/api/clientes`);
    console.log(`  GET http://localhost:${PORT}/api/produtos`);
    console.log(`  GET http://localhost:${PORT}/api/movimentacoes`);
    console.log(`  GET http://localhost:${PORT}/api/precos`);
});