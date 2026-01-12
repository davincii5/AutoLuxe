// assets/js/app.js

// --- 1. GLOBAL STATE & CONFIG ---
const translations = {
    en: {
        nav_analytics: "Analytics", nav_inventory: "Inventory", nav_clients: "Clients", nav_orders: "Orders", nav_employees: "Employees", nav_services: "Services",
        logout: "Logout", search_placeholder: "Search across all tables...",
        kpi_inventory: "Inventory", kpi_revenue: "Revenue", kpi_clients: "Clients", kpi_pending: "Pending Orders",
        chart_fleet: "Fleet Status", chart_fuel: "Fuel Types", chart_brands: "Brands", chart_trend: "Revenue Trend", chart_ranges: "Price Ranges", chart_analysis: "Price Analysis",
        title_inventory: "Car Inventory", title_clients: "Clients", title_orders: "Orders", title_employees: "Employees", title_services: "Services",
        btn_add: "+ Add", btn_save: "Save", btn_cancel: "Cancel", btn_prev: "Prev", btn_next: "Next", btn_back: "Back", btn_download_pdf: "Download PDF",
        th_photo: "Photo", th_brand: "Brand", th_price: "Price", th_status: "Status", th_actions: "Actions",
        th_name: "Name", th_city: "City", th_spent: "Spent", th_car: "Car", th_client: "Client", th_amount: "Amount", th_role: "Role", th_sales: "Sales", th_type: "Type", th_date: "Date", th_cost: "Cost",
        lbl_year: "Year:", lbl_fuel: "Fuel:", lbl_price: "Price:", lbl_status: "Status:"
    },
    fr: {
        nav_analytics: "Analytique", nav_inventory: "Inventaire", nav_clients: "Clients", nav_orders: "Commandes", nav_employees: "Employés", nav_services: "Services",
        logout: "Déconnexion", search_placeholder: "Rechercher...",
        kpi_inventory: "Inventaire", kpi_revenue: "Revenus", kpi_clients: "Clients", kpi_pending: "Commandes en attente",
        chart_fleet: "État de la flotte", chart_fuel: "Carburants", chart_brands: "Marques", chart_trend: "Tendance des revenus", chart_ranges: "Gamme de prix", chart_analysis: "Analyse des prix",
        title_inventory: "Inventaire Voitures", title_clients: "Clients", title_orders: "Commandes", title_employees: "Employés", title_services: "Services",
        btn_add: "+ Ajouter", btn_save: "Sauvegarder", btn_cancel: "Annuler", btn_prev: "Préc", btn_next: "Suiv", btn_back: "Retour", btn_download_pdf: "Télécharger PDF",
        th_photo: "Photo", th_brand: "Marque", th_price: "Prix", th_status: "Statut", th_actions: "Actions",
        th_name: "Nom", th_city: "Ville", th_spent: "Dépensé", th_car: "Voiture", th_client: "Client", th_amount: "Montant", th_role: "Rôle", th_sales: "Ventes", th_type: "Type", th_date: "Date", th_cost: "Coût",
        lbl_year: "Année:", lbl_fuel: "Carburant:", lbl_price: "Prix:", lbl_status: "Statut:"
    }
};

let db = { cars: [], clients: [], orders: [], employees: [], services: [] }; 
let charts = {};
//Tracks the current page and sorting order for the Inventory table.
let carState = { page: 1, limit: 5, sortCol: null, sortAsc: true };
let currentDetailItem = null;
let currentLang = 'en';

// --- 2. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
});

