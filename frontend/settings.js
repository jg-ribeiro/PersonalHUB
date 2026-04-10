let services = [];

// DOM Elements
const tableBody = document.getElementById('services-table-body');
const serviceModal = document.getElementById('service-modal');
const serviceForm = document.getElementById('service-form');
const addServiceBtn = document.getElementById('add-service-btn');
const closeModalBtn = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const toggleIcon = document.getElementById('toggle-icon');
const mainContent = document.getElementById('main-content');
const customIconUpload = document.getElementById('custom-icon-upload');
const iconPreview = document.getElementById('icon-preview');
const fileNameSpan = document.getElementById('file-name');
const customIconDataInput = document.getElementById('custom-icon-data');

const API_URL = 'http://localhost:8080/apps';
const CATEGORIES_URL = 'http://localhost:8080/categories';

let categories = [];

// Initialize
async function init() {
    try {
        const [appsResponse, categoriesResponse] = await Promise.all([
            fetch(API_URL),
            fetch(CATEGORIES_URL)
        ]);

        if (!appsResponse.ok || !categoriesResponse.ok) throw new Error('API Error');

        const appsData = await appsResponse.json();
        categories = await categoriesResponse.json();
        
        // Flatten apps for table
        services = [];
        appsData.forEach(cat => {
            cat.apps.forEach(app => {
                services.push({
                    id: app.id,
                    name: app.name,
                    url: app.link,
                    category: cat.name,
                    categoryId: cat.id,
                    icon: app.icon // This is the base64 string from backend
                });
            });
        });
        
        populateCategorySelect();
    } catch (e) {
        console.error('Failed to load data from API', e);
    }
    renderTable();
    renderCategoriesTable();
}

function populateCategorySelect() {
    const select = document.getElementById('category');
    if (select) {
        select.innerHTML = categories.map(cat => `
            <option value="${cat.id}">${cat.name}</option>
        `).join('');
    }
}

