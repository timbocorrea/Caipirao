require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

const { google } = require('googleapis');

const path = require('path');


// Caminho para o arquivo JSON da chave da conta de serviço

const KEYFILEPATH = path.join(__dirname, '../data/frigorifico-caipirao-504d03fb5df3.json');   // ATENÇÃO: SUBSTITUA 'sua-chave-aqui.json' PELO NOME REAL DO SEU ARQUIVO JSON

const SPREADSHEET_ID = '1A17ch-1r4lenll2w6Q8QVTOD7iJS3e1Sa-H_QQvjxfgUI';   // ATENÇÃO: SUBSTITUA PELO ID DA SUA PLANILHA


// Autenticação com a conta de serviço

const auth = new google.auth.GoogleAuth({

    keyFile: KEYFILEPATH,

    scopes: ['https://www.googleapis.com/auth/spreadsheets'],   // Escopo para acesso a planilhas

});


async function readSheetData() {

    try {

        const client = await auth.getClient();   // Obtém um cliente autenticado

        const googleSheets = google.sheets({ version: 'v4', auth: client });


        // Leitura da aba _Clientes

        const res = await googleSheets.spreadsheets.values.get({

            spreadsheetId: SPREADSHEET_ID,

            range: '_Clientes!A:D',   // Intervalo da aba _Clientes (ajuste se suas colunas forem diferentes)

        });


        console.log('Dados da aba _Clientes:');

        console.log(res.data.values);   // Exibe os dados lidos no console


    } catch (error) {

        console.error('Erro ao ler a planilha:', error.message);

        if (error.code === 403) {

            console.error('Verifique as permissões da Conta de Serviço na planilha.');

        }

    }

}

readSheetData(); // Executa a função