// IndexedDB Wrapper for Golang Codes
const DB_NAME = 'GolangCodesDB';
const DB_VERSION = 2;

class IDBStore {
    constructor() {
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains('pdfs')) {
                    db.createObjectStore('pdfs', { keyPath: 'hash' });
                }

                if (!db.objectStoreNames.contains('notes')) {
                    const store = db.createObjectStore('notes', { keyPath: ['pdf_hash', 'page'] });
                    store.createIndex('pdf_hash', 'pdf_hash', { unique: false });
                }

                if (!db.objectStoreNames.contains('highlights')) {
                    const store = db.createObjectStore('highlights', { autoIncrement: true });
                    store.createIndex('pdf_hash', 'pdf_hash', { unique: false });
                    store.createIndex('page', 'page', { unique: false });
                }

                if (!db.objectStoreNames.contains('bookmarks')) {
                    const store = db.createObjectStore('bookmarks', { autoIncrement: true });
                    store.createIndex('pdf_hash', 'pdf_hash', { unique: false });
                }

                if (!db.objectStoreNames.contains('snippets')) {
                    const store = db.createObjectStore('snippets', { autoIncrement: true });
                    store.createIndex('pdf_hash', 'pdf_hash', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (err) => reject(err);
        });
    }

    async put(storeName, data) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.put(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async get(storeName, key) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, key) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async deleteBookmark(pdf_hash, page) {
        const bookmarks = await this.getAllByIndex('bookmarks', 'pdf_hash', pdf_hash);
        const b = bookmarks.find(x => x.page === page);
        if (b) {
            const tx = this.db.transaction('bookmarks', 'readwrite');
            const store = tx.objectStore('bookmarks');
            store.delete(b.id);
        }
    }
}

window.ReaderDB = new IDBStore();
