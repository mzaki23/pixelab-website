// API Configuration
const API_URL = window.location.hostname === 'localhost' 
    ? 'https://pixelab-website.vercel.app:3000/api'
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
            'messages': 'Contact Messages'
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
        loadMessagesList()
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