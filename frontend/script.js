let services = [];
let currentCategory = 'All';

// DOM Elements
const serviceGrid = document.getElementById('service-grid');
const searchInput = document.getElementById('search-input');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const categoryButtons = document.querySelectorAll('[data-category]');
const statsSummary = document.getElementById('stats-summary');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const toggleIcon = document.getElementById('toggle-icon');
const mainContent = document.getElementById('main-content');

const API_URL = 'http://localhost:8080/apps';
const CATEGORIES_URL = 'http://localhost:8080/categories';

// Initialize
async function init() {
    try {
        serviceGrid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                <span class="material-symbols-outlined text-5xl animate-spin mb-4">progress_activity</span>
                <p class="font-headline font-bold tracking-widest uppercase text-xs">Loading Command Center...</p>
            </div>
        `;

        const [appsResponse, categoriesResponse] = await Promise.all([
            fetch(API_URL),
            fetch(CATEGORIES_URL)
        ]);

        if (!appsResponse.ok || !categoriesResponse.ok) throw new Error('API communication failure');

        const appsData = await appsResponse.json();
        const categoriesData = await categoriesResponse.json();
        
        // Flatten apps from categories for search/stats but keep category names
        services = [];
        appsData.forEach(cat => {
            cat.apps.forEach(app => {
                services.push({
                    id: app.id,
                    name: app.name,
                    url: app.link,
                    category: cat.name,
                    categoryId: cat.id,
                    icon: app.icon, // Base64 string from backend
                    status: 'Active',
                    latency: Math.floor(Math.random() * 50) + 'ms'
                });
            });
        });
        
        renderDynamicCategories(categoriesData);
        renderCards(services);
        //updateStats(categoriesData.length);
    } catch (error) {
        console.error('Error loading services:', error);
        serviceGrid.innerHTML = `
            <div class="col-span-full bg-error/10 border border-error/20 rounded-2xl p-12 text-center">
                <span class="material-symbols-outlined text-error text-5xl mb-4">cloud_off</span>
                <h3 class="text-xl font-bold font-headline mb-2 text-on-background">System Offline</h3>
                <p class="text-on-surface-variant text-sm mb-6 max-w-sm mx-auto">Failed to establish connection with the backend architecture. Ensure the Flask server is operational at 8000.</p>
                <button onclick="init()" class="px-6 py-2 bg-error text-on-error rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-error-dim transition-all">Retry Handshake</button>
            </div>
        `;
    }
}

function renderDynamicCategories(categories) {
    const nav = document.getElementById('category-nav');
    const mobileNav = document.querySelector('nav.md\\:hidden');
    
    // Desktop Nav
    let navHtml = `
        <button class="w-full flex items-center gap-3 px-6 py-3 ${currentCategory === 'All' ? 'bg-gradient-to-r from-[#a7a5ff]/10 to-transparent text-[#a7a5ff] border-r-2 border-[#a7a5ff]' : 'text-slate-400'} font-['Manrope'] font-semibold tracking-wide uppercase text-[11px] transition-all" data-category="All" id="nav-all">
            <span class="material-symbols-outlined">dashboard</span>
            <span class="sidebar-text">All Systems</span>
        </button>
    `;

    // Mobile Nav
    let mobileHtml = `
        <button class="${currentCategory === 'All' ? 'text-secondary' : 'text-on-surface-variant'}" data-category="All"><span class="material-symbols-outlined">dashboard</span></button>
    `;

    categories.forEach(cat => {
        const icon = getCategoryIcon(cat.name);
        const isActive = currentCategory === cat.name;
        
        navHtml += `
            <button class="w-full flex items-center gap-3 px-6 py-3 ${isActive ? 'bg-gradient-to-r from-[#a7a5ff]/10 to-transparent text-[#a7a5ff] border-r-2 border-[#a7a5ff]' : 'text-slate-400'} hover:text-slate-100 hover:bg-[#192540] transition-all font-['Manrope'] font-semibold tracking-wide uppercase text-[11px]" data-category="${cat.name}" id="nav-${cat.name.toLowerCase()}">
                <span class="material-symbols-outlined">${icon}</span>
                <span class="sidebar-text">${cat.name}</span>
            </button>
        `;

        mobileHtml += `
            <button class="${isActive ? 'text-secondary' : 'text-on-surface-variant'}" data-category="${cat.name}"><span class="material-symbols-outlined">${icon}</span></button>
        `;
    });

    if (nav) nav.innerHTML = navHtml;
    if (mobileNav) mobileNav.innerHTML = mobileHtml;

    // Re-attach event listeners
    const allBtns = document.querySelectorAll('[data-category]');
    allBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.getAttribute('data-category');
            renderDynamicCategories(categories); // Re-render to update active state
            filterAndSearch();
        });
    });
}

function getCategoryIcon(name) {
    const icons = {
        'Desenvolvimento': 'code',
        'Infraestrutura': 'database',
        'IA': 'psychology',
        'Media': 'movie',
        'Network': 'router',
        'Files': 'folder',
        'Games': 'sports_esports'
    };
    return icons[name] || 'label';
}

// Render Cards
function renderCards(data) {
    if (data.length === 0) {
        serviceGrid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-20 opacity-30">
                <span class="material-symbols-outlined text-6xl mb-4">search_off</span>
                <p class="font-headline font-bold tracking-widest uppercase text-xs">No services found in this sector</p>
            </div>
        `;
        return;
    }

    serviceGrid.innerHTML = data.map(service => {
        const isCustomIcon = service.icon && service.icon.length > 25;
        const iconContent = isCustomIcon 
            ? `<img src="data:image/png;base64,${service.icon}" alt="${service.name}" class="w-8 h-8 object-contain">`
            : `<span class="material-symbols-outlined text-3xl">apps</span>`;

        return `
            <a href="${service.url}" target="_blank" rel="noopener noreferrer" class="group block bg-surface-container rounded-xl overflow-hidden hover:bg-surface-container-high transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/60 relative">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-8">
                        <div class="p-3 bg-surface-container-highest rounded-lg text-primary group-hover:text-secondary transition-colors flex items-center justify-center w-12 h-12">
                            ${iconContent}
                        </div>
                        <div class="flex flex-col items-end">
                            <span class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Latency</span>
                            <span class="text-xs font-mono text-secondary">${service.latency || '0ms'}</span>
                        </div>
                    </div>
                    
                    <h3 class="text-xl font-bold font-headline mb-1 text-on-surface">${service.name}</h3>
                    <p class="text-xs text-on-surface-variant font-medium uppercase tracking-tight">${service.category}</p>
                    
                    <div class="mt-6 flex items-center gap-2">
                        <div class="h-2 w-2 rounded-full ${service.status === 'Active' ? 'bg-secondary' : 'bg-outline'} shadow-[0_0_8px_rgba(52,181,250,0.4)]"></div>
                        <span class="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">${service.status || 'Inactive'}</span>
                    </div>
                </div>
                <div class="bg-surface-container-lowest h-12 px-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                     <span class="text-[10px] text-on-surface-variant font-mono truncate max-w-[150px]">${service.url}</span>
                     <span class="material-symbols-outlined text-sm text-secondary">open_in_new</span>
                </div>
            </a>
        `;
    }).join('');
}

