// API Configuration
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : '/api';

// Authentication
const loginForm = document.getElementById('loginForm');
const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const logoutBtn = document.getElementById('logoutBtn');

// Check if already logged in
if (localStorage.getItem('isAdminLoggedIn') === 'true') {
    showDashboard();
}

// Login Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            localStorage.setItem('isAdminLoggedIn', 'true');
            showDashboard();
        } else {
            alert('Username atau password salah!');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Terjadi kesalahan. Coba lagi.');
    } finally {
        submitBtn.textContent = 'Login';
        submitBtn.disabled = false;
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('isAdminLoggedIn');
    loginScreen.style.display = 'flex';
    dashboard.style.display = 'none';
});

function showDashboard() {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'grid';
    loadDashboardData();
}

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.content-section');
const pageTitle = document.getElementById('pageTitle');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionName = item.getAttribute('data-section');
        
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        sections.forEach(section => section.style.display = 'none');
        const targetSection = document.getElementById(`${sectionName}Section`);
        if (targetSection) targetSection.style.display = 'block';
        
        const titles = {
            'overview': 'Dashboard Overview',
            'portfolio': 'Manage Portfolio',
            'testimonials': 'Manage Testimonials',
            'messages': 'Contact Messages',
            'invoices': 'Manage Invoices'
        };
        pageTitle.textContent = titles[sectionName] || 'Dashboard';
    });
});

// Load all data
async function loadDashboardData() {
    await Promise.all([
        loadStats(),
        loadRecentMessages(),
        loadPortfolioTable(),
        loadTestimonialsList(),
        loadMessagesList(),
        loadInvoicesTable()
    ]);
}

// Stats
async function loadStats() {
    try {
        const [p, t, m] = await Promise.all([
            fetch(`${API_URL}/portfolio`),
            fetch(`${API_URL}/testimonials`),
            fetch(`${API_URL}/messages`)
        ]);
        
        const portfolio = await p.json();
        const testimonials = await t.json();
        const messages = await m.json();
        
        document.getElementById('totalProjects').textContent = portfolio.success ? portfolio.data.length : 0;
        document.getElementById('totalTestimonials').textContent = testimonials.success ? testimonials.data.length : 0;
        document.getElementById('totalMessages').textContent = messages.success ? messages.data.length : 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Recent Messages
async function loadRecentMessages() {
    const container = document.getElementById('recentMessages');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/messages`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            container.innerHTML = result.data.slice(0, 5).map(msg => `
                <div class="activity-item">
                    <div class="activity-meta">${new Date(msg.createdAt).toLocaleDateString('id-ID')}</div>
                    <div class="activity-text"><strong>${msg.name}</strong> - ${msg.service}</div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div style="text-align: center; padding: 2rem;">Belum ada pesan</div>';
        }
    } catch (error) {
        console.error(error);
    }
}

// Portfolio Management
let currentEditingPortfolio = null;

