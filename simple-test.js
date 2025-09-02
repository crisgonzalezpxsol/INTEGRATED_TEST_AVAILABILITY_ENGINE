console.log('Testing encryption/decryption...');

try {
  const { encryptSha256, decryptSha256, decryptToken } = require('./dist/utils/encryption.js');
  
  const testToken = "114|LuhhnXez3aq5tl9CGzdBH0NoNLA4HkMg9777vD5Nc5926620";
  const testKey = "RGZWpPeVUiUekexEMITtDciZ0WIfvfedPmGZXC2Tk=";
  
  console.log('Original token:', testToken);
  
  // Test encryption
  const encrypted = encryptSha256(testToken, testKey);
  console.log('Encrypted:', encrypted);
  
  // Test decryption
  const decrypted = decryptSha256(encrypted, testKey);
  console.log('Decrypted:', decrypted);
  console.log('Match original:', decrypted === testToken);
  
  // Test decryptToken function (should add Bearer prefix)
  const decryptedWithBearer = decryptToken(encrypted);
  console.log('Decrypted with Bearer:', decryptedWithBearer);
  console.log('Has Bearer prefix:', decryptedWithBearer.startsWith('Bearer '));
  
} catch (error) {
  console.error('Error:', error.message);
}