// Filter logic
function filterAndSearch() {
    const query = searchInput.value.toLowerCase();
    const filtered = services.filter(service => {
        const matchesCategory = currentCategory === 'All' || service.category === currentCategory;
        const matchesSearch = service.name.toLowerCase().includes(query) || service.category.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
    });
    renderCards(filtered);
}

// Category Navigation
categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        currentCategory = btn.getAttribute('data-category');
        
        // Update UI
        categoryButtons.forEach(b => {
            b.classList.remove('bg-gradient-to-r', 'from-[#a7a5ff]/10', 'to-transparent', 'text-[#a7a5ff]', 'border-r-2', 'border-[#a7a5ff]');
            b.classList.add('text-slate-400');
        });
        
        // Only for desktop sidebar buttons that have IDs starting with 'nav-'
        const activeBtn = document.getElementById(`nav-${currentCategory.toLowerCase()}`);
        if (activeBtn) {
            activeBtn.classList.remove('text-slate-400');
            activeBtn.classList.add('bg-gradient-to-r', 'from-[#a7a5ff]/10', 'to-transparent', 'text-[#a7a5ff]', 'border-r-2', 'border-[#a7a5ff]');
        }
        
        filterAndSearch();
    });
});

// Search Event
if (searchInput) searchInput.addEventListener('input', filterAndSearch);

// Start
document.addEventListener('DOMContentLoaded', init);