async function loadPortfolioTable() {
    const tbody = document.getElementById('portfolioTableBody');
    if (!tbody) return;
    
    try {
        const response = await fetch(`${API_URL}/portfolio`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            tbody.innerHTML = result.data.map(item => `
                <tr>
                    <td>${item._id.substring(0, 8)}...</td>
                    <td>${item.title}</td>
                    <td>${item.category.replace('-', ' ')}</td>
                    <td><img src="${item.image}" class="table-image"></td>
                    <td class="table-actions">
                        <button class="btn btn-small" onclick="editPortfolio('${item._id}')">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="deletePortfolio('${item._id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem">Belum ada portfolio</td></tr>';
        }
    } catch (error) {
        console.error(error);
    }
}

document.getElementById('addPortfolioBtn').addEventListener('click', () => {
    currentEditingPortfolio = null;
    document.getElementById('portfolioModalTitle').textContent = 'Add New Project';
    document.getElementById('portfolioForm').reset();
    document.getElementById('portfolioModal').classList.add('active');
});

document.getElementById('portfolioForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        title: document.getElementById('portfolioTitle').value,
        category: document.getElementById('portfolioCategory').value,
        image: document.getElementById('portfolioImage').value,
        client: document.getElementById('portfolioClient').value,
        date: document.getElementById('portfolioDate').value,
        location: document.getElementById('portfolioLocation').value,
        description: document.getElementById('portfolioDescription').value
    };
    
    try {
        const url = currentEditingPortfolio ? `${API_URL}/portfolio/${currentEditingPortfolio}` : `${API_URL}/portfolio`;
        const method = currentEditingPortfolio ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (result.success) {
            alert('Portfolio saved!');
            closeModal('portfolioModal');
            loadPortfolioTable();
            loadStats();
        }
    } catch (error) {
        console.error(error);
        alert('Failed to save');
    }
});

async function editPortfolio(id) {
    try {
        const response = await fetch(`${API_URL}/portfolio/${id}`);
        const result = await response.json();
        
        if (result.success) {
            currentEditingPortfolio = id;
            const item = result.data;
            
            document.getElementById('portfolioModalTitle').textContent = 'Edit Project';
            document.getElementById('portfolioTitle').value = item.title;
            document.getElementById('portfolioCategory').value = item.category;
            document.getElementById('portfolioImage').value = item.image;
            document.getElementById('portfolioClient').value = item.client || '';
            document.getElementById('portfolioDate').value = item.date || '';
            document.getElementById('portfolioLocation').value = item.location || '';
            document.getElementById('portfolioDescription').value = item.description || '';
            
            document.getElementById('portfolioModal').classList.add('active');
        }
    } catch (error) {
        console.error(error);
    }
}

async function deletePortfolio(id) {
    if (!confirm('Yakin hapus?')) return;
    try {
        const response = await fetch(`${API_URL}/portfolio/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            alert('Deleted!');
            loadPortfolioTable();
            loadStats();
        }
    } catch (error) {
        console.error(error);
    }
}

// Testimonials Management
let currentEditingTestimonial = null;

async function loadTestimonialsList() {
    const container = document.getElementById('testimonialsList');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/testimonials`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            container.innerHTML = result.data.map(item => `
                <div class="testimonial-item">
                    <div class="testimonial-actions">
                        <button class="btn btn-small" onclick="editTestimonial('${item._id}')">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="deleteTestimonial('${item._id}')">Delete</button>
                    </div>
                    <p class="testimonial-text">"${item.text}"</p>
                    <div class="testimonial-author">${item.author}</div>
                    <div class="testimonial-company">${item.company}</div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div style="text-align:center;padding:4rem">Belum ada testimonial</div>';
        }
    } catch (error) {
        console.error(error);
    }
}

document.getElementById('addTestimonialBtn').addEventListener('click', () => {
    currentEditingTestimonial = null;
    document.getElementById('testimonialModalTitle').textContent = 'Add Testimonial';
    document.getElementById('testimonialForm').reset();
    document.getElementById('testimonialModal').classList.add('active');
});

document.getElementById('testimonialForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        text: document.getElementById('testimonialText').value,
        author: document.getElementById('testimonialAuthor').value,
        company: document.getElementById('testimonialCompany').value
    };
    
    try {
        const url = currentEditingTestimonial ? `${API_URL}/testimonials/${currentEditingTestimonial}` : `${API_URL}/testimonials`;
        const method = currentEditingTestimonial ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (result.success) {
            alert('Testimonial saved!');
            closeModal('testimonialModal');
            loadTestimonialsList();
            loadStats();
        }
    } catch (error) {
        console.error(error);
    }
});

async function editTestimonial(id) {
    try {
        const response = await fetch(`${API_URL}/testimonials`);
        const result = await response.json();
        
        if (result.success) {
            const item = result.data.find(t => t._id === id);
            currentEditingTestimonial = id;
            
            document.getElementById('testimonialModalTitle').textContent = 'Edit Testimonial';
            document.getElementById('testimonialText').value = item.text;
            document.getElementById('testimonialAuthor').value = item.author;
            document.getElementById('testimonialCompany').value = item.company;
            
            document.getElementById('testimonialModal').classList.add('active');
        }
    } catch (error) {
        console.error(error);
    }
}

