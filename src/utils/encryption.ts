import * as crypto from 'crypto';

/**
 * Secret key for encryption/decryption
 * This should match the key used in PHP
 */
const SECRET_KEY = "RGZWpPeVUiUekexEMITtDciZ0WIfvfedPmGZXC2Tk=";

/**
 * Encrypts a string using AES-256-CBC encryption
 * This function is equivalent to the PHP encrypt_sha256 function
 * 
 * @param string - The string to encrypt
 * @param key - The encryption key (optional, defaults to SECRET_KEY)
 * @returns The encrypted string in base64 format
 */
export function encryptSha256(string: string, key: string = SECRET_KEY): string {
  try {
    // Set the encryption algorithm and mode
    const algorithm = 'aes-256-cbc';
    const ivLength = 16; // AES-256-CBC always uses 16 bytes for IV
    
    // Generate a random IV
    const iv = crypto.randomBytes(ivLength);
    
    // Generate the appropriate key using SHA256
    const keyBuffer = crypto.createHash('sha256').update(key).digest();
    
    // Create cipher with IV
    const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
    
    // Encrypt the string
    let encrypted = cipher.update(string, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Combine IV and encrypted data
    const combinedData = Buffer.concat([iv, encrypted]);
    
    // Encode the result in base64 for storage or transmission
    const encodedString = combinedData.toString('base64');
    
    return encodedString;
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypts a string using AES-256-CBC decryption
 * This function is equivalent to the PHP decrypt_sha256 function
 * 
 * @param encryptedString - The encrypted string in base64 format
 * @param key - The decryption key (optional, defaults to SECRET_KEY)
 * @returns The decrypted string
 */
export function decryptSha256(encryptedString: string, key: string = SECRET_KEY): string {
  try {
    // Set the encryption algorithm and mode
    const algorithm = 'aes-256-cbc';
    const ivLength = 16; // AES-256-CBC always uses 16 bytes for IV
    
    // Decode the base64 string
    const decodedData = Buffer.from(encryptedString, 'base64');
    
    // Extract the IV (first ivLength bytes)
    const iv = decodedData.subarray(0, ivLength);
    
    // Extract the encrypted data (remaining bytes)
    const encryptedData = decodedData.subarray(ivLength);
    
    // Generate the appropriate key using SHA256
    const keyBuffer = crypto.createHash('sha256').update(key).digest();
    
    // Create decipher with IV
    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedData, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypts a token from the request
 * Handles both encrypted and plain tokens
 * Ensures the result has the "Bearer" prefix for API compatibility
 * 
 * @param token - The token string (may be encrypted or plain)
 * @returns The decrypted token with Bearer prefix or original token if decryption fails
 */
export function decryptToken(token: string): string {
  if (!token) {
    return token;
  }
  
  try {
    // Try to decrypt the token
    const decrypted = decryptSha256(token);
    
    // If decryption succeeds, ensure it has the Bearer prefix
    if (decrypted && !decrypted.startsWith('Bearer ')) {
      return `Bearer ${decrypted}`;
    }
    
    return decrypted;
  } catch (error) {
    // If decryption fails, assume it's a plain token and return as-is
    console.warn('Token decryption failed, using token as-is:', error instanceof Error ? error.message : 'Unknown error');
    return token;
  }
}

/**
 * Validates if a string is a valid encrypted token
 * 
 * @param token - The token string to validate
 * @returns True if the token appears to be encrypted, false otherwise
 */
export function isEncryptedToken(token: string): boolean {
  if (!token) {
    return false;
  }
  
  try {
    // Try to decrypt the token
    decryptSha256(token);
    return true;
  } catch (error) {
    return false;
  }
}
