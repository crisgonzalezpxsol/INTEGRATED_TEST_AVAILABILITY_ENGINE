#!/usr/bin/env node

/**
 * Script para generar tokens encriptados para testing
 * 
 * Uso:
 * node scripts/generate-encrypted-token.js [token_original]
 * 
 * Ejemplo:
 * node scripts/generate-encrypted-token.js "114|LuhhnXez3aq5tl9CGzdBH0NoNLA4HkMg9777vD5Nc5926620"
 */

const { encryptSha256, decryptSha256, decryptToken } = require('../dist/utils/encryption.js');

function main() {
  // Token por defecto si no se proporciona uno
  const defaultToken = "114|LuhhnXez3aq5tl9CGzdBH0NoNLA4HkMg9777vD5Nc5926620";
  
  // Obtener token de argumentos de línea de comandos o usar el por defecto
  const originalToken = process.argv[2] || defaultToken;
  
  console.log('🔐 Generador de Tokens Encriptados');
  console.log('=====================================\n');
  
  console.log('Token original:', originalToken);
  console.log('');
  
  try {
    // Encriptar el token
    const encryptedToken = encryptSha256(originalToken);
    console.log('Token encriptado:', encryptedToken);
    console.log('');
    
    // Verificar que se puede desencriptar correctamente
    const decryptedToken = decryptSha256(encryptedToken);
    console.log('Token desencriptado:', decryptedToken);
    console.log('Verificación exitosa:', decryptedToken === originalToken ? '✅' : '❌');
    console.log('');
    
    // Probar la función decryptToken (debería agregar Bearer)
    const tokenWithBearer = decryptToken(encryptedToken);
    console.log('Token con Bearer:', tokenWithBearer);
    console.log('Tiene prefijo Bearer:', tokenWithBearer.startsWith('Bearer ') ? '✅' : '❌');
    console.log('');
    
    // Generar comando curl de ejemplo
    console.log('📋 Comando curl de ejemplo:');
    console.log('===========================');
    console.log(`curl --location 'http://localhost:3000/api/flow?env=production&latitude=-32.888355&longitude=-68.838844&distance_radius=5000&start=2025-09-27&end=2025-09-28&concurrency=10&max_pages_to_scan=5&pos=ROOMFARES&token=${encryptedToken}'`);
    console.log('');
    
    // Generar JSON de ejemplo para POST
    console.log('📋 JSON de ejemplo para POST:');
    console.log('=============================');
    const exampleJson = {
      env: "production",
      latitude: -32.888355,
      longitude: -68.838844,
      distance_radius: 5000,
      start: "2025-09-27",
      end: "2025-09-28",
      concurrency: 10,
      max_pages_to_scan: 5,
      pos: "ROOMFARES",
      token: encryptedToken
    };
    console.log(JSON.stringify(exampleJson, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main };
