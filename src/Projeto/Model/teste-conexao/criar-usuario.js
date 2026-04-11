const bcrypt = require('bcrypt');
const db = require('./db');

async function criarUsuarioTeste() {
  try {
    const usuario = 'admin';
    const senha = '123';
    
    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);
    
    const sql = `
      INSERT INTO usuario (usuario, senha, nivel_acesso, ativo)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      senha = VALUES(senha), ativo = VALUES(ativo)
    `;
    
    db.query(sql, [usuario, senhaHash, 1, 1], (err, result) => {
      if (err) {
        console.error('❌ Erro ao inserir usuário:', err);
        process.exit(1);
      }
      console.log('✅ Usuário criado/atualizado com sucesso!');
      console.log('📝 Usuário: admin');
      console.log('🔑 Senha: 123');
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Erro:', err);
    process.exit(1);
  }
}

criarUsuarioTeste();