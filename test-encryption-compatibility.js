const { encryptSha256, decryptSha256, decryptToken } = require('./dist/utils/encryption.js');

// Test with the exact values from your PHP example
const testToken = "114|LuhhnXez3aq5tl9CGzdBH0NoNLA4HkMg9777vD5Nc5926620";
const testKey = "RGZWpPeVUiUekexEMITtDciZ0WIfvfedPmGZXC2Tk=";
const phpEncryptedExample = "xR46AQl6z6zZBaNQnvsufKw4yJc5qkPGUaeSfyKzVSNVVL1INAR6ornGcnx6FR/HzPb6Y7GmPBQrk5RaUkuXJWda4/Ly0rTicFt7mDG2m9c=";

console.log('Testing encryption/decryption compatibility...');
console.log('Original token:', testToken);
console.log('Key:', testKey);
console.log('');

// Test 1: Encrypt with our TypeScript function
console.log('1. Encrypting with TypeScript function:');
const encrypted = encryptSha256(testToken, testKey);
console.log('Encrypted:', encrypted);
console.log('');

// Test 2: Decrypt our encrypted token
console.log('2. Decrypting our encrypted token:');
const decrypted = decryptSha256(encrypted, testKey);
console.log('Decrypted:', decrypted);
console.log('Match original:', decrypted === testToken);
console.log('');

// Test 3: Try to decrypt the PHP encrypted example
console.log('3. Decrypting PHP encrypted example:');
try {
  const phpDecrypted = decryptSha256(phpEncryptedExample, testKey);
  console.log('PHP Decrypted:', phpDecrypted);
  console.log('Match original:', phpDecrypted === testToken);
} catch (error) {
  console.log('Failed to decrypt PHP example:', error.message);
}
console.log('');

// Test 4: Show that our encryption produces different results (due to random IV)
console.log('4. Multiple encryptions of same token (should be different):');
const encrypted1 = encryptSha256(testToken, testKey);
const encrypted2 = encryptSha256(testToken, testKey);
console.log('Encryption 1:', encrypted1);
console.log('Encryption 2:', encrypted2);
console.log('Are different:', encrypted1 !== encrypted2);
console.log('Both decrypt to original:', 
  decryptSha256(encrypted1, testKey) === testToken && 
  decryptSha256(encrypted2, testKey) === testToken
);
console.log('');

// Test 5: Test decryptToken function with Bearer prefix
console.log('5. Testing decryptToken function (should add Bearer prefix):');
const encryptedForDecryptToken = encryptSha256(testToken, testKey);
const decryptedWithBearer = decryptToken(encryptedForDecryptToken);
console.log('Encrypted token:', encryptedForDecryptToken);
console.log('Decrypted with Bearer:', decryptedWithBearer);
console.log('Has Bearer prefix:', decryptedWithBearer.startsWith('Bearer '));
console.log('Expected format:', `Bearer ${testToken}`);
console.log('Matches expected:', decryptedWithBearer === `Bearer ${testToken}`);
