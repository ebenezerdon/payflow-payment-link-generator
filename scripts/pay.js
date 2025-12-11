window.App = window.App || {};

(function() {
  const PayUI = {
    init: function() {
      this.linkId = App.Helpers.getQueryParam('id');
      this.linkData = null;
      this.render();
      this.bindEvents();
    },

    bindEvents: function() {
      $(document).on('submit', '#payment-form', (e) => {
        e.preventDefault();
        this.processPayment();
      });
    },

    render: function() {
      const $container = $('#payment-container');
      
      if (!this.linkId) {
        $container.html(this.getErrorTemplate('Invalid Link', 'This payment link is missing an ID.'));
        return;
      }

      const link = App.Data.getLinkById(this.linkId);
      if (!link) {
        $container.html(this.getErrorTemplate('Link Not Found', 'This payment link does not exist or has been deleted.'));
        return;
      }

      this.linkData = link;
      
      const html = `
        <div class="grid lg:grid-cols-5 min-h-screen">
          <!-- Product Details Side -->
          <div class="lg:col-span-2 bg-slate-50 p-8 lg:p-12 flex flex-col justify-between border-r border-slate-200">
            <div>
              <a href="index.html" class="flex items-center gap-2 mb-12 text-slate-900 font-bold text-xl">
                <div class="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                PayFlow
              </a>
              
              <div class="mb-8">
                <h2 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Pay to</h2>
                <div class="text-lg font-medium text-slate-900">${App.Data.getSettings().businessName}</div>
              </div>

              <div class="mb-8">
                <div class="text-4xl font-bold text-slate-900 mb-2">${App.Helpers.formatCurrency(link.price, link.currency)}</div>
                <div class="text-slate-500 flex items-center gap-2">
                  <span class="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">One-time payment</span>
                </div>
              </div>

              <div class="space-y-4">
                ${link.image ? `<img src="${link.image}" class="w-full h-48 object-cover rounded-xl shadow-sm border border-slate-200" alt="Product">` : ''}
                <h1 class="text-2xl font-bold text-slate-900">${link.name}</h1>
                <p class="text-slate-600 leading-relaxed">${link.description || 'No description provided.'}</p>
              </div>
            </div>
            
            <div class="mt-12 pt-8 border-t border-slate-200 text-sm text-slate-500">
              Powered by PayFlow. <a href="index.html" class="underline hover:text-emerald-600">Create your own link.</a>
            </div>
          </div>

          <!-- Payment Form Side -->
          <div class="lg:col-span-3 bg-white p-8 lg:p-12 flex items-center justify-center">
            <div class="w-full max-w-md">
              <h2 class="text-2xl font-bold text-slate-900 mb-6">Payment Details</h2>
              
              <form id="payment-form" class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Email address</label>
                  <input type="email" required class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="you@example.com">
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Card Information</label>
                  <div class="relative">
                    <input type="text" required pattern="\\d*" maxlength="19" class="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="0000 0000 0000 0000">
                    <svg class="w-6 h-6 text-slate-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                  </div>
                  <div class="grid grid-cols-2 gap-4 mt-4">
                    <input type="text" required placeholder="MM / YY" maxlength="5" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
                    <input type="text" required placeholder="CVC" maxlength="3" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Cardholder Name</label>
                  <input type="text" required class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="Full Name on Card">
                </div>

                <button type="submit" id="pay-btn" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
                  <span>Pay ${App.Helpers.formatCurrency(link.price, link.currency)}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      `;
      $container.html(html);
    },

    getErrorTemplate: function(title, msg) {
      return `
        <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div class="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
            <div class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h2 class="text-xl font-bold text-slate-900 mb-2">${title}</h2>
            <p class="text-slate-500 mb-6">${msg}</p>
            <a href="index.html" class="inline-block bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors">Go Home</a>
          </div>
        </div>
      `;
    },

    processPayment: function() {
      const $btn = $('#pay-btn');
      const originalText = $btn.html();
      
      $btn.prop('disabled', true).html(`
        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Processing...
      `);

      // Simulate network delay
      setTimeout(() => {
        // Record transaction
        App.Data.addTransaction({
          linkId: this.linkId,
          amount: this.linkData.price,
          currency: this.linkData.currency,
          itemName: this.linkData.name,
          customerEmail: $('input[type="email"]').val()
        });

        // Show success
        $('#payment-container').html(`
          <div class="min-h-screen flex items-center justify-center bg-emerald-50 p-4 animate-fade-in">
            <div class="bg-white p-12 rounded-3xl shadow-xl max-w-md w-full text-center border border-emerald-100">
              <div class="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h2 class="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
              <p class="text-slate-500 mb-8">Thank you for your purchase. A receipt has been sent to your email.</p>
              <div class="bg-slate-50 p-4 rounded-xl mb-8 flex justify-between items-center">
                <span class="text-slate-500">Amount Paid</span>
                <span class="text-xl font-bold text-slate-900">${App.Helpers.formatCurrency(this.linkData.price, this.linkData.currency)}</span>
              </div>
              <a href="index.html" class="block w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl">
                Create Your Own Payment Link
              </a>
            </div>
          </div>
        `);
      }, 2000);
    }
  };

  PayUI.init();
})();