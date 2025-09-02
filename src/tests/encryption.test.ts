import { encryptSha256, decryptSha256, decryptToken, isEncryptedToken } from '../utils/encryption';

describe('Encryption/Decryption Tests', () => {
  const testToken = "114|LuhhnXez3aq5tl9CGzdBH0NoNLA4HkMg9777vD5Nc5926620";
  const testKey = "RGZWpPeVUiUekexEMITtDciZ0WIfvfedPmGZXC2Tk=";

  test('should encrypt and decrypt a token correctly', () => {
    // Encrypt the token
    const encrypted = encryptSha256(testToken, testKey);
    
    // Verify encryption produces a different string
    expect(encrypted).not.toBe(testToken);
    expect(encrypted.length).toBeGreaterThan(testToken.length);
    
    // Decrypt the token
    const decrypted = decryptSha256(encrypted, testKey);
    
    // Verify decryption produces the original token
    expect(decrypted).toBe(testToken);
  });

  test('should handle decryption with default key', () => {
    // Encrypt with default key
    const encrypted = encryptSha256(testToken);
    
    // Decrypt with default key
    const decrypted = decryptSha256(encrypted);
    
    // Verify decryption produces the original token
    expect(decrypted).toBe(testToken);
  });

  test('should handle decryptToken function with encrypted token', () => {
    // Encrypt the token
    const encrypted = encryptSha256(testToken, testKey);
    
    // Use decryptToken function
    const decrypted = decryptToken(encrypted);
    
    // Verify decryption produces the original token with Bearer prefix
    expect(decrypted).toBe(`Bearer ${testToken}`);
  });

  test('should handle decryptToken function with plain token', () => {
    // Use decryptToken function with plain token
    const result = decryptToken(testToken);
    
    // Should return the original token since decryption will fail
    expect(result).toBe(testToken);
  });

  test('should correctly identify encrypted tokens', () => {
    // Encrypt the token
    const encrypted = encryptSha256(testToken, testKey);
    
    // Should identify as encrypted
    expect(isEncryptedToken(encrypted)).toBe(true);
    
    // Should not identify plain token as encrypted
    expect(isEncryptedToken(testToken)).toBe(false);
  });

  test('should handle empty or null tokens', () => {
    expect(decryptToken('')).toBe('');
    expect(isEncryptedToken('')).toBe(false);
  });

  test('should throw error for invalid encrypted data', () => {
    expect(() => {
      decryptSha256('invalid-base64-data');
    }).toThrow('Decryption failed');
  });

  test('should produce different encrypted strings for same input (due to random IV)', () => {
    const encrypted1 = encryptSha256(testToken, testKey);
    const encrypted2 = encryptSha256(testToken, testKey);
    
    // Should be different due to random IV
    expect(encrypted1).not.toBe(encrypted2);
    
    // But both should decrypt to the same original token
    expect(decryptSha256(encrypted1, testKey)).toBe(testToken);
    expect(decryptSha256(encrypted2, testKey)).toBe(testToken);
  });

  test('should handle Bearer prefix correctly in decryptToken', () => {
    // Test with token that already has Bearer prefix
    const tokenWithBearer = `Bearer ${testToken}`;
    const encryptedWithBearer = encryptSha256(tokenWithBearer, testKey);
    const decryptedWithBearer = decryptToken(encryptedWithBearer);
    
    // Should return the token with Bearer prefix (not duplicate it)
    expect(decryptedWithBearer).toBe(tokenWithBearer);
    
    // Test with token without Bearer prefix
    const encryptedWithoutBearer = encryptSha256(testToken, testKey);
    const decryptedWithoutBearer = decryptToken(encryptedWithoutBearer);
    
    // Should add Bearer prefix
    expect(decryptedWithoutBearer).toBe(`Bearer ${testToken}`);
  });
});
