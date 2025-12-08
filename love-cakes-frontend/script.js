// =====================================================
// SISTEMA DE CARRINHO (localStorage)
// =====================================================

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

function addToCart(nome, preco) {
    carrinho.push({ nome, preco, quantidade: 1 });
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    alert(`${nome} foi adicionado ao carrinho!`);
}

// =====================================================
// Atualizar carrinho na página carrinho.html
// =====================================================

function atualizarCarrinho() {
    const lista = document.getElementById("lista-carrinho");
    const totalValor = document.getElementById("total-valor");

    // Se não está na página carrinho.html, ignore
    if (!lista || !totalValor) return;

    lista.innerHTML = "";
    let total = 0;

    carrinho.forEach((item, index) => {
        total += item.preco * item.quantidade;

        const li = document.createElement("li");
        li.innerHTML = `
            ${item.nome} — R$ ${item.preco.toFixed(2)} 
            <button onclick="removerItem(${index})">❌</button>
        `;
        lista.appendChild(li);
    });

    totalValor.textContent = total.toFixed(2);
}

function removerItem(i) {
    carrinho.splice(i, 1);
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    atualizarCarrinho();
}

window.onload = atualizarCarrinho;

// Validação do campo telefone — permite só números e limita a 11 dígitos (DDD + número)
function validarTelefone(input) {
    input.value = input.value.replace(/\D/g, "").slice(0, 11);
}


// =====================================================
// ENVIAR PEDIDO PARA O BACKEND (Node + MySQL)
// =====================================================

function finalizarPedido() {
    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();

    if (!nome || !telefone) {
        alert("Preencha nome e telefone antes de finalizar.");
        return;
    }

    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio.");
        return;
    }

    const itens = carrinho.map(item => ({
        nome: item.nome,
        preco: item.preco,
        quantidade: item.quantidade || 1
    }));

    fetch("http://localhost:3000/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, telefone, itens })
    })
    .then(res => res.json())
    .then(data => {
        alert("Pedido registrado com sucesso! Número: " + data.pedidoId);

        // limpar carrinho após finalizar
        carrinho = [];
        localStorage.removeItem("carrinho");

        atualizarCarrinho();
    })
    .catch(err => {
        console.log(err);
        alert("Erro ao enviar pedido.");
    });
}
