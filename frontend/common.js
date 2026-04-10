// Funções compartilhadas entre Index e Settings

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.innerText = savedTheme === 'dark' ? 'light_mode' : 'dark_mode';
    }
}

function handleThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            console.log('Theme toggle clicked');
            const isDark = document.documentElement.classList.toggle('dark');
            const newTheme = isDark ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            
            const themeIcon = document.getElementById('theme-icon');
            if (themeIcon) {
                themeIcon.innerText = isDark ? 'light_mode' : 'dark_mode';
            }
        });
    }
}

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const toggleIcon = document.getElementById('toggle-icon');
    const sidebarToggle = document.getElementById('sidebar-toggle');

    if (!sidebar || !sidebarToggle) return;

    const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        if (mainContent) mainContent.classList.add('sidebar-collapsed');
        if (toggleIcon) toggleIcon.innerText = 'chevron_right';
    }

    sidebarToggle.addEventListener('click', () => {
        const collapsed = sidebar.classList.toggle('collapsed');
        if (mainContent) mainContent.classList.toggle('sidebar-collapsed');
        if (toggleIcon) toggleIcon.innerText = collapsed ? 'chevron_right' : 'chevron_left';
        localStorage.setItem('sidebar_collapsed', collapsed);
    });
}

// Inicialização automática ao carregar o script
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    handleThemeToggle();
    initSidebar();
});
