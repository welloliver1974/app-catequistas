/**
 * Script de Sincronização — App Catequistas → Planilha Diocesana
 * =============================================================
 *
 * COMO USAR:
 * 1. Abra a planilha diocesana no Google Sheets
 * 2. Vá em Extensions → Apps Script
 * 3. Cole este código inteiro (substitua o conteúdo padrão)
 * 4. Clique em "Deploy" → "New deployment"
 * 5. Escolha:
 *    - "Select type": Web app
 *    - "Execute as": Me (you)
 *    - "Who has access": Anyone
 * 6. Clique em "Deploy" e copie a URL gerada
 * 7. No App Catequistas → Configurações → Sincronização Diocesana
 * 8. Cole a URL no campo "URL do Webhook" e salve
 *
 * SEGURANÇA:
 * - Um token interno valida que a requisição veio do app
 * - A URL do webhook já é ofuscada (hash do deployment)
 * - O script só escreve na planilha onde está instalado
 */

// ─── Token de segurança ───────────────────────────────────────────────────────
// Deve ser o mesmo token usado no servidor Next.js
const TOKEN = "catequistas-sync-2026";

// ─── Constantes da planilha ───────────────────────────────────────────────────
const HEADER_ROW = 3;      // Linha dos cabeçalhos (encontros)
const DATA_START_ROW = 4;  // Primeira linha de dados
const MAX_ENCONTROS = 15;  // Máximo de colunas de presença (B a O)
const NOME_COL = 1;        // Coluna A: nomes dos catequistas
const PRESENCA_START_COL = 2; // Coluna B: primeiro encontro

/**
 * Recebe o POST do App Catequistas e preenche a planilha.
 * Espera um JSON no corpo:
 * {
 *   token: string,
 *   encontros: [{ numero: number, data: string, tema: string }],
 *   catequistas: [{ nome: string, presencas: string[] }]
 * }
 */
function doPost(e) {
  try {
    // Parse do corpo da requisição
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ error: "Corpo da requisição vazio." }, 400);
    }

    const data = JSON.parse(e.postData.contents);

    // ─── Valida token ─────────────────────────────────────────────────────
    if (data.token !== TOKEN) {
      return jsonResponse({ error: "Token inválido." }, 403);
    }

    // ─── Valida dados mínimos ─────────────────────────────────────────────
    if (!Array.isArray(data.catequistas) || data.catequistas.length === 0) {
      return jsonResponse({ error: "Nenhum catequista para sincronizar." }, 400);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // ─── Limpa dados antigos (preserva linhas 1-3: título e cabeçalhos) ───
    const ultimaLinha = sheet.getLastRow();
    const ultimaColuna = Math.max(sheet.getLastColumn(), PRESENCA_START_COL + MAX_ENCONTROS - 1);
    if (ultimaLinha >= DATA_START_ROW) {
      sheet.getRange(DATA_START_ROW, 1, ultimaLinha - DATA_START_ROW + 1, ultimaColuna).clearContent();
    }

    // ─── Escreve datas nos cabeçalhos (linha 3, colunas B-O) ──────────────
    const encontros = data.encontros || [];
    for (let i = 0; i < encontros.length; i++) {
      // Usa o numero do encontro para determinar a coluna (B = col 2, C = col 3, etc.)
      const coluna = PRESENCA_START_COL + (encontros[i].numero - 1);
      const header = encontros[i].data
        ? `${encontros[i].numero}º encontro — ${encontros[i].data}`
        : `${encontros[i].numero}º encontro`;
      sheet.getRange(HEADER_ROW, coluna).setValue(header);
    }

    // ─── Escreve catequistas e presenças ──────────────────────────────────
    for (let i = 0; i < data.catequistas.length; i++) {
      const linha = DATA_START_ROW + i;
      const catequista = data.catequistas[i];

      // Nome do catequista (coluna A)
      sheet.getRange(linha, NOME_COL).setValue(catequista.nome);

      // Presenças: cada posição j corresponde ao encontro j (que tem seu numero)
      const presencas = catequista.presencas || [];
      for (let j = 0; j < presencas.length; j++) {
        if (presencas[j]) {
          const coluna = PRESENCA_START_COL + (encontros[j].numero - 1);
          sheet.getRange(linha, coluna).setValue(presencas[j]);
        }
      }
    }

    // ─── Formatação básica ─────────────────────────────────────────────────
    formatarPlanilha(sheet, data.catequistas.length, encontros.length);

    return jsonResponse({
      success: true,
      mensagem: `Planilha atualizada: ${data.catequistas.length} catequistas, ${encontros.length} encontros.`
    });
  } catch (err) {
    return jsonResponse({
      error: "Erro interno: " + err.message
    }, 500);
  }
}

/**
 * Aplica formatação básica na planilha para melhor legibilidade.
 */
function formatarPlanilha(sheet, totalCatequistas, totalEncontros) {
  // Negrito nos cabeçalhos
  const headerRange = sheet.getRange(HEADER_ROW, 1, 1, Math.min(totalEncontros + 1, MAX_ENCONTROS + 1));
  headerRange.setFontWeight("bold");

  // Auto-ajuste da largura das colunas
  sheet.autoResizeColumn(NOME_COL);
  for (let i = 0; i < Math.min(totalEncontros, MAX_ENCONTROS); i++) {
    sheet.autoResizeColumn(PRESENCA_START_COL + i);
  }
}

/**
 * Helper para retornar respostas JSON formatadas.
 */
function jsonResponse(data, code) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);

  if (code) {
    // Para códigos de erro, o ContentService não muda o status,
    // então incluímos no JSON e o app verifica o conteúdo
    data._httpCode = code;
  }

  return output;
}

/**
 * Função de teste — execute no editor do Apps Script para verificar
 * se o script está configurado corretamente.
 */
function testSync() {
  const testData = {
    token: TOKEN,
    encontros: [
      { numero: 1, data: "14/06/2026", tema: "Encontro 1" },
      { numero: 2, data: "21/06/2026", tema: "Encontro 2" }
    ],
    catequistas: [
      { nome: "Catequista Teste 1", presencas: ["P", "A"] },
      { nome: "Catequista Teste 2", presencas: ["P", "P"] }
    ]
  };

  // Simula uma requisição POST
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  const result = doPost(mockEvent);
  Logger.log("Resultado: " + result.getContent());
}
