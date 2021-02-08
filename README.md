# Introduction
Vault.IN is A password manager, digital vault with group management based on WebCryptoAPI http://www.w3.org/TR/WebCryptoAPI/. Vault.IN remembers all your passwords for you to help keep account information safe.it allows you to share individual records with any other users.

Vault.IN is based on Zero-Knowledge Architecture.
1) Data is encrypted & decrypted locally on the user's device(not on the server.)
2) The server never stores your record in plaintext.
3) The keys to encrypt & decrypt the record are derived on user's device from the user's Master password.
4) Sharing of data uses Public Key Cryptography.

# How it works
details of how Vault.IN works.
initially, you need to register with a username and password and an RSA-OAEP key pair is generated. (for public-key cryptography.)

then your private key is wrapped with an AES-GCM-256 instead of generating a random AES-GCM key we're gonna let you provide the password which 
were then going to strengthen and harden and convert it into a CryptoKey.

now let's walk through the flow of how the AES-GCM key is generated. First of all, we're gonna get's your password as bytes now we need to import these into CryptoKey (according to https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey.) it's actually an opaque representation of your password and just random bytes that you entered so it can't really be used for a key or anything yet but we need to do these in order to derive an AES-GCM key. and your AES-GCM key is derived from your PasswordCryptoKey.

it takes salt and PasswordCryptoKey and then we're gonna run it through PBKDF2(Password base key derivation function 2.) with 250000 iterations and this operation which is a way of strengthening that password by repeatedly hashing it over and over again until it takes a long time meaning this way the key is hard to brute force so for this hashing we're gonna use SHA-256 now we have an AES-GCM key so we actually have something that we can actually wrap and unwrapped your private key.

When you create a secret, you specify a title and a secret data content.

The secret data content is encrypted using AES-GCM-256 with a randomly generated intermediate key.

Finally, this intermediate key is wrapped with your public key and concatenated with the iv used for encryption of that secret.

Any time you want to access a secret, you need to type your master password then from your PasswordCryptoKey an AES-GCM-256 key will be generated as discussed above, that will decrypt your private key then that will decrypt the intermediate key then finally decrypt the secret.

Using this method, it's easy to share a secret. You just need to know the exact username of your friend so you can find his public key to encrypt the intermediate key of the secret.

The secret field is only decrypted when you try to access the secret.

The "unshare" feature modifies the intermediate key of that secret data record, so it also needs to decrypt the secret to re-encrypt it with the new intermediate key.

## Project Setup
Make sure to follow all these steps exactly as explained below. Do not miss any steps or you won't be able to run this application.
#

### 1.) Install MYSQL.

 To run this project, you need to install the latest version of MYSQL Community Edition first. (Once installed make sure it running properly.)
   * https://dev.mysql.com/downloads/mysql/<br/>

### 2.) Clone the repository.
```bash
git clone https://github.com/mayurkoli128/Vault.IN.git
```

### 3.) Change directory.
```bash
cd Vault. IN
```

### 4.) Install Dependencies
```bash
npm install
```

### 5.) Setting Config.
if you look at config/default.js, change accordingly. & create a database from database/db.sql (Copy all these queries and execute.) **For a production scenario, you should store this key as an environment variable and not along with source code.**


### 6.) Start the Server.
```bash
npm start
```
This will launch the Node server on port 8080. If that port is busy, you can set a different port in the config/default file (Eg: PORT=5000)

Open up your browser and head over to:

* http://localhost:8080/
