document.addEventListener('DOMContentLoaded', function() {
    
    // --- NOVA LÓGICA DE PREENCHIMENTO AUTOMÁTICO ---
    function preencherDados() {
        const params = new URLSearchParams(window.location.search);

        const dados = {
            aluno: params.get('aluno'),
            serie: params.get('serie'),
            data: params.get('data'),
            descricao: params.get('descricao'),
            aplicante: params.get('aplicante'),
            cargo: params.get('cargo')
        };

        if (dados.aluno) document.getElementById('aluno-nome').textContent = dados.aluno;
        if (dados.serie) document.getElementById('aluno-serie').textContent = dados.serie;
        if (dados.data) document.getElementById('comunicado-data').textContent = dados.data;
        if (dados.descricao) document.getElementById('comunicado-descricao').textContent = dados.descricao;
        if (dados.aplicante) document.getElementById('aplicante-nome').textContent = dados.aplicante;
        if (dados.cargo) document.getElementById('aplicante-cargo').textContent = dados.cargo;
    }

    // Chama a função para preencher os dados assim que a página carregar
    preencherDados();


    // --- LÓGICA DE IMPRESSÃO ORIGINAL ---
    const printBtn = document.getElementById('print-btn');
    printBtn.addEventListener('click', function() {
        window.print();
    });
});