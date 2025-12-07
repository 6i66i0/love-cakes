const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "love_cakes_db"
});

db.connect(err => {
    if (err) {
        console.error("Erro ao conectar ao MySQL:", err);
        return;
    }
    console.log("MySQL conectado!");
});

// =============================
// ROTAS
// =============================

// Finalizar pedido
app.post("/pedido", (req, res) => {
    const { nome, telefone, itens } = req.body;

    if (!nome || !telefone || !itens || itens.length === 0) {
        return res.status(400).json({ erro: "Dados incompletos" });
    }

    // 1 — Criar cliente
    const insertCliente = "INSERT INTO clientes (nome, telefone) VALUES (?, ?)";
    db.query(insertCliente, [nome, telefone], (err, clienteResult) => {
        if (err) return res.status(500).json(err);

        const clienteId = clienteResult.insertId;

        // 2 — Calcular total
        const total = itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

        // 3 — Criar pedido
        const insertPedido = "INSERT INTO pedidos (cliente_id, total) VALUES (?, ?)";
        db.query(insertPedido, [clienteId, total], (err, pedidoResult) => {
            if (err) return res.status(500).json(err);

            const pedidoId = pedidoResult.insertId;

            // 4 — Inserir itens
            itens.forEach(item => {
                const insertItem = `
                    INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, subtotal)
                    SELECT ?, id, ?, ?
                    FROM produtos
                    WHERE nome = ?
                `;

                const subtotal = item.preco * item.quantidade;

                db.query(insertItem, [pedidoId, item.quantidade, subtotal, item.nome]);
            });

            return res.json({ mensagem: "Pedido registrado!", pedidoId });
        });
    });
});


// Iniciar servidor
app.get("/teste", (req, res) => {
    res.send("Servidor funcionando!");
});
app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});
