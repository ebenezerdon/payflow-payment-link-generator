window.App = window.App || {};

(function() {
  App.Helpers = {
    generateId: function() {
      return 'link_' + Math.random().toString(36).substr(2, 9);
    },

    formatCurrency: function(amount, currency = 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    },

    formatDate: function(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    showToast: function(message, type = 'success') {
      const $container = $('#toast-container');
      if ($container.length === 0) {
        $('body').append('<div id="toast-container"></div>');
      }
      
      const colorClass = type === 'error' ? 'border-red-500 text-red-700' : 'border-emerald-500 text-emerald-900';
      const icon = type === 'error' 
        ? '<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
        : '<svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';

      const $toast = $(`
        <div class="toast ${colorClass}">
          ${icon}
          <span class="font-medium">${message}</span>
        </div>
      `);

      $('#toast-container').append($toast);
      
      setTimeout(() => {
        $toast.css('opacity', '0').css('transform', 'translateX(100%)');
        setTimeout(() => $toast.remove(), 300);
      }, 3000);
    },

    // Parse query params for pay.html
    getQueryParam: function(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    }
  };
})();