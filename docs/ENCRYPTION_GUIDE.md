# Guía de Encriptación de Tokens

## Descripción General

Este sistema implementa encriptación/desencriptación de tokens de autenticación usando AES-256-CBC, compatible con el sistema PHP existente. Los tokens se encriptan en el lado del cliente (PHP) y se desencriptan automáticamente en el servidor Node.js.

## Características

- **Algoritmo**: AES-256-CBC
- **Compatibilidad**: Totalmente compatible con las funciones PHP `encrypt_sha256()` y `decrypt_sha256()`
- **Prefijo Bearer**: Manejo automático del prefijo "Bearer" para compatibilidad con APIs
- **Fallback**: Si la desencriptación falla, usa el token tal como se recibió
- **Logging**: Registra el estado de la desencriptación para debugging

## Configuración

### Clave de Encriptación

La clave secreta está definida en `src/utils/encryption.ts`:

```typescript
const SECRET_KEY = "RGZWpPeVUiUekexEMITtDciZ0WIfvfedPmGZXC2Tk=";
```

**⚠️ IMPORTANTE**: Esta clave debe ser la misma en ambos sistemas (PHP y Node.js).

## Funciones Disponibles

### `encryptSha256(string, key?)`

Encripta una cadena usando AES-256-CBC.

**Parámetros:**
- `string`: La cadena a encriptar
- `key`: La clave de encriptación (opcional, usa SECRET_KEY por defecto)

**Retorna:** Cadena encriptada en formato base64

**Ejemplo:**
```typescript
const encrypted = encryptSha256("114|LuhhnXez3aq5tl9CGzdBH0NoNLA4HkMg9777vD5Nc5926620");
```

### `decryptSha256(encryptedString, key?)`

Desencripta una cadena usando AES-256-CBC.

**Parámetros:**
- `encryptedString`: La cadena encriptada en base64
- `key`: La clave de desencriptación (opcional, usa SECRET_KEY por defecto)

**Retorna:** Cadena desencriptada

**Ejemplo:**
```typescript
const decrypted = decryptSha256("B8/SO47dxUqB++GgdV6k5M3qwmj8mlcGw/ruCDIIStPqy5hVGbA+vHbHdYn8+HA7ocpN+pLOIZotpYdzJoO0kpz8gddo6xAPI8AUMfJjl9o=");
```

### `decryptToken(token)`

Función principal para desencriptar tokens de requests. Maneja automáticamente:
- Desencriptación de tokens encriptados
- Adición del prefijo "Bearer" si no está presente
- Fallback a token original si la desencriptación falla

**Parámetros:**
- `token`: El token (puede estar encriptado o en texto plano)

**Retorna:** Token desencriptado con prefijo "Bearer" o token original si falla

**Ejemplo:**
```typescript
const token = decryptToken(encryptedTokenFromRequest);
// Resultado: "Bearer 114|LuhhnXez3aq5tl9CGzdBH0NoNLA4HkMg9777vD5Nc5926620"
```

### `isEncryptedToken(token)`

Valida si una cadena es un token encriptado válido.

**Parámetros:**
- `token`: La cadena a validar

**Retorna:** `true` si es un token encriptado válido, `false` en caso contrario

## Integración en el Servidor

El sistema está integrado automáticamente en `src/server.ts`:

```typescript
// El token se desencripta automáticamente antes de usarse
const rawToken = typeof token === 'string' ? token : undefined;
const tokenStr = rawToken ? decryptToken(rawToken) : undefined;
```

### Logging

El sistema registra el estado de la desencriptación:

- **Token desencriptado exitosamente**: Se registra la longitud del token original y desencriptado
- **Token usado tal como se recibió**: Se registra cuando la desencriptación falla o el token no está encriptado

## Compatibilidad con PHP

### Función PHP Equivalente

```php
function encrypt_sha256($string, $key) {
    $algorithm = "aes-256-cbc";
    $ivLength = openssl_cipher_iv_length($algorithm);
    $iv = openssl_random_pseudo_bytes($ivLength);
    $key = openssl_digest($key, "sha256", true);
    $encryptedString = openssl_encrypt($string, $algorithm, $key, OPENSSL_RAW_DATA, $iv);
    $combinedData = $iv . $encryptedString;
    $encodedString = base64_encode($combinedData);
    return $encodedString;
}
```

### Ejemplo de Uso en PHP

```php
$key_secret = "RGZWpPeVUiUekexEMITtDciZ0WIfvfedPmGZXC2Tk=";
$token = "114|LuhhnXez3aq5tl9CGzdBH0NoNLA4HkMg9777vD5Nc5926620";
$encrypted = encrypt_sha256($token, $key_secret);
```

## Testing

### Ejecutar Tests

```bash
npm test -- src/tests/encryption.test.ts
```

### Tests Incluidos

1. **Encriptación y desencriptación básica**
2. **Manejo de claves por defecto**
3. **Función `decryptToken` con tokens encriptados**
4. **Función `decryptToken` con tokens en texto plano**
5. **Identificación de tokens encriptados**
6. **Manejo de tokens vacíos**
7. **Manejo de datos encriptados inválidos**
8. **Verificación de IV aleatorio**
9. **Manejo correcto del prefijo Bearer**

### Script de Prueba Manual

```bash
node simple-test.js
```

## Ejemplo de Flujo Completo

### 1. Encriptación en PHP
```php
$token = "114|LuhhnXez3aq5tl9CGzdBH0NoNLA4HkMg9777vD5Nc5926620";
$encrypted = encrypt_sha256($token, $key_secret);
// Resultado: "B8/SO47dxUqB++GgdV6k5M3qwmj8mlcGw/ruCDIIStPqy5hVGbA+vHbHdYn8+HA7ocpN+pLOIZotpYdzJoO0kpz8gddo6xAPI8AUMfJjl9o="
```

### 2. Envío en Request
```bash
curl --location 'http://localhost:3000/api/flow?token=B8/SO47dxUqB++GgdV6k5M3qwmj8mlcGw/ruCDIIStPqy5hVGbA+vHbHdYn8+HA7ocpN+pLOIZotpYdzJoO0kpz8gddo6xAPI8AUMfJjl9o='
```

### 3. Desencriptación Automática en Node.js
```typescript
// El servidor automáticamente desencripta el token
const decryptedToken = decryptToken(encryptedTokenFromRequest);
// Resultado: "Bearer 114|LuhhnXez3aq5tl9CGzdBH0NoNLA4HkMg9777vD5Nc5926620"
```

## Seguridad

- **Clave Secreta**: Mantener la clave secreta segura y no exponerla en logs
- **IV Aleatorio**: Cada encriptación usa un IV aleatorio para mayor seguridad
- **Fallback Seguro**: Si la desencriptación falla, el sistema usa el token original
- **Logging**: Los logs no exponen el contenido de los tokens

## Troubleshooting

### Error: "Decryption failed"
- Verificar que la clave secreta sea la misma en PHP y Node.js
- Verificar que el token esté en formato base64 válido
- Verificar que el token no esté corrupto durante la transmisión

### Token no se desencripta
- El sistema automáticamente usa el token tal como se recibió
- Verificar los logs para ver el estado de la desencriptación

### Prefijo Bearer duplicado
- La función `decryptToken` maneja automáticamente el prefijo Bearer
- No duplica el prefijo si ya está presente
