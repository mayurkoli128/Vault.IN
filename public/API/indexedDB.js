export var connect = (dbDef) => {
    return new Promise((resolve, reject) => {
        // Opens a connection to the existing database or creates a new one    
        const req = indexedDB.open(dbDef.dbName, dbDef.dbVersion);
        var db = null;
        req.onupgradeneeded = (event) => {
            // Only fired once per db version, used to initiliaze the db
            db = event.target.result;   
            const keyStore = db.createObjectStore(dbDef.store.name, {keyPath: dbDef.store.key});

            // Use transaction oncomplete to make sure the objectStore creation is
            // finished before adding data into it.
            keyStore.transaction.oncomplete = (event)=> {
                resolve(db);
            }
        }
        req.onsuccess = (event) => {
            // Saves an instance of the connection to our custom object      
            db = event.target.result;   
            resolve(db);
        }
        req.onerror = (err) => {
            reject(err);
        }
    });
}
export var save = (db, store, document) => {
    return new Promise((resolve, reject) => {
        // get objectStore
        var transaction = db.transaction([store], "readwrite").objectStore(store);
        const req = transaction.add(document);
        req.onsuccess = (event) => {
            resolve(`[save] ${store}, key: ${document} inserted`);
        }
        req.onerror = (event) => {
            reject(event.target.error);
        }
    });
}
export var findOne = (db ,store, key) => {
    return new Promise((resolve, reject) => {
        // get objectStore
        var transaction = db.transaction([store]).objectStore(store);
        const req = transaction.get(key);
        req.onsuccess = (event) => {
            if (typeof event.target.result === 'undefined') {
                reject(`[readDB] ${store}, key: ${key} not found`);
            } else {
                resolve(event.target.result);
            }
        }
        req.onerror = (event) => {
            reject(event.target.error);
        }
    });
}
export var remove = (db ,store, key) => {
    return new Promise((resolve, reject) => {
        // get objectStore
        var transaction = db.transaction([store], "readwrite").objectStore(store);
        const req = transaction.delete(key);
        req.onsuccess = (event) => {
            resolve(`key deleted from ${store} `);
        }
        req.onerror = (event) => {
            reject(event.target.error);
        }
    });
}
