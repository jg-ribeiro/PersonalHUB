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

// Initialize
async function init() {
    try {
        const savedServices = localStorage.getItem('homelab_services');
        if (savedServices) {
            services = JSON.parse(savedServices);
        } else {
            const response = await fetch('mock.json');
            services = await response.json();
            localStorage.setItem('homelab_services', JSON.stringify(services));
        }
        renderCards(services);
        updateStats();
        initTheme();
        initSidebar();
        updateCategories();
    } catch (error) {
        console.error('Error loading services:', error);
        serviceGrid.innerHTML = `<p class="text-error col-span-full text-center">Failed to load services.</p>`;
    }
}

// Sidebar Logic
function initSidebar() {
    const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('sidebar-collapsed');
        toggleIcon.innerText = 'chevron_right';
    }
}

sidebarToggle.addEventListener('click', () => {
    const isCollapsed = sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('sidebar-collapsed');
    toggleIcon.innerText = isCollapsed ? 'chevron_right' : 'chevron_left';
    localStorage.setItem('sidebar_collapsed', isCollapsed);
});

function updateCategories() {
    const nav = document.getElementById('category-nav');
    const uniqueCategories = [...new Set(services.map(s => s.category))];
    // Dynamic category update logic could go here
}

// Render Cards
function renderCards(data) {
    serviceGrid.innerHTML = data.map(service => {
        const isCustomIcon = service.iconType === 'custom' && service.customIcon;
        const iconContent = isCustomIcon 
            ? `<img src="${service.customIcon}" alt="${service.name}" class="w-8 h-8 object-contain">`
            : `<span class="material-symbols-outlined text-3xl">${service.icon || 'apps'}</span>`;

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

// Update Stats
function updateStats() {
    const totalServices = services.length;
    const categories = [...new Set(services.map(s => s.category))].length;
    
    statsSummary.innerHTML = `
        <div class="bg-surface-container rounded-xl p-4 flex flex-col items-center justify-center min-w-[100px] border-b-2 border-secondary">
            <span class="text-xs font-bold uppercase tracking-widest text-secondary mb-1">Services</span>
            <span class="text-xl font-bold">${totalServices}</span>
        </div>
        <div class="bg-surface-container rounded-xl p-4 flex flex-col items-center justify-center min-w-[100px] border-b-2 border-primary">
            <span class="text-xs font-bold uppercase tracking-widest text-primary mb-1">Categories</span>
            <span class="text-xl font-bold">${categories}</span>
        </div>
    `;
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
searchInput.addEventListener('input', filterAndSearch);

// Theme Toggle
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    themeIcon.innerText = savedTheme === 'dark' ? 'light_mode' : 'dark_mode';
}

themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    const newTheme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    themeIcon.innerText = isDark ? 'light_mode' : 'dark_mode';
});

// Start
document.addEventListener('DOMContentLoaded', init);