function setupEventListeners() {
    // Form Submissions
    document.getElementById('car-form').addEventListener('submit', (e) => handleSave(e, 'cars', 'car-modal', renderCars));
    document.getElementById('client-form').addEventListener('submit', (e) => handleSave(e, 'clients', 'client-modal', renderClients));
    document.getElementById('employee-form').addEventListener('submit', (e) => handleSave(e, 'employees', 'employee-modal', renderEmployees));
    document.getElementById('service-form').addEventListener('submit', (e) => handleSave(e, 'services', 'service-modal', renderServices));
    document.getElementById('order-form').addEventListener('submit', (e) => handleSave(e, 'orders', 'order-modal', renderOrders));

    // Global Search
    const searchInput = document.getElementById('global-search');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const activeSection = document.querySelector('.page-section:not(.hidden)').id;
            
            if (activeSection === 'inventory-section') { 
                carState.page = 1; 
                renderCars(); 
            }
            else if (activeSection === 'clients-section') renderClients(db.clients.filter(x => x.name.toLowerCase().includes(term) || x.email.toLowerCase().includes(term)));
            else if (activeSection === 'orders-section') renderOrders(db.orders.filter(x => x.id.toString().includes(term) || x.status.toLowerCase().includes(term)));
            else if (activeSection === 'employees-section') renderEmployees(db.employees.filter(x => x.name.toLowerCase().includes(term) || x.role.toLowerCase().includes(term)));
            else if (activeSection === 'services-section') renderServices(db.services.filter(x => x.type.toLowerCase().includes(term) || x.date.includes(term)));
        });
    }

    // Language Dropdown
    const langBtn = document.getElementById('lang-btn');
    const langDropdown = document.getElementById('lang-dropdown');
    
    if(langBtn) {
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('hidden');
        });
        //waits for the HTML to fully load (DOMContentLoaded) before running any logic.
        document.addEventListener('click', (e) => {
            if (!langBtn.contains(e.target) && !langDropdown.contains(e.target)) {
                langDropdown.classList.add('hidden');
            }
        });
    }
}

// --- 3. CORE FUNCTIONS ---
//Fetches the data.json file asynchronously.
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error("Failed to load JSON");
        db = await response.json(); 
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('dashboard-section').classList.remove('hidden');
        renderAll();
    } catch (error) {
        console.error(error);
        const loader = document.getElementById('loading');
        if(loader) {
            loader.innerText = "Error: Use Live Server to load JSON!";
            loader.classList.add('text-red-500');
        }
    }
}

function renderAll() {
    renderDashboard();
    renderCars(); 
    renderClients(db.clients); 
    renderOrders(db.orders);
    renderEmployees(db.employees);
    renderServices(db.services);
    setLanguage(currentLang);
}

// Global functions attached to window for HTML access
window.setLanguage = function(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(translations[lang][key]) el.innerText = translations[lang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if(translations[lang][key]) el.placeholder = translations[lang][key];
    });
    document.getElementById('current-lang').innerText = lang === 'fr' ? 'Fr' : 'En';
    document.getElementById('lang-dropdown').classList.add('hidden');
};

