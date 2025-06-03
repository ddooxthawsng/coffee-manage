import { openDB } from 'idb';

class OfflineManager {
    constructor() {
        this.dbName = 'CafeManagementDB';
        this.version = 1;
        this.db = null;
        this.isOnline = navigator.onLine;
        this.pendingOperations = [];

        this.initDB();
        this.setupEventListeners();
    }

    async initDB() {
        try {
            this.db = await openDB(this.dbName, this.version, {
                upgrade(db) {
                    // Store for drinks
                    if (!db.objectStoreNames.contains('drinks')) {
                        const drinksStore = db.createObjectStore('drinks', { keyPath: 'id' });
                        drinksStore.createIndex('name', 'name');
                    }

                    // Store for sales (offline orders)
                    if (!db.objectStoreNames.contains('offlineSales')) {
                        const salesStore = db.createObjectStore('offlineSales', {
                            keyPath: 'id',
                            autoIncrement: true
                        });
                        salesStore.createIndex('timestamp', 'timestamp');
                    }

                    // Store for customers
                    if (!db.objectStoreNames.contains('customers')) {
                        const customersStore = db.createObjectStore('customers', { keyPath: 'id' });
                        customersStore.createIndex('phone', 'phone');
                    }

                    // Store for pending operations
                    if (!db.objectStoreNames.contains('pendingOps')) {
                        db.createObjectStore('pendingOps', {
                            keyPath: 'id',
                            autoIncrement: true
                        });
                    }
                }
            });
        } catch (error) {
            console.error('Failed to initialize IndexedDB:', error);
        }
    }

    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncPendingOperations();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // Cache drinks data for offline use
    async cacheDrinks(drinks) {
        if (!this.db) return;

        const tx = this.db.transaction('drinks', 'readwrite');
        const store = tx.objectStore('drinks');

        for (const drink of drinks) {
            await store.put(drink);
        }

        await tx.done;
    }

    // Get drinks from cache when offline
    async getCachedDrinks() {
        if (!this.db) return [];

        const tx = this.db.transaction('drinks', 'readonly');
        const store = tx.objectStore('drinks');
        return await store.getAll();
    }

    // Save sale offline
    async saveOfflineSale(saleData) {
        if (!this.db) return null;

        const offlineSale = {
            ...saleData,
            timestamp: new Date(),
            synced: false,
            offlineId: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        const tx = this.db.transaction('offlineSales', 'readwrite');
        const store = tx.objectStore('offlineSales');
        const result = await store.add(offlineSale);

        await tx.done;
        return result;
    }

    // Get offline sales
    async getOfflineSales() {
        if (!this.db) return [];

        const tx = this.db.transaction('offlineSales', 'readonly');
        const store = tx.objectStore('offlineSales');
        return await store.getAll();
    }

    // Add pending operation
    async addPendingOperation(operation) {
        if (!this.db) return;

        const tx = this.db.transaction('pendingOps', 'readwrite');
        const store = tx.objectStore('pendingOps');
        await store.add({
            ...operation,
            timestamp: new Date(),
            retryCount: 0
        });

        await tx.done;
    }

    // Sync pending operations when back online
    async syncPendingOperations() {
        if (!this.db || !this.isOnline) return;

        const tx = this.db.transaction('pendingOps', 'readwrite');
        const store = tx.objectStore('pendingOps');
        const operations = await store.getAll();

        for (const op of operations) {
            try {
                await this.executePendingOperation(op);
                await store.delete(op.id);
            } catch (error) {
                console.error('Failed to sync operation:', error);
                // Increment retry count
                op.retryCount = (op.retryCount || 0) + 1;
                if (op.retryCount < 3) {
                    await store.put(op);
                } else {
                    // Remove after 3 failed attempts
                    await store.delete(op.id);
                }
            }
        }

        await tx.done;
    }

    async executePendingOperation(operation) {
        // Implement based on operation type
        switch (operation.type) {
            case 'sale':
                // Sync sale to Firebase
                await this.syncSaleToFirebase(operation.data);
                break;
            case 'customer':
                // Sync customer to Firebase
                await this.syncCustomerToFirebase(operation.data);
                break;
            default:
                console.warn('Unknown operation type:', operation.type);
        }
    }

    async syncSaleToFirebase(saleData) {
        // Import Firebase functions dynamically to avoid issues
        const { recordSale } = await import('../firebase/DrinkManagementService');
        return await recordSale(saleData);
    }

    async syncCustomerToFirebase(customerData) {
        const { addCustomer } = await import('../firebase/customer_service');
        return await addCustomer(customerData);
    }

    // Check if online
    isOnlineStatus() {
        return this.isOnline;
    }

    // Clear all offline data
    async clearOfflineData() {
        if (!this.db) return;

        const stores = ['drinks', 'offlineSales', 'customers', 'pendingOps'];

        for (const storeName of stores) {
            const tx = this.db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            await store.clear();
            await tx.done;
        }
    }
}

export default new OfflineManager();
