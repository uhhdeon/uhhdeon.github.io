document.addEventListener('DOMContentLoaded', () => {
    // Seleciona os elementos da página
    const inputTextArea = document.getElementById('input-texto');
    const outputTextArea = document.getElementById('output-texto');
    const formatarButton = document.getElementById('formatar-btn');

    // Função que aplica a formatação
    function formatarTexto() {
        // Pega o valor atual do texto de entrada
        let textoOriginal = inputTextArea.value;
        let textoFormatado = textoOriginal;

        // --- Tabela de Regras de Substituição ---
        // Usamos Expressões Regulares (RegEx) com o flag 'g' para substituir TODAS as ocorrências.
        // O padrão '$&' insere a correspondência original de volta no lugar.

        // Regra 1: Frase específica "Coed Mawr"
        // Esta é uma regra de "envelopar", então ela permanece como estava.
        textoFormatado = textoFormatado.replace(/Coed Mawr/g, "{@}Coed Mawr{@}");
        
        // Regra 2: Pontuações - ADICIONAR na frente

        // Ponto final -> mantém o caractere e adiciona ||| (exceto se for o último caractere do texto)
        // A expressão regular \.(?!$) encontra um ponto que NÃO é seguido pelo final da string.
        textoFormatado = textoFormatado.replace(/\.(?!$)/g, '$&|||');
        
        // Interrogação -> mantém o caractere e adiciona ||| (a nova regra não se aplica aqui, mas poderia se você quisesse)
        textoFormatado = textoFormatado.replace(/\?/g, '$&|||');
        
        // Vírgula e exclamação -> mantém o caractere e adiciona ||
        textoFormatado = textoFormatado.replace(/,/g, '$&||');
        textoFormatado = textoFormatado.replace(/!/g, '$&||');
        
        // Ponto e vírgula -> mantém o caractere e adiciona ||||
        textoFormatado = textoFormatado.replace(/;/g, '$&||||');
        
        // Aspas duplas, parênteses e aspas simples -> mantém o caractere e adiciona |
        textoFormatado = textoFormatado.replace(/"/g, '$&|');
        textoFormatado = textoFormatado.replace(/\(/g, '$&|');
        textoFormatado = textoFormatado.replace(/\)/g, '$&|');
        textoFormatado = textoFormatado.replace(/'/g, '$&|');
        
        // Exibe o texto final na caixa de saída
        outputTextArea.value = textoFormatado;
    }

    // Adiciona o "ouvinte de evento" ao botão. Quando clicado, ele chama a função formatarTexto.
    formatarButton.addEventListener('click', formatarTexto);
});