// --- 4. RENDERERS ---
//Generates HTML table rows dynamically based on the data in db.
function renderCars() {
    const tbody = document.getElementById('cars-tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    let data = [...db.cars];
    const searchInput = document.getElementById('global-search');
    const term = searchInput ? searchInput.value.toLowerCase() : '';

    if(term) data = data.filter(c => c.brand.toLowerCase().includes(term) || c.model.toLowerCase().includes(term));

    if(carState.sortCol) {
        data.sort((a, b) => {
            let valA = a[carState.sortCol], valB = b[carState.sortCol];
            if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
            return carState.sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        });
    }

    const totalPages = Math.ceil(data.length / carState.limit) || 1;
    if(carState.page > totalPages) carState.page = totalPages;
    const start = (carState.page - 1) * carState.limit;
    
    data.slice(start, start + carState.limit).forEach(c => {
        const color = c.status === 'Available' ? 'text-green-400' : c.status === 'Sold' ? 'text-red-400' : 'text-yellow-400';
        tbody.innerHTML += `
        <tr class="border-b border-slate-700 hover:bg-slate-800/50 transition">
            <td class="px-6 py-4"><img src="${c.image_url || 'https://via.placeholder.com/150'}" class="car-thumb h-12 w-20 object-cover rounded border border-slate-600"></td>
            <td class="px-6 py-4 text-white font-bold">${c.brand} <span class="block text-xs text-slate-500 font-normal">${c.model}</span></td>
            <td class="px-6 py-4 text-neon-cyan font-mono">$${c.price.toLocaleString()}</td>
            <td class="px-6 py-4 ${color}">${c.status}</td>
            <td class="px-6 py-4 flex gap-3">
                <button onclick="viewDetails(${c.id})" class="text-white hover:text-neon-cyan"><i class="fas fa-eye"></i></button>
                <button onclick="editCar(${c.id})" class="text-blue-400 hover:text-blue-300"><i class="fas fa-pencil-alt"></i></button>
                <button onclick="deleteItem('cars', ${c.id})" class="text-red-500 hover:text-red-400"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    });
    
    const pageInfo = document.getElementById('cars-page-info');
    if(pageInfo) pageInfo.innerText = `Page ${carState.page} of ${totalPages}`;
}

function renderClients(data) { 
    const tbody = document.getElementById('clients-tbody');
    if(tbody) tbody.innerHTML = (data || db.clients).map(c => `
        <tr class="border-b border-slate-700 hover:bg-slate-800/50">
            <td class="px-6 py-4 text-white">${c.name}</td><td class="px-6 py-4 text-slate-400">${c.email}</td><td class="px-6 py-4 text-slate-400">${c.city}</td><td class="px-6 py-4 text-electric-purple">$${c.total_spent.toLocaleString()}</td>
            <td class="px-6 py-4"><button onclick="editClient(${c.id})" class="text-blue-400 mr-2"><i class="fas fa-pencil-alt"></i></button><button onclick="deleteItem('clients', ${c.id})" class="text-red-500"><i class="fas fa-trash"></i></button></td>
        </tr>`).join(''); 
}

function renderOrders(data) { 
    const tbody = document.getElementById('orders-tbody');
    const statusStyles = { 'Pending': 'bg-yellow-500/20 text-yellow-400', 'Processing': 'bg-blue-500/20 text-blue-400', 'Completed': 'bg-emerald-500/20 text-emerald-400' };
    if(tbody) tbody.innerHTML = (data || db.orders).map(o => `
        <tr class="border-b border-slate-700 hover:bg-slate-800/50">
            <td class="px-6 py-4 text-slate-500">#${o.id}</td>
            <td class="px-6 py-4 text-slate-300">${db.cars.find(c=>c.id===o.car_id)?.brand || 'Unknown'}</td>
            <td class="px-6 py-4 text-slate-300">${db.clients.find(c=>c.id===o.client_id)?.name || 'Unknown'}</td>
            <td class="px-6 py-4 text-white">$${o.amount.toLocaleString()}</td>
            <td class="px-6 py-4"><button onclick="cycleOrderStatus(${o.id})" class="text-xs px-2 py-1 rounded cursor-pointer ${statusStyles[o.status]}">${o.status}</button></td>
            <td class="px-6 py-4">
                <button onclick="editOrder(${o.id})" class="text-blue-400 mr-2"><i class="fas fa-pencil-alt"></i></button>
                <button onclick="deleteItem('orders', ${o.id})" class="text-red-500"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join(''); 
}

function renderEmployees(data) { 
    const tbody = document.getElementById('employees-tbody');
    if(tbody) tbody.innerHTML = (data || db.employees).map(e => `
        <tr class="border-b border-slate-700 hover:bg-slate-800/50">
            <td class="px-6 py-4 text-white">${e.name}</td><td class="px-6 py-4 text-slate-400">${e.role}</td><td class="px-6 py-4 text-neon-cyan">${e.sales_count}</td>
            <td class="px-6 py-4"><button onclick="editEmployee(${e.id})" class="text-blue-400 mr-2"><i class="fas fa-pencil-alt"></i></button><button onclick="deleteItem('employees', ${e.id})" class="text-red-500"><i class="fas fa-trash"></i></button></td>
        </tr>`).join(''); 
}

function renderServices(data) { 
    const tbody = document.getElementById('services-tbody');
    if(tbody) tbody.innerHTML = (data || db.services).map(s => `
        <tr class="border-b border-slate-700 hover:bg-slate-800/50">
            <td class="px-6 py-4 text-slate-300">Car #${s.car_id}</td><td class="px-6 py-4 text-white">${s.type}</td><td class="px-6 py-4 text-slate-400">${s.date}</td><td class="px-6 py-4 text-red-400">-$${s.cost}</td>
            <td class="px-6 py-4"><button onclick="editService(${s.id})" class="text-blue-400 mr-2"><i class="fas fa-pencil-alt"></i></button><button onclick="deleteItem('services', ${s.id})" class="text-red-500"><i class="fas fa-trash"></i></button></td>
        </tr>`).join(''); 
}

// --- 5. DASHBOARD & CHARTS ---
//Calculates totals (KPIs) and prepares data arrays for Chart.js.
function renderDashboard() {
    document.getElementById('kpi-cars').innerText = db.cars.length;
    document.getElementById('kpi-clients').innerText = db.clients.length;
    document.getElementById('kpi-orders').innerText = db.orders.filter(o => o.status === 'Pending').length;
    const revenue = db.orders.filter(o => o.status === 'Completed').reduce((acc, o) => acc + o.amount, 0);
    document.getElementById('kpi-revenue').innerText = `$${(revenue / 1000).toFixed(1)}k`;
    updateCharts(revenue);
}

function updateCharts(revenue) {
    const statusCounts = {}; db.cars.forEach(c => statusCounts[c.status] = (statusCounts[c.status] || 0) + 1);
    const fuelCounts = {}; db.cars.forEach(c => fuelCounts[c.fuel_type] = (fuelCounts[c.fuel_type] || 0) + 1);
    const brandCounts = {}; db.cars.forEach(c => brandCounts[c.brand] = (brandCounts[c.brand] || 0) + 1);
    const prices = db.cars.map(c => c.price);
    const ranges = { 'Economy': 0, 'Luxury': 0, 'Super': 0 };
    prices.forEach(p => { if(p < 100000) ranges['Economy']++; else if(p <= 300000) ranges['Luxury']++; else ranges['Super']++; });
    const scatterData = db.cars.map(c => ({ x: c.year, y: c.price }));
    const revenueData = [150000, 280000, 420000, revenue];

    createChart('chartDoughnut', 'doughnut', Object.keys(statusCounts), Object.values(statusCounts), ['#06b6d4', '#ef4444', '#f59e0b']);
    createChart('chartPie', 'pie', Object.keys(fuelCounts), Object.values(fuelCounts), ['#a855f7', '#3b82f6', '#10b981']);
    createChart('chartRadar', 'bar', Object.keys(brandCounts), Object.values(brandCounts), '#06b6d4');
    
    destroyChart('chartLine'); 
    charts['chartLine'] = new Chart(document.getElementById('chartLine'), { 
        type: 'line', data: { labels: ['Jan', 'Feb', 'Mar', 'Apr'], datasets: [{ label: 'Revenue', data: revenueData, borderColor: '#a855f7', tension: 0.4, fill: true, backgroundColor: 'rgba(168, 85, 247, 0.1)' }] }, options: commonOptions() 
    });
    destroyChart('chartHistogram'); 
    charts['chartHistogram'] = new Chart(document.getElementById('chartHistogram'), { 
        type: 'bar', data: { labels: Object.keys(ranges), datasets: [{ label: 'Count', data: Object.values(ranges), backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'], borderRadius: 4 }] }, options: commonOptions() 
    });
    destroyChart('chartScatter'); 
    charts['chartScatter'] = new Chart(document.getElementById('chartScatter'), { 
        type: 'scatter', data: { datasets: [{ label: 'Price vs Year', data: scatterData, backgroundColor: '#06b6d4' }] }, options: { ...commonOptions(), scales: { x: { type: 'linear', position: 'bottom', grid: {color: '#334155'} }, y: { grid: {color: '#334155'} } } } 
    });
}

function createChart(id, type, labels, data, colors) { 
    destroyChart(id); 
    const ctx = document.getElementById(id);
    if(ctx) charts[id] = new Chart(ctx, { type: type, data: { labels: labels, datasets: [{ data: data, backgroundColor: colors, borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: {size: 10} } } } } }); 
}
function destroyChart(id) { if(charts[id]) charts[id].destroy(); }
function commonOptions() { return { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }, x: { ticks: { color: '#94a3b8' }, grid: { display: false } } } }; }

// --- 6. WINDOW ACTIONS ---
//Controls the visibility of UI elements (tabs, modals, sidebar).
window.switchTab = function(tabId, btn) { 
    document.querySelectorAll('.page-section').forEach(el => el.classList.add('hidden')); 
    const target = document.getElementById(tabId + '-section');
    if(target) target.classList.remove('hidden');
    if(btn) { document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active')); btn.classList.add('active'); } 
    const sidebar = document.getElementById('sidebar'); if(sidebar && !sidebar.classList.contains('-translate-x-full')) toggleSidebar(); 
};
window.toggleSidebar = function() { 
    const sidebar = document.getElementById('sidebar'); 
    const overlay = document.getElementById('overlay');
    if(sidebar) sidebar.classList.toggle('-translate-x-full'); 
    if(overlay) overlay.classList.toggle('hidden'); 
};
window.openModal = function(id) { document.getElementById(id).classList.remove('hidden'); };
window.closeModal = function(id) { document.getElementById(id).classList.add('hidden'); };

window.changeCarPage = function(dir) { carState.page += dir; if (carState.page < 1) carState.page = 1; renderCars(); };
window.sortCars = function(col) { if (carState.sortCol === col) carState.sortAsc = !carState.sortAsc; else { carState.sortCol = col; carState.sortAsc = true; } renderCars(); };
window.deleteItem = function(collection, id) { if(confirm('Delete?')) { db[collection] = db[collection].filter(i => i.id !== id); renderAll(); } };
window.cycleOrderStatus = function(id) { 
    const order = db.orders.find(o => o.id === id); if(!order) return; 
    const stages = ['Pending', 'Processing', 'Completed']; 
    order.status = stages[(stages.indexOf(order.status) + 1) % stages.length]; 
    renderAll(); 
};

window.exportToPDF = function() { const { jsPDF } = window.jspdf; const doc = new jsPDF(); doc.text("Inventory", 14, 22); const rows = db.cars.map(c => [c.brand, c.model, c.year, c.price]); doc.autoTable({ head: [["Brand", "Model", "Year", "Price"]], body: rows, startY: 30 }); doc.save("report.pdf"); };
window.exportToCSV = function() { const rows = [["ID", "Brand", "Model", "Year", "Price", "Status"]]; db.cars.forEach(c => rows.push([c.id, c.brand, c.model, c.year, c.price, c.status])); const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n"); const link = document.createElement("a"); link.setAttribute("href", encodeURI(csvContent)); link.setAttribute("download", "inventory.csv"); document.body.appendChild(link); link.click(); };

window.viewDetails = function(id) {
    currentDetailItem = db.cars.find(c => c.id === id); if(!currentDetailItem) return;
    document.getElementById('detail-title').innerText = `${currentDetailItem.brand} ${currentDetailItem.model}`;
    document.getElementById('detail-year').innerText = currentDetailItem.year; 
    document.getElementById('detail-fuel').innerText = currentDetailItem.fuel_type;
    document.getElementById('detail-price').innerText = `$${currentDetailItem.price.toLocaleString()}`; 
    document.getElementById('detail-status').innerText = currentDetailItem.status;
    document.getElementById('detail-img').src = currentDetailItem.image_url || 'https://via.placeholder.com/400';
    document.querySelectorAll('.page-section').forEach(el => el.classList.add('hidden')); 
    document.getElementById('details-view').classList.remove('hidden');
};
window.exportSinglePDF = function() { const { jsPDF } = window.jspdf; const doc = new jsPDF(); doc.text(`Tech Sheet: ${currentDetailItem.brand} ${currentDetailItem.model}`, 14, 20); doc.save('spec-sheet.pdf'); };

// --- 7. FORM HANDLING ---
//CRUD Logic
function handleSave(e, collection, modalId, renderFn) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = formData.get('id'); 
    const data = Object.fromEntries(formData.entries());
    ['price', 'year', 'total_spent', 'sales_count', 'cost', 'car_id', 'client_id', 'amount'].forEach(k => { if(data[k]) data[k] = parseFloat(data[k]); });

    if (id) {
        const index = db[collection].findIndex(x => x.id == id);
        if (index !== -1) db[collection][index] = { ...db[collection][index], ...data };
    } else {
        db[collection].push({ id: Date.now(), ...data });
    }
    renderFn(); renderDashboard(); closeModal(modalId); e.target.reset(); 
}

function fillForm(prefix, obj) {
    document.getElementById(prefix + '-id').value = obj.id;
    for (const key in obj) {
        const el = document.getElementById(prefix + '-' + key);
        if(el) el.value = obj[key];
    }
    if(prefix === 'car') {
        if(document.getElementById('car-image')) document.getElementById('car-image').value = obj.image_url;
        if(document.getElementById('car-fuel')) document.getElementById('car-fuel').value = obj.fuel_type;
    }
    if(prefix === 'order') {
        if(document.getElementById('order-car-id')) document.getElementById('order-car-id').value = obj.car_id;
        if(document.getElementById('order-client-id')) document.getElementById('order-client-id').value = obj.client_id;
    }
    if(prefix === 'client' && document.getElementById('client-spent')) document.getElementById('client-spent').value = obj.total_spent;
    if(prefix === 'employee' && document.getElementById('employee-sales')) document.getElementById('employee-sales').value = obj.sales_count;
}

// Prepare Functions
window.prepareAddCar = function() { document.getElementById('car-form').reset(); document.getElementById('car-id').value = ''; document.getElementById('car-modal-title').innerText='Add New Car'; openModal('car-modal'); };
window.editCar = function(id) { const c = db.cars.find(x => x.id === id); fillForm('car', c); document.getElementById('car-modal-title').innerText='Edit Car'; openModal('car-modal'); };

window.prepareAddClient = function() { document.getElementById('client-form').reset(); document.getElementById('client-id').value = ''; document.getElementById('client-modal-title').innerText='Add Client'; openModal('client-modal'); };
window.editClient = function(id) { const c = db.clients.find(x => x.id === id); fillForm('client', c); document.getElementById('client-modal-title').innerText='Edit Client'; openModal('client-modal'); };

window.prepareAddEmployee = function() { document.getElementById('employee-form').reset(); document.getElementById('employee-id').value = ''; document.getElementById('employee-modal-title').innerText='Add Employee'; openModal('employee-modal'); };
window.editEmployee = function(id) { const c = db.employees.find(x => x.id === id); fillForm('employee', c); document.getElementById('employee-modal-title').innerText='Edit Employee'; openModal('employee-modal'); };

window.prepareAddService = function() { document.getElementById('service-form').reset(); document.getElementById('service-id').value = ''; document.getElementById('service-modal-title').innerText='Add Service'; openModal('service-modal'); };
window.editService = function(id) { const c = db.services.find(x => x.id === id); fillForm('service', c); document.getElementById('service-modal-title').innerText='Edit Service'; openModal('service-modal'); };

// Order Logic
window.prepareAddOrder = function() { 
    populateOrderDropdowns(); 
    document.getElementById('order-form').reset(); document.getElementById('order-id').value = ''; 
    document.getElementById('order-modal-title').innerText='Add Order'; openModal('order-modal'); 
};
window.editOrder = function(id) {
    const o = db.orders.find(x => x.id === id);
    populateOrderDropdowns();
    fillForm('order', o);
    document.getElementById('order-modal-title').innerText='Edit Order'; openModal('order-modal');
};

function populateOrderDropdowns() {
    const carSelect = document.getElementById('order-car-id');
    const clientSelect = document.getElementById('order-client-id');
    if(carSelect) carSelect.innerHTML = db.cars.map(c => `<option value="${c.id}">${c.brand} ${c.model}</option>`).join('');
    if(clientSelect) clientSelect.innerHTML = db.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}