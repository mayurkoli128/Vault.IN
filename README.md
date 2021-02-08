# Introduction
Vault.IN is A password manager, digital vault with groups management based on WebCryptoAPI http://www.w3.org/TR/WebCryptoAPI/. Vault.IN remembers all your passwords for you to help keep account information safe.it allows you to share individual records with any other users.

Vault.IN is based on Zero-Knowledge Architecture.
1) Data is encrypted & decrypted locally on users device(not on the server.)
2) The server never store your record in plaintext.
3) The key's to encrypt & decrypt the record are derived on users device from users Master password.
4) Sharing of data uses Public Key Cryptography.

# How it works
details of how Vault.IN works.
initially you needs to register with username and password and an RSA-OAEP key pair is generated. (for public key cryptography.)

then your private key is wrapped with an AES-GCM-256 instead of generating an random AES-GCM key we're gonna let you provide the password which 
were then going to strengthen and harden and convert it into a CryptoKey.

now let's walk through the flow how AES-GCM key is generated.First of all, we're gonna get's your password as bytes now we need to import these into CryptoKey (according to https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey.) it's actually an opaque representation of your password and just a random bytes that you entered so it can't really be use for a key or anything yet but we need to do these in order to derived an AES-GCM key.and your AES-GCM key is derived from your PasswordCryptoKey. 

it takes 32 bytes of salt and PasswordCryptoKey and then we're gonna run it though PBKDF2(Password base key derivation function 2.) with 250000 iterations and this operation which is a way of strengthening that password by repeatedly hashing it over and over again until it takes long time meaning this way the key is hard to bruteforce so for this hashing we're gonna use SHA-256 now we have an AES-GCM key so we actually have something that we can actually wrapped and unpwrapped your private key.

When you create a secret, you specify a title and a secret data content.

The secret is encrypted using AES-GCM-256 with randomly generated intermediate key.

Any time you want to access a secret, you need to type your master password then from your PasswordCryptoKey an AES-GCM-256 key will be generated as discussed above, that will decrypt your private key, that will decrypt the intermediate key that will finally decrypt the secret.

Using this method, it's easy to share a secret. You need to know the exact username of your friend so you can find his public key to encrypt the intermediate key of the secret.

The secret field is only decrypted when you try to access the secret.

The "unshare" feature modifies the intermediate key, so it also needs to decrypt the secret to reencrypt it with the new intermediate key.
