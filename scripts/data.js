window.App = window.App || {};

(function() {
  const KEYS = {
    LINKS: 'payflow_links',
    TRANSACTIONS: 'payflow_transactions',
    SETTINGS: 'payflow_settings'
  };

  App.Data = {
    getLinks: function() {
      return JSON.parse(localStorage.getItem(KEYS.LINKS) || '[]');
    },

    getLinkById: function(id) {
      const links = this.getLinks();
      return links.find(l => l.id === id);
    },

    saveLink: function(linkData) {
      const links = this.getLinks();
      const existingIndex = links.findIndex(l => l.id === linkData.id);
      
      if (existingIndex >= 0) {
        links[existingIndex] = { ...links[existingIndex], ...linkData, updatedAt: new Date().toISOString() };
      } else {
        links.push({ 
          ...linkData, 
          id: linkData.id || App.Helpers.generateId(),
          createdAt: new Date().toISOString(),
          active: true,
          views: 0
        });
      }
      
      localStorage.setItem(KEYS.LINKS, JSON.stringify(links));
      return linkData;
    },

    deleteLink: function(id) {
      let links = this.getLinks();
      links = links.filter(l => l.id !== id);
      localStorage.setItem(KEYS.LINKS, JSON.stringify(links));
    },

    getTransactions: function() {
      return JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
    },

    addTransaction: function(transaction) {
      const transactions = this.getTransactions();
      const newTx = {
        ...transaction,
        id: 'tx_' + Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString()
      };
      transactions.unshift(newTx);
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
      return newTx;
    },

    getSettings: function() {
      return JSON.parse(localStorage.getItem(KEYS.SETTINGS) || '{"currency":"USD", "businessName":"My Business"}');
    },

    saveSettings: function(settings) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    },
    
    // Stats for dashboard
    getStats: function() {
      const links = this.getLinks();
      const txs = this.getTransactions();
      const totalRevenue = txs.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      return {
        activeLinks: links.filter(l => l.active).length,
        totalRevenue: totalRevenue,
        totalTransactions: txs.length
      };
    }
  };
})();