// storage-client.js - À intégrer dans ton site HTML
// Remplace WORKER_URL par l'URL de ton worker Cloudflare

const WORKER_URL = 'https://ton-worker.workers.dev'; // À MODIFIER

window.storage = {
  async get(key, shared = false) {
    try {
      const storageKey = shared ? `shared:${key}` : `user:${key}`;
      const response = await fetch(`${WORKER_URL}/storage/get/${encodeURIComponent(storageKey)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Key not found');
        }
        throw new Error('Storage error');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Storage get error:', error);
      throw error;
    }
  },

  async set(key, value, shared = false) {
    try {
      const storageKey = shared ? `shared:${key}` : `user:${key}`;
      const response = await fetch(`${WORKER_URL}/storage/set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: storageKey, value: String(value) })
      });
      
      if (!response.ok) {
        throw new Error('Storage error');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Storage set error:', error);
      throw error;
    }
  },

  async delete(key, shared = false) {
    try {
      const storageKey = shared ? `shared:${key}` : `user:${key}`;
      const response = await fetch(`${WORKER_URL}/storage/delete/${encodeURIComponent(storageKey)}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Storage error');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Storage delete error:', error);
      throw error;
    }
  },

  async list(prefix = '', shared = false) {
    try {
      const storagePrefix = shared ? `shared:${prefix}` : `user:${prefix}`;
      const response = await fetch(`${WORKER_URL}/storage/list?prefix=${encodeURIComponent(storagePrefix)}`);
      
      if (!response.ok) {
        throw new Error('Storage error');
      }
      
      const data = await response.json();
      // Retirer le préfixe shared:/user: des clés retournées
      data.keys = data.keys.map(k => k.replace(/^(shared:|user:)/, ''));
      return data;
    } catch (error) {
      console.error('Storage list error:', error);
      throw error;
    }
  }
};
