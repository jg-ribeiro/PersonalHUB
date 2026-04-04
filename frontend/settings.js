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
const iconTypeSelect = document.getElementById('icon-type');
const materialIconGroup = document.getElementById('material-icon-group');
const customIconGroup = document.getElementById('custom-icon-group');
const customIconUpload = document.getElementById('custom-icon-upload');
const iconPreview = document.getElementById('icon-preview');
const fileNameSpan = document.getElementById('file-name');
const customIconDataInput = document.getElementById('custom-icon-data');

// Initialize
async function init() {
    const savedServices = localStorage.getItem('homelab_services');
    if (savedServices) {
        services = JSON.parse(savedServices);
    } else {
        try {
            const response = await fetch('mock.json');
            services = await response.json();
            saveToStorage();
        } catch (e) {
            console.error('Failed to load initial mock data');
        }
    }
    renderTable();
    initTheme();
    initSidebar();
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

function saveToStorage() {
    localStorage.setItem('homelab_services', JSON.stringify(services));
}

function renderTable() {
    tableBody.innerHTML = services.map(service => {
        const isCustomIcon = service.iconType === 'custom' && service.customIcon;
        const iconContent = isCustomIcon 
            ? `<img src="${service.customIcon}" alt="${service.name}" class="w-6 h-6 object-contain">`
            : `<span class="material-symbols-outlined text-xl">${service.icon || 'apps'}</span>`;

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
iconTypeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'material') {
        materialIconGroup.classList.remove('hidden');
        customIconGroup.classList.add('hidden');
    } else {
        materialIconGroup.classList.add('hidden');
        customIconGroup.classList.remove('hidden');
    }
});

customIconUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        // Basic validation
        if (!['image/png', 'image/svg+xml'].includes(file.type)) {
            alert('Please upload a PNG or SVG file.');
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

function openModal(service = null) {
    serviceModal.classList.remove('hidden');
    if (service) {
        modalTitle.innerText = 'Edit Service';
        document.getElementById('service-id').value = service.id;
        document.getElementById('name').value = service.name;
        document.getElementById('url').value = service.url;
        document.getElementById('category').value = service.category;
        
        const type = service.iconType || 'material';
        iconTypeSelect.value = type;
        if (type === 'material') {
            materialIconGroup.classList.remove('hidden');
            customIconGroup.classList.add('hidden');
            document.getElementById('icon').value = service.icon || '';
        } else {
            materialIconGroup.classList.add('hidden');
            customIconGroup.classList.remove('hidden');
            customIconDataInput.value = service.customIcon || '';
            iconPreview.innerHTML = service.customIcon 
                ? `<img src="${service.customIcon}" class="w-full h-full object-contain">`
                : `<span class="material-symbols-outlined text-on-surface-variant">image</span>`;
            fileNameSpan.innerText = 'Current icon';
        }
    } else {
        modalTitle.innerText = 'Add New Service';
        serviceForm.reset();
        document.getElementById('service-id').value = '';
        iconTypeSelect.value = 'material';
        materialIconGroup.classList.remove('hidden');
        customIconGroup.classList.add('hidden');
        iconPreview.innerHTML = `<span class="material-symbols-outlined text-on-surface-variant">image</span>`;
        fileNameSpan.innerText = 'No file chosen';
        customIconDataInput.value = '';
    }
}

addServiceBtn.addEventListener('click', () => openModal());
closeModalBtn.addEventListener('click', () => serviceModal.classList.add('hidden'));

serviceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('service-id').value;
    const iconType = iconTypeSelect.value;
    
    const newService = {
        id: id ? parseInt(id) : Date.now(),
        name: document.getElementById('name').value,
        url: document.getElementById('url').value,
        category: document.getElementById('category').value,
        iconType: iconType,
        icon: iconType === 'material' ? document.getElementById('icon').value : null,
        customIcon: iconType === 'custom' ? customIconDataInput.value : null,
        status: 'Active',
        latency: Math.floor(Math.random() * 50) + 'ms'
    };

    if (id) {
        const index = services.findIndex(s => s.id === parseInt(id));
        services[index] = newService;
    } else {
        services.push(newService);
    }

    saveToStorage();
    renderTable();
    serviceModal.classList.add('hidden');
});

window.editService = (id) => {
    const service = services.find(s => s.id === id);
    openModal(service);
};

window.deleteService = (id) => {
    if (confirm('Are you sure you want to delete this service?')) {
        services = services.filter(s => s.id !== id);
        saveToStorage();
        renderTable();
    }
};

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
}

document.addEventListener('DOMContentLoaded', init);
