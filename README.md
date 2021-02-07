# Introduction
Vault.IN is A password manager, digital vault with groups management based on WebCryptoAPI http://www.w3.org/TR/WebCryptoAPI/. Vault.IN remembers all your passwords for you to help keep account information safe.it allows you to share individual records with any other users.

Vault.IN is based on Zero-Knowledge Architecture.
1) Data is encrypted & decrypted locally on users device(not on the server.)
2) The server never store your record in plaintext.
3) The key's to encrypt & decrypt the record are derived on users device from users Master password.

# How it works
details of how Vault.IN works.
initially the user needs to register with username & password.an RSA key pair is generated 


## Project Setup
Make sure to follow all these steps exactly as explained below. Do not miss any steps or you won't be able to run this application.
#

### 1.) Install MongoDB.

 To run this project, you need to install the latest version of MongoDB Community Edition first.(Once install make sure it running properly.)
   * https://docs.mongodb.com/manual/installation/<br/>

### 2.) Clone the repository.
```bash
git clone https://github.com/mayurkoli128/Tiny.URL.git
```

### 3.) Change directory.
```bash
cd Tiny.URL
```

### 4.) Install Dependencies
```bash
npm install
```

### 5.) Start the Server.
```bash
npm start
```
This will launch the Node server on port 8080. If that port is busy, you can set a different port in config/default file (Eg: PORT=5000)

Open up your browser and head over to:

* http://localhost:8080/
