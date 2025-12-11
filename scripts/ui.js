window.App = window.App || {};

(function() {
  const UI = {
    state: {
      currentView: 'dashboard',
      isAiLoading: false
    },

    init: function() {
      this.bindEvents();
      this.renderSidebar();
      this.navigate('dashboard');
      
      // Load AI silently in background if WebGPU exists, but don't block UI
      if (navigator.gpu) {
        // Just pre-check, don't auto-load massive model until requested or user enters Create flow
        console.log('WebGPU available for AI features');
      }
    },

    bindEvents: function() {
      // Navigation
      $(document).on('click', '[data-nav]', (e) => {
        e.preventDefault();
        const view = $(e.currentTarget).data('nav');
        this.navigate(view);
      });

      // Create Link Form
      $(document).on('submit', '#create-link-form', (e) => {
        e.preventDefault();
        this.handleCreateLink();
      });

      // Delete Link
      $(document).on('click', '[data-delete-link]', (e) => {
        const id = $(e.currentTarget).data('delete-link');
        if(confirm('Are you sure you want to delete this payment link?')) {
          App.Data.deleteLink(id);
          App.Helpers.showToast('Link deleted successfully');
          this.renderLinksList();
          this.renderDashboardStats();
        }
      });

      // Copy Link
      $(document).on('click', '[data-copy-link]', (e) => {
        const id = $(e.currentTarget).data('copy-link');
        const url = `${window.location.origin}/pay.html?id=${id}`;
        navigator.clipboard.writeText(url).then(() => {
          App.Helpers.showToast('Payment link copied to clipboard!');
        });
      });

      // AI Generation Trigger
      $(document).on('click', '#ai-generate-btn', async () => {
        const productName = $('#link-name').val();
        if (!productName) {
          App.Helpers.showToast('Please enter a product name first', 'error');
          return;
        }
        await this.handleAiGeneration(productName);
      });
    },

    navigate: function(view) {
      this.state.currentView = view;
      $('[data-nav]').removeClass('bg-emerald-50 text-emerald-600').addClass('text-slate-600 hover:bg-slate-50');
      $(`[data-nav="${view}"]`).removeClass('text-slate-600 hover:bg-slate-50').addClass('bg-emerald-50 text-emerald-600');
      
      $('#main-content').empty();
      
      switch(view) {
        case 'dashboard': this.renderDashboard(); break;
        case 'create': this.renderCreateLink(); break;
        case 'links': this.renderLinksList(); break;
        case 'settings': this.renderSettings(); break;
      }
    },

    renderSidebar: function() {
      // Sidebar is static in HTML, just updating active states in navigate
    },

    renderDashboard: function() {
      const stats = App.Data.getStats();
      const recentTx = App.Data.getTransactions().slice(0, 5);

      const html = `
        <div class="space-y-8 animate-fade-in">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Overview</h1>
            <p class="text-slate-500">Welcome back to your business command center.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div class="text-sm font-medium text-slate-500 mb-1">Total Revenue</div>
              <div class="text-3xl font-bold text-emerald-600">${App.Helpers.formatCurrency(stats.totalRevenue)}</div>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div class="text-sm font-medium text-slate-500 mb-1">Active Links</div>
              <div class="text-3xl font-bold text-slate-800">${stats.activeLinks}</div>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div class="text-sm font-medium text-slate-500 mb-1">Total Transactions</div>
              <div class="text-3xl font-bold text-slate-800">${stats.totalTransactions}</div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 class="text-lg font-bold text-slate-900">Recent Transactions</h2>
              <button data-nav="links" class="text-sm text-emerald-600 font-medium hover:text-emerald-700">View all links</button>
            </div>
            <div class="divide-y divide-slate-100">
              ${recentTx.length ? recentTx.map(tx => `
                <div class="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                      <div class="font-medium text-slate-900">Payment for ${tx.itemName}</div>
                      <div class="text-sm text-slate-500">${App.Helpers.formatDate(tx.date)}</div>
                    </div>
                  </div>
                  <div class="font-bold text-slate-900">+${App.Helpers.formatCurrency(tx.amount, tx.currency)}</div>
                </div>
              `).join('') : `
                <div class="p-8 text-center text-slate-500">
                  No transactions yet. Share your links to get paid!
                </div>
              `}
            </div>
          </div>
        </div>
      `;
      $('#main-content').html(html);
    },

    renderCreateLink: function() {
      const html = `
        <div class="max-w-2xl mx-auto animate-fade-in">
          <div class="mb-8">
            <h1 class="text-2xl font-bold text-slate-900">Create Payment Link</h1>
            <p class="text-slate-500">Set up a product or service to sell instantly.</p>
          </div>

          <form id="create-link-form" class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Product Name</label>
              <input type="text" id="link-name" required class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="e.g. Digital Marketing Consultation">
            </div>

            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Price</label>
                <input type="number" id="link-price" step="0.01" required class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="0.00">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                <select id="link-currency" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>
            </div>

            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="block text-sm font-medium text-slate-700">Description</label>
                <button type="button" id="ai-generate-btn" class="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md transition-colors">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  AI Magic Write
                </button>
              </div>
              <textarea id="link-desc" rows="4" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="Describe your product..."></textarea>
              <div id="ai-progress" class="hidden mt-2">
                <div class="w-full bg-slate-100 rounded-full h-1.5">
                  <div class="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
                <p class="text-xs text-slate-400 mt-1">Loading AI model... <span id="ai-percent">0%</span></p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Image URL (Optional)</label>
              <input type="url" id="link-image" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="https://...">
            </div>

            <div class="pt-4">
              <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-1 active:scale-95">
                Create Payment Link
              </button>
            </div>
          </form>
        </div>
      `;
      $('#main-content').html(html);
    },

    renderLinksList: function() {
      const links = App.Data.getLinks();
      const html = `
        <div class="space-y-6 animate-fade-in">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-slate-900">Your Links</h1>
              <p class="text-slate-500">Manage and share your payment links.</p>
            </div>
            <button data-nav="create" class="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md hover:bg-emerald-700 transition-all flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              New Link
            </button>
          </div>

          ${links.length === 0 ? `
            <div class="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
              </div>
              <h3 class="text-lg font-medium text-slate-900 mb-1">No active links</h3>
              <p class="text-slate-500 mb-6">Create your first payment link to start accepting payments.</p>
              <button data-nav="create" class="text-emerald-600 font-medium hover:text-emerald-700">Create Link &rarr;</button>
            </div>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${links.map(link => `
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
                  <div class="flex justify-between items-start mb-4">
                    <div class="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                      ${link.image ? `<img src="${link.image}" class="w-full h-full object-cover" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjOTRhM2I4Ij48cGF0aCBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgZD0iTTQgMTZoMTZNNCAxMnY0bS00IDRoMTRtLTUgNGgxbS0xLTRoMW0tMSA0bTQtNGgxIi8+PC9zdmc+'">` : `<span class="text-slate-400 font-bold text-xl">${link.name.charAt(0)}</span>`}
                    </div>
                    <div class="relative group">
                      <button class="text-slate-400 hover:text-slate-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                      </button>
                      <div class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 hidden group-hover:block z-10">
                         <button data-delete-link="${link.id}" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Delete Link</button>
                      </div>
                    </div>
                  </div>
                  <h3 class="font-bold text-slate-900 mb-1 truncate">${link.name}</h3>
                  <p class="text-2xl font-bold text-emerald-600 mb-4">${App.Helpers.formatCurrency(link.price, link.currency)}</p>
                  <div class="flex gap-2">
                    <button data-copy-link="${link.id}" class="flex-1 bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                      Copy Link
                    </button>
                    <a href="pay.html?id=${link.id}" target="_blank" class="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `;
      $('#main-content').html(html);
    },

    renderSettings: function() {
      const settings = App.Data.getSettings();
      const html = `
        <div class="max-w-2xl mx-auto animate-fade-in">
          <h1 class="text-2xl font-bold text-slate-900 mb-8">Settings</h1>
          <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <p class="text-slate-500">These settings are for display purposes only in this demo.</p>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Business Name</label>
              <input type="text" value="${settings.businessName}" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed" readonly>
            </div>
            <div>
               <label class="block text-sm font-medium text-slate-700 mb-2">Default Currency</label>
               <input type="text" value="${settings.currency}" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed" readonly>
            </div>
            <div class="p-4 bg-emerald-50 rounded-xl text-sm text-emerald-800">
              <strong>Note:</strong> In a real production app, you would configure your Stripe/PayPal keys and webhook endpoints here.
            </div>
          </div>
        </div>
      `;
      $('#main-content').html(html);
    },

    handleCreateLink: function() {
      const name = $('#link-name').val();
      const price = parseFloat($('#link-price').val());
      const currency = $('#link-currency').val();
      const desc = $('#link-desc').val();
      const image = $('#link-image').val();

      if (!name || isNaN(price)) return;

      App.Data.saveLink({
        name,
        price,
        currency,
        description: desc,
        image
      });

      App.Helpers.showToast('Link created successfully!');
      this.navigate('links');
    },

    handleAiGeneration: async function(productName) {
      const $btn = $('#ai-generate-btn');
      const $progress = $('#ai-progress');
      const $bar = $progress.find('div > div');
      const $percent = $('#ai-percent');
      const $desc = $('#link-desc');

      $btn.prop('disabled', true).addClass('opacity-50 cursor-not-allowed');
      $progress.removeClass('hidden');
      $desc.val('Generating description...');

      try {
        // Load model if needed
        if (!window.AppLLM.ready) {
          await window.AppLLM.load(undefined, (p) => {
            $bar.css('width', p + '%');
            $percent.text(p + '%');
          });
        }

        $bar.css('width', '100%');
        $percent.text('Processing...');
        $desc.val(''); // Clear placeholder

        // Generate
        const prompt = `Write a short, persuasive sales description (2 sentences max) for a product named "${productName}". Use a professional and exciting tone. Do not include quotes.`;
        
        let fullText = '';
        await window.AppLLM.generate(prompt, {
          system: 'You are an expert copywriter for a fintech checkout page. Be concise.',
          onToken: (token) => {
            fullText += token;
            $desc.val(fullText);
            // Auto scroll textarea
            $desc.scrollTop($desc[0].scrollHeight);
          }
        });

      } catch (err) {
        console.error(err);
        App.Helpers.showToast('Failed to generate description. WebGPU may not be supported.', 'error');
        $desc.val('');
      } finally {
        $btn.prop('disabled', false).removeClass('opacity-50 cursor-not-allowed');
        $progress.addClass('hidden');
      }
    }
  };

  App.UI = UI;
})();