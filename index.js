const express = require('express')
const cors = require('cors')
require('dotenv').config();
const pool = require('./db.js')
const PORT = 3000

const app = express()

app.use(cors())
app.use(express.json())



app.get('/clientes', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM clientes')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Falha ao conectar no banco', error: error.message })
  }
})


app.post('/clientes', async (req, res) => {
  const { nome, cpf, telefone } = req.body

  try {
    const consulta = 'INSERT INTO clientes (nome, cpf, telefone) VALUES ($1, $2, $3)'
    await pool.query(consulta, [nome, cpf, telefone])
    res.status(201).json({ message: 'Cliente cadastrado com sucesso' })
  } catch (error) {
    res.status(500).json({ message: 'Falha ao cadastrar cliente', error: error.message })
  }
})


app.put('/clientes/:id', async (req, res) => {
  const { id } = req.params
  const { nome, cpf, telefone } = req.body

  try {
    const consulta = 'UPDATE clientes SET nome = $1, cpf = $2, telefone = $3 WHERE id = $4'
    await pool.query(consulta, [nome, cpf, telefone, id])
    res.status(200).json({ message: 'Cliente atualizado com sucesso' })
  } catch (error) {
    res.status(500).json({ message: 'Falha ao atualizar cliente', error: error.message })
  }
})


app.delete('/clientes/:id', async (req, res) => {
  const { id } = req.params

  try {
    const consulta = 'DELETE FROM clientes WHERE id = $1'
    await pool.query(consulta, [id])
    res.status(200).json({ message: 'Cliente deletado com sucesso' })
  } catch (error) {
    res.status(500).json({ message: 'Falha ao deletar cliente', error: error.message })
  }
})


app.get('/produtos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM produtos')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Falha ao conectar no banco', error: error.message })
  }
})


app.post('/produtos', async (req, res) => {
  const { nome, preco, qtde_estoque } = req.body

  try {
    const consulta = 'INSERT INTO produtos (nome, preco, qtde_estoque) VALUES ($1, $2, $3)'
    await pool.query(consulta, [nome, preco, qtde_estoque])
    res.status(201).json({ message: 'Produto cadastrado com sucesso' })
  } catch (error) {
    res.status(500).json({ message: 'Falha ao cadastrar produto', error: error.message })
  }
})


app.put('/produtos/:id', async (req, res) => {
  const { id } = req.params
  const { nome, preco, qtde_estoque } = req.body

  try {
    const consulta = 'UPDATE produtos SET nome = $1, preco = $2, qtde_estoque = $3 WHERE id = $4'
    await pool.query(consulta, [nome, preco, qtde_estoque, id])
    res.status(200).json({ message: 'Produto atualizado com sucesso' })
  } catch (error) {
    res.status(500).json({ message: 'Falha ao atualizar produto', error: error.message })
  }
})

app.delete('/produtos/:id', async (req, res) => {
  const { id } = req.params

  try {
    const consulta = 'DELETE FROM produtos WHERE id = $1'
    await pool.query(consulta, [id])
    res.status(200).json({ message: 'Produto deletado com sucesso' })
  } catch (error) {
    res.status(500).json({ message: 'Falha ao deletar produto', error: error.message })
  }
})


app.get('/vendas', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT v.id, v.data_hora, c.nome AS nome_cliente, p.nome AS nome_produto
       FROM vendas v
       JOIN clientes c ON v.id_cliente = c.id
       JOIN produtos p ON v.id_produto = p.id`
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Falha ao conectar no banco', error: error.message })
  }
})


app.post('/vendas', async (req, res) => {
    const { data_hora, nome_cliente, nome_produto } = req.body
  
    try {
      // Buscar o ID do cliente baseado no nome
      const clienteResult = await pool.query('SELECT id FROM clientes WHERE nome = $1', [nome_cliente])
      if (clienteResult.rows.length === 0) {
        return res.status(404).json({ message: 'Cliente não encontrado' })
      }
      const id_cliente = clienteResult.rows[0].id
  
      // Buscar o ID do produto baseado no nome
      const produtoResult = await pool.query('SELECT id, qtde_estoque FROM produtos WHERE nome = $1', [nome_produto])
      if (produtoResult.rows.length === 0) {
        return res.status(404).json({ message: 'Produto não encontrado' })
      }
      const id_produto = produtoResult.rows[0].id
      const qtdeEstoque = produtoResult.rows[0].qtde_estoque
  
      // Verificar se há estoque suficiente para a venda
      if (qtdeEstoque <= 0) {
        return res.status(400).json({ message: 'Produto fora de estoque' })
      }
  
      // Registrar a venda
      const consultaVenda = 'INSERT INTO vendas (data_hora, id_cliente, id_produto) VALUES ($1, $2, $3)'
      await pool.query(consultaVenda, [data_hora, id_cliente, id_produto])
  
      // Atualizar o estoque do produto após a venda
      await pool.query('UPDATE produtos SET qtde_estoque = $1 WHERE id = $2', [qtdeEstoque - 1, id_produto])
  
      res.status(201).json({ message: 'Venda registrada com sucesso' })
    } catch (error) {
      res.status(500).json({ message: 'Falha ao registrar venda', error: error.message })
    }
  })
  

app.listen(PORT, () => {
  console.log('API está no AR')
})
