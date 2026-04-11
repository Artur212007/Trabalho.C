require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./db');

const usuarios = [
  { usuario: 'admin',    senha: 'admin123' },
  { usuario: 'gerente',  senha: 'gerente123' },
  { usuario: 'vendedor', senha: 'vendedor123' },
  { usuario: 'tecnico',  senha: 'tecnico123' },
  { usuario: 'caixa',    senha: 'caixa123' },
];

const clientes = [
  { usuario: 'carlos',   senha: 'cliente123' },
  { usuario: 'fernanda', senha: 'cliente456' },
];

async function resetarSenhas() {
  console.log('🔄 Resetando senhas...\n');

  for (const u of usuarios) {
    const hash = await bcrypt.hash(u.senha, 10);
    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE usuario SET senha = ? WHERE usuario = ?',
        [hash, u.usuario],
        (err, result) => {
          if (err) {
            console.error(`❌ Erro em ${u.usuario}:`, err.message);
            reject(err);
          } else if (result.affectedRows === 0) {
            console.warn(`⚠️  Usuário "${u.usuario}" não encontrado na tabela usuario`);
            resolve();
          } else {
            console.log(`✅ usuario "${u.usuario}" → senha: ${u.senha}`);
            resolve();
          }
        }
      );
    });
  }

  for (const c of clientes) {
    const hash = await bcrypt.hash(c.senha, 10);
    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE cliente SET senha = ? WHERE usuario = ?',
        [hash, c.usuario],
        (err, result) => {
          if (err) {
            console.error(`❌ Erro em ${c.usuario}:`, err.message);
            reject(err);
          } else if (result.affectedRows === 0) {
            console.warn(`⚠️  Cliente "${c.usuario}" não encontrado na tabela cliente`);
            resolve();
          } else {
            console.log(`✅ cliente "${c.usuario}" → senha: ${c.senha}`);
            resolve();
          }
        }
      );
    });
  }

  console.log('\n🎉 Senhas resetadas! Agora pode logar normalmente.');
  process.exit(0);
}

resetarSenhas().catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});