function renderTable() {
    if (!tableBody) return;
    tableBody.innerHTML = services.map(service => {
        const isCustomIcon = service.icon && service.icon.length > 25;
        const iconContent = isCustomIcon 
            ? `<img src="data:image/png;base64,${service.icon}" alt="${service.name}" class="w-6 h-6 object-contain">`
            : `<span class="material-symbols-outlined text-xl">apps</span>`;

        return `
            <tr class="hover:bg-surface-container/50 transition-colors group">
                <td class="px-6 py-5">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform overflow-hidden">
                            ${iconContent}
                        </div>
                        <span class="text-sm font-medium">${service.name}</span>
                    </div>
                </td>
                <td class="px-6 py-5 text-sm font-mono text-on-surface-variant/70">${service.url}</td>
                <td class="px-6 py-5">
                    <span class="px-2 py-1 rounded-full bg-surface-container-highest text-[10px] text-on-surface-variant font-bold uppercase">${service.category}</span>
                </td>
                <td class="px-6 py-5 text-right">
                    <div class="flex justify-end gap-2">
                        <button onclick="editService(${service.id})" class="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-colors">
                            <span class="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button onclick="deleteService(${service.id})" class="p-2 hover:bg-error/10 rounded-lg text-on-surface-variant hover:text-error transition-colors">
                            <span class="material-symbols-outlined text-sm">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Modal Logic
if (customIconUpload) {
    customIconUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Basic validation
            if (!['image/png', 'image/svg+xml', 'image/jpeg'].includes(file.type)) {
                alert('Please upload a PNG, SVG or JPEG file.');
                customIconUpload.value = '';
                return;
            }
            if (file.size > 1024 * 1024) { // 1MB limit
                alert('File size should be less than 1MB.');
                customIconUpload.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const data = event.target.result;
                customIconDataInput.value = data;
                iconPreview.innerHTML = `<img src="${data}" class="w-full h-full object-contain">`;
                fileNameSpan.innerText = file.name;
            };
            reader.readAsDataURL(file);
        }
    });
}

function openModal(service = null) {
    serviceModal.classList.remove('hidden');
    if (service) {
        modalTitle.innerText = 'Edit Service';
        document.getElementById('service-id').value = service.id;
        document.getElementById('name').value = service.name;
        document.getElementById('url').value = service.url;
        document.getElementById('category').value = service.categoryId;
        
        const isCustomIcon = service.icon && service.icon.length > 25;
        if (isCustomIcon) {
            const fullData = `data:image/png;base64,${service.icon}`;
            customIconDataInput.value = fullData;
            iconPreview.innerHTML = `<img src="${fullData}" class="w-full h-full object-contain">`;
            fileNameSpan.innerText = 'Current icon';
        } else {
            customIconDataInput.value = '';
            iconPreview.innerHTML = `<span class="material-symbols-outlined text-on-surface-variant">apps</span>`;
            fileNameSpan.innerText = 'Default icon used';
        }
    } else {
        modalTitle.innerText = 'Add New Service';
        serviceForm.reset();
        document.getElementById('service-id').value = '';
        iconPreview.innerHTML = `<span class="material-symbols-outlined text-on-surface-variant">apps</span>`;
        fileNameSpan.innerText = 'Default icon used';
        customIconDataInput.value = '';
    }
}

if (addServiceBtn) addServiceBtn.addEventListener('click', () => openModal());
if (closeModalBtn) closeModalBtn.addEventListener('click', () => serviceModal.classList.add('hidden'));

if (serviceForm) {
    serviceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('service-id').value;
        
        const name = document.getElementById('name').value;
        const url = document.getElementById('url').value;
        const categoryId = document.getElementById('category').value;
        const iconValue = customIconDataInput.value;

        // Prepare data for backend
        let iconBase64 = null;
        if (iconValue && iconValue.includes('base64,')) {
            // Remove data:image/...;base64, prefix
            iconBase64 = iconValue.split(',')[1];
        }

        const payload = {
            name: name,
            link: url,
            icon: iconBase64,
            categorie_id: parseInt(categoryId)
        };

        try {
            let response;
            if (id) {
                // Update
                response = await fetch(`${API_URL}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                // Create
                response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (response.ok) {
                await init(); // Refresh table
                serviceModal.classList.add('hidden');
            } else {
                const err = await response.json();
                alert('Error saving service: ' + (err.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving service:', error);
            alert('Error saving service');
        }
    });
}

// DOM Elements (Categories)
const manageCategoriesBtn = document.getElementById('manage-categories-btn');
const addCategoryBtn = document.getElementById('add-category-btn');
const servicesSection = document.getElementById('services-section');
const categoriesSection = document.getElementById('categories-section');
const categoriesTableBody = document.getElementById('categories-table-body');
const categoryModal = document.getElementById('category-modal');
const categoryForm = document.getElementById('category-form');
const closeCategoryModal = document.getElementById('close-category-modal');
const categoryModalTitle = document.getElementById('category-modal-title');

// Section Switching
if (manageCategoriesBtn) {
    manageCategoriesBtn.addEventListener('click', () => {
        const isManaging = categoriesSection.classList.toggle('hidden');
        servicesSection.classList.toggle('hidden', !isManaging);
        manageCategoriesBtn.innerHTML = !isManaging 
            ? `<span class="material-symbols-outlined text-sm">view_list</span> Manage Apps`
            : `<span class="material-symbols-outlined text-sm">category</span> Manage Categories`;
    });
}

// Render Categories Table
function renderCategoriesTable() {
    if (!categoriesTableBody) return;
    categoriesTableBody.innerHTML = categories.map(cat => `
        <tr class="hover:bg-surface-container/50 transition-colors group">
            <td class="px-6 py-5 text-sm font-bold font-headline text-on-surface">${cat.name}</td>
            <td class="px-6 py-5 text-sm text-on-surface-variant/70">${cat.description || '—'}</td>
            <td class="px-6 py-5 text-right">
                <div class="flex justify-end gap-2">
                    <button onclick="editCategory(${cat.id})" class="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-secondary transition-colors">
                        <span class="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button onclick="deleteCategory(${cat.id})" class="p-2 hover:bg-error/10 rounded-lg text-on-surface-variant hover:text-error transition-colors">
                        <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Category Modal Logic
function openCategoryModal(cat = null) {
    categoryModal.classList.remove('hidden');
    if (cat) {
        categoryModalTitle.innerText = 'Edit Sector';
        document.getElementById('category-id').value = cat.id;
        document.getElementById('cat-name').value = cat.name;
        document.getElementById('cat-description').value = cat.description || '';
    } else {
        categoryModalTitle.innerText = 'Add New Sector';
        categoryForm.reset();
        document.getElementById('category-id').value = '';
    }
}

if (addCategoryBtn) addCategoryBtn.addEventListener('click', () => openCategoryModal());
if (closeCategoryModal) closeCategoryModal.addEventListener('click', () => categoryModal.classList.add('hidden'));

if (categoryForm) {
    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('category-id').value;
        const name = document.getElementById('cat-name').value;
        const description = document.getElementById('cat-description').value;

        const payload = { name, description };

        try {
            let response;
            if (id) {
                response = await fetch(`${CATEGORIES_URL}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                response = await fetch(CATEGORIES_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (response.ok) {
                await init();
                categoryModal.classList.add('hidden');
            } else {
                const err = await response.json();
                alert('Error saving sector: ' + (err.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving sector:', error);
        }
    });
}

window.editCategory = (id) => {
    const cat = categories.find(c => c.id === id);
    openCategoryModal(cat);
};

window.deleteCategory = async (id) => {
    const appsInCat = services.filter(s => s.categoryId === id).length;
    const msg = appsInCat > 0 
        ? `Deleting this sector will also delete ${appsInCat} associated services. Are you sure?`
        : 'Are you sure you want to delete this sector?';
        
    if (confirm(msg)) {
        try {
            const response = await fetch(`${CATEGORIES_URL}/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await init();
            } else {
                alert('Error deleting sector');
            }
        } catch (error) {
            console.error('Error deleting sector:', error);
        }
    }
};

window.editService = (id) => {
    const service = services.find(s => s.id === id);
    openModal(service);
};

window.deleteService = async (id) => {
    if (confirm('Are you sure you want to delete this service?')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await init(); // Refresh table
            } else {
                alert('Error deleting service');
            }
        } catch (error) {
            console.error('Error deleting service:', error);
            alert('Error deleting service');
        }
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    init();
});