async function deleteTestimonial(id) {
    if (!confirm('Yakin hapus?')) return;
    try {
        const response = await fetch(`${API_URL}/testimonials/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            alert('Deleted!');
            loadTestimonialsList();
            loadStats();
        }
    } catch (error) {
        console.error(error);
    }
}

// Messages Management
async function loadMessagesList() {
    const container = document.getElementById('messagesList');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/messages`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            container.innerHTML = result.data.map(msg => `
                <div class="message-card">
                    <div class="message-header">
                        <div class="message-info">
                            <h3>${msg.name}</h3>
                            <div class="message-meta">${msg.email} • ${new Date(msg.createdAt).toLocaleDateString('id-ID')}</div>
                        </div>
                        <span class="message-service">${msg.service}</span>
                    </div>
                    <div class="message-body"><p>${msg.message}</p></div>
                    <div class="message-actions">
                        <button class="btn btn-small btn-danger" onclick="deleteMessage('${msg._id}')">Delete</button>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div style="text-align:center;padding:4rem">Belum ada pesan</div>';
        }
    } catch (error) {
        console.error(error);
    }
}

async function deleteMessage(id) {
    if (!confirm('Yakin hapus?')) return;
    try {
        const response = await fetch(`${API_URL}/messages/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            alert('Deleted!');
            loadMessagesList();
            loadStats();
            loadRecentMessages();
        }
    } catch (error) {
        console.error(error);
    }
}

// Modal Controls
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('.modal').classList.remove('active');
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Global functions
window.editPortfolio = editPortfolio;
window.deletePortfolio = deletePortfolio;
window.editTestimonial = editTestimonial;
window.deleteTestimonial = deleteTestimonial;
window.deleteMessage = deleteMessage;

// ============= INVOICES MANAGEMENT =============

let currentEditingInvoice = null;

async function loadInvoicesTable() {
    const tbody = document.getElementById('invoicesTableBody');
    if (!tbody) return;
    
    try {
        const response = await fetch(`${API_URL}/invoices`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            tbody.innerHTML = result.data.map(invoice => `
                <tr>
                    <td><strong>INV-${invoice.invoiceNumber}</strong></td>
                    <td>${invoice.clientName}</td>
                    <td>${invoice.projectName}</td>
                    <td>Rp ${formatCurrency(invoice.total)}</td>
                    <td><span class="invoice-status status-${invoice.status}">${invoice.status}</span></td>
                    <td>${new Date(invoice.invoiceDate).toLocaleDateString('id-ID')}</td>
                    <td class="table-actions">
                        <button class="btn btn-small" onclick="viewInvoice('${invoice._id}')">View</button>
                        <button class="btn btn-small" onclick="editInvoice('${invoice._id}')">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="deleteInvoice('${invoice._id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem">Belum ada invoice</td></tr>';
        }
    } catch (error) {
        console.error(error);
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID').format(amount);
}

document.getElementById('addInvoiceBtn').addEventListener('click', () => {
    currentEditingInvoice = null;
    document.getElementById('invoiceModalTitle').textContent = 'Create Invoice';
    document.getElementById('invoiceForm').reset();
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    document.getElementById('invoiceDueDate').value = dueDate.toISOString().split('T')[0];
    
    // Reset items to one
    const itemsContainer = document.getElementById('invoiceItems');
    itemsContainer.innerHTML = `
        <div class="invoice-item">
            <div class="invoice-item-grid">
                <div class="form-group">
                    <label>Description *</label>
                    <input type="text" class="item-description" required>
                </div>
                <div class="form-group">
                    <label>Quantity *</label>
                    <input type="number" class="item-quantity" min="1" value="1" required>
                </div>
                <div class="form-group">
                    <label>Price (IDR) *</label>
                    <input type="number" class="item-price" min="0" step="1000" required>
                </div>
                <div class="form-group">
                    <label>Amount</label>
                    <input type="text" class="item-amount" readonly>
                </div>
            </div>
        </div>
    `;
    
    calculateInvoiceTotal();
    document.getElementById('invoiceModal').classList.add('active');
});

// Add invoice item
document.getElementById('addItemBtn').addEventListener('click', () => {
    const itemsContainer = document.getElementById('invoiceItems');
    const newItem = document.createElement('div');
    newItem.className = 'invoice-item';
    newItem.innerHTML = `
        <button type="button" class="remove-item-btn" onclick="this.closest('.invoice-item').remove(); calculateInvoiceTotal()">×</button>
        <div class="invoice-item-grid">
            <div class="form-group">
                <label>Description *</label>
                <input type="text" class="item-description" required>
            </div>
            <div class="form-group">
                <label>Quantity *</label>
                <input type="number" class="item-quantity" min="1" value="1" required>
            </div>
            <div class="form-group">
                <label>Price (IDR) *</label>
                <input type="number" class="item-price" min="0" step="1000" required>
            </div>
            <div class="form-group">
                <label>Amount</label>
                <input type="text" class="item-amount" readonly>
            </div>
        </div>
    `;
    itemsContainer.appendChild(newItem);
    attachItemCalculators();
});

// Calculate item and total
function attachItemCalculators() {
    document.querySelectorAll('.invoice-item').forEach(item => {
        const qty = item.querySelector('.item-quantity');
        const price = item.querySelector('.item-price');
        const amount = item.querySelector('.item-amount');
        
        const calc = () => {
            const total = (parseFloat(qty.value) || 0) * (parseFloat(price.value) || 0);
            amount.value = 'Rp ' + formatCurrency(total);
            calculateInvoiceTotal();
        };
        
        qty.removeEventListener('input', calc);
        price.removeEventListener('input', calc);
        qty.addEventListener('input', calc);
        price.addEventListener('input', calc);
    });
}

function calculateInvoiceTotal() {
    let subtotal = 0;
    
    document.querySelectorAll('.invoice-item').forEach(item => {
        const qty = parseFloat(item.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(item.querySelector('.item-price').value) || 0;
        subtotal += qty * price;
    });
    
    const tax = subtotal * 0.11; // 11% PPN
    const total = subtotal + tax;
    
    document.getElementById('invoiceSubtotal').textContent = 'Rp ' + formatCurrency(subtotal);
    document.getElementById('invoiceTax').textContent = 'Rp ' + formatCurrency(tax);
    document.getElementById('invoiceTotal').textContent = 'Rp ' + formatCurrency(total);
}

// Initial attach
document.addEventListener('DOMContentLoaded', () => {
    attachItemCalculators();
});

// Submit invoice
document.getElementById('invoiceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const items = [];
    document.querySelectorAll('.invoice-item').forEach(item => {
        items.push({
            description: item.querySelector('.item-description').value,
            quantity: parseFloat(item.querySelector('.item-quantity').value),
            price: parseFloat(item.querySelector('.item-price').value)
        });
    });
    
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * 0.11;
    const total = subtotal + tax;
    
    const data = {
        clientName: document.getElementById('invoiceClientName').value,
        clientEmail: document.getElementById('invoiceClientEmail').value,
        clientPhone: document.getElementById('invoiceClientPhone').value,
        clientAddress: document.getElementById('invoiceClientAddress').value,
        projectName: document.getElementById('invoiceProject').value,
        invoiceDate: document.getElementById('invoiceDate').value,
        dueDate: document.getElementById('invoiceDueDate').value,
        status: document.getElementById('invoiceStatus').value,
        items: items,
        subtotal: subtotal,
        tax: tax,
        total: total,
        notes: document.getElementById('invoiceNotes').value
    };
    
    try {
        const url = currentEditingInvoice ? `${API_URL}/invoices/${currentEditingInvoice}` : `${API_URL}/invoices`;
        const method = currentEditingInvoice ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (result.success) {
            alert('Invoice saved!');
            closeModal('invoiceModal');
            loadInvoicesTable();
        }
    } catch (error) {
        console.error(error);
        alert('Failed to save invoice');
    }
});

async function viewInvoice(id) {
    try {
        const response = await fetch(`${API_URL}/invoices/${id}`);
        const result = await response.json();
        
        if (result.success) {
            const invoice = result.data;
            const preview = document.getElementById('invoicePreviewContent');
            
            preview.innerHTML = `
                <div class="invoice-header">
                    <div>
                        <div class="invoice-logo">PIXELAB.ID</div>
                        <p>Creative Digital Agency</p>
                        <p>Jakarta, Indonesia</p>
                        <p>Email: hello@pixelab.id</p>
                        <p>Phone: +62 812-3456-7890</p>
                    </div>
                    <div class="invoice-number">
                        <h2>INVOICE</h2>
                        <p><strong>INV-${invoice.invoiceNumber}</strong></p>
                        <p>Date: ${new Date(invoice.invoiceDate).toLocaleDateString('id-ID')}</p>
                        <p>Due: ${new Date(invoice.dueDate).toLocaleDateString('id-ID')}</p>
                        <p><span class="invoice-status status-${invoice.status}">${invoice.status}</span></p>
                    </div>
                </div>
                
                <div class="invoice-info">
                    <div class="info-block">
                        <h4>Bill To:</h4>
                        <p><strong>${invoice.clientName}</strong></p>
                        ${invoice.clientEmail ? `<p>${invoice.clientEmail}</p>` : ''}
                        ${invoice.clientPhone ? `<p>${invoice.clientPhone}</p>` : ''}
                        ${invoice.clientAddress ? `<p>${invoice.clientAddress}</p>` : ''}
                    </div>
                    <div class="info-block">
                        <h4>Project:</h4>
                        <p><strong>${invoice.projectName}</strong></p>
                    </div>
                </div>
                
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items.map(item => `
                            <tr>
                                <td>${item.description}</td>
                                <td>${item.quantity}</td>
                                <td>Rp ${formatCurrency(item.price)}</td>
                                <td>Rp ${formatCurrency(item.quantity * item.price)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" style="text-align: right;">Subtotal:</td>
                            <td>Rp ${formatCurrency(invoice.subtotal)}</td>
                        </tr>
                        <tr>
                            <td colspan="3" style="text-align: right;">Tax (11%):</td>
                            <td>Rp ${formatCurrency(invoice.tax)}</td>
                        </tr>
                        <tr>
                            <td colspan="3" style="text-align: right;"><strong>TOTAL:</strong></td>
                            <td><strong>Rp ${formatCurrency(invoice.total)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
                
                ${invoice.notes ? `
                    <div class="invoice-notes">
                        <h4>Notes:</h4>
                        <p>${invoice.notes}</p>
                    </div>
                ` : ''}
                
                <div class="invoice-footer">
                    <p style="text-align: center; color: #737373;">Thank you for your business!</p>
                </div>
            `;
            
            document.getElementById('invoicePreviewModal').classList.add('active');
        }
    } catch (error) {
        console.error(error);
    }
}

async function editInvoice(id) {
    try {
        const response = await fetch(`${API_URL}/invoices/${id}`);
        const result = await response.json();
        
        if (result.success) {
            currentEditingInvoice = id;
            const invoice = result.data;
            
            document.getElementById('invoiceModalTitle').textContent = 'Edit Invoice';
            document.getElementById('invoiceClientName').value = invoice.clientName;
            document.getElementById('invoiceClientEmail').value = invoice.clientEmail || '';
            document.getElementById('invoiceClientPhone').value = invoice.clientPhone || '';
            document.getElementById('invoiceClientAddress').value = invoice.clientAddress || '';
            document.getElementById('invoiceProject').value = invoice.projectName;
            document.getElementById('invoiceDate').value = invoice.invoiceDate.split('T')[0];
            document.getElementById('invoiceDueDate').value = invoice.dueDate.split('T')[0];
            document.getElementById('invoiceStatus').value = invoice.status;
            document.getElementById('invoiceNotes').value = invoice.notes || '';
            
            // Load items
            const itemsContainer = document.getElementById('invoiceItems');
            itemsContainer.innerHTML = invoice.items.map((item, index) => `
                <div class="invoice-item">
                    ${index > 0 ? '<button type="button" class="remove-item-btn" onclick="this.closest(\'.invoice-item\').remove(); calculateInvoiceTotal()">×</button>' : ''}
                    <div class="invoice-item-grid">
                        <div class="form-group">
                            <label>Description *</label>
                            <input type="text" class="item-description" value="${item.description}" required>
                        </div>
                        <div class="form-group">
                            <label>Quantity *</label>
                            <input type="number" class="item-quantity" min="1" value="${item.quantity}" required>
                        </div>
                        <div class="form-group">
                            <label>Price (IDR) *</label>
                            <input type="number" class="item-price" min="0" step="1000" value="${item.price}" required>
                        </div>
                        <div class="form-group">
                            <label>Amount</label>
                            <input type="text" class="item-amount" readonly>
                        </div>
                    </div>
                </div>
            `).join('');
            
            attachItemCalculators();
            calculateInvoiceTotal();
            document.getElementById('invoiceModal').classList.add('active');
        }
    } catch (error) {
        console.error(error);
    }
}

async function deleteInvoice(id) {
    if (!confirm('Yakin hapus invoice?')) return;
    try {
        const response = await fetch(`${API_URL}/invoices/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            alert('Deleted!');
            loadInvoicesTable();
        }
    } catch (error) {
        console.error(error);
    }
}

function printInvoice() {
    // Add print-specific class to body
    document.body.classList.add('printing-invoice');
    
    // Trigger print
    window.print();
    
    // Remove class after print dialog closes
    setTimeout(() => {
        document.body.classList.remove('printing-invoice');
    }, 1000);
}

async function downloadInvoice() {
    try {
        // Show loading
        const previewContent = document.getElementById('invoicePreviewContent');
        const originalHTML = previewContent.innerHTML;
        
        // Notify user
        const downloadBtn = event.target;
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = '⏳ Generating PDF...';
        downloadBtn.disabled = true;
        
        // Use html2canvas to capture the invoice
        const canvas = await html2canvas(previewContent, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        // Convert to PDF using jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        // Get invoice number from preview
        const invoiceNumber = previewContent.querySelector('.invoice-number strong').textContent;
        
        // Download
        pdf.save(`${invoiceNumber}.pdf`);
        
        // Reset button
        downloadBtn.textContent = originalText;
        downloadBtn.disabled = false;
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try Print instead.');
        event.target.textContent = '📥 Download PDF';
        event.target.disabled = false;
    }
}

async function sendInvoiceEmail() {
    const clientEmail = prompt('Masukkan email client untuk mengirim invoice:');
    
    if (!clientEmail) return;
    
    if (!clientEmail.includes('@')) {
        alert('Email tidak valid!');
        return;
    }
    
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '⏳ Sending...';
    btn.disabled = true;
    
    try {
        // Get invoice data from preview
        const previewContent = document.getElementById('invoicePreviewContent');
        const invoiceNumber = previewContent.querySelector('.invoice-number strong').textContent;
        const total = previewContent.querySelector('.invoice-table tfoot tr:last-child td:last-child').textContent;
        
        // Simulate API call (in production, integrate with email service)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        alert(`✅ Invoice berhasil dikirim ke ${clientEmail}!\n\n📝 Note: Untuk production, integrate dengan:\n- SendGrid\n- Mailgun\n- AWS SES\n- Nodemailer`);
        
    } catch (error) {
        console.error('Error sending email:', error);
        alert('Failed to send email. Please try again.');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// Mobile menu toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        if (sidebarOverlay) {
            sidebarOverlay.classList.toggle('active');
        }
        // Prevent body scroll when sidebar open
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    });
}

// Close sidebar when clicking overlay
if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });
}

// Close sidebar when clicking a nav link (on mobile)
const navLinks = document.querySelectorAll('.nav-item');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 968) {
            sidebar.classList.remove('active');
            if (sidebarOverlay) {
                sidebarOverlay.classList.remove('active');
            }
            document.body.style.overflow = '';
        }
    });
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 968) {
        sidebar.classList.remove('active');
        if (sidebarOverlay) {
            sidebarOverlay.classList.remove('active');
        }
        document.body.style.overflow = '';
    }
});

window.viewInvoice = viewInvoice;
window.editInvoice = editInvoice;
window.deleteInvoice = deleteInvoice;
window.printInvoice = printInvoice;
window.downloadInvoice = downloadInvoice;
window.sendInvoiceEmail = sendInvoiceEmail;
window.calculateInvoiceTotal = calculateInvoiceTotal;

