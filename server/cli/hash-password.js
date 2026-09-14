#!/usr/bin/env node
/* Gera o hash bcrypt para colocar em ADMIN_PASSWORD_HASH.
   Uso: npm run admin:hash -- "sua-senha-forte" */
import bcrypt from 'bcryptjs'

const senha = process.argv[2]
if (!senha) {
  console.error('Uso: npm run admin:hash -- "sua-senha-forte"')
  process.exit(1)
}
if (senha.length < 10) {
  console.error('Use uma senha com pelo menos 10 caracteres.')
  process.exit(1)
}

console.log('\nCopie a linha abaixo para o seu .env:\n')
console.log(`ADMIN_PASSWORD_HASH='${bcrypt.hashSync(senha, 12)}'\n`)
