// API Configuration
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'  // Untuk Node.js local server
    : '/api';                       // Production Vercel

// Portfolio Data (akan di-load dari API)
let portfolioData = [];

// Sample Testimonials Data (akan di-load dari API)
let testimonialsData = [];

// Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Close menu when clicking nav links
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Load Portfolio from API
async function loadPortfolio(filter = 'all') {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (!portfolioGrid) return;
    
    try {
        // Show loading state
        portfolioGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 4rem;">Loading...</div>';
        
        const response = await fetch(`${API_URL}/portfolio`);
        const result = await response.json();
        
        if (result.success) {
            portfolioData = result.data;
            
            const filteredData = filter === 'all' 
                ? portfolioData 
                : portfolioData.filter(item => item.category === filter);
            
            if (filteredData.length === 0) {
                portfolioGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: #737373;">No portfolio items found</div>';
                return;
            }
            
            portfolioGrid.innerHTML = filteredData.map(item => `
                <div class="portfolio-item" data-category="${item.category}" onclick="openPortfolioModal('${item._id}')">
                    <img src="${item.image}" alt="${item.title}">
                    <div class="portfolio-overlay">
                        <div class="portfolio-category">${item.category.replace('-', ' ')}</div>
                        <h3 class="portfolio-title">${item.title}</h3>
                    </div>
                </div>
            `).join('');
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
    console.error('Error loading portfolio:', error);
    
    if (!navigator.onLine) {
        portfolioGrid.innerHTML = '<div>No internet connection</div>';
    } else if (error.message.includes('fetch')) {
        portfolioGrid.innerHTML = '<div>Cannot connect to server</div>';
    } else {
        portfolioGrid.innerHTML = '<div>Failed to load. Please try again.</div>';
    }
}
}

// Portfolio Filter
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        // Filter portfolio
        const filter = btn.getAttribute('data-filter');
        loadPortfolio(filter);
    });
});

// Load Testimonials from API
async function loadTestimonials() {
    const testimonialsGrid = document.getElementById('testimonialsGrid');
    if (!testimonialsGrid) return;
    
    try {
        const response = await fetch(`${API_URL}/testimonials`);
        const result = await response.json();
        
        if (result.success) {
            testimonialsData = result.data;
            
            if (testimonialsData.length === 0) {
                testimonialsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: #737373;">No testimonials yet</div>';
                return;
            }
            
            testimonialsGrid.innerHTML = testimonialsData.map(item => `
                <div class="testimonial-card">
                    <p class="testimonial-text">"${item.text}"</p>
                    <div class="testimonial-author">${item.author}</div>
                    <div class="testimonial-company">${item.company}</div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading testimonials:', error);
        testimonialsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: #ef4444;">Failed to load testimonials</div>';
    }
}

// Contact Form Handler - Send to API
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            service: document.getElementById('service').value,
            message: document.getElementById('message').value
        };
        
        try {
            const response = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Terima kasih! Pesan Anda telah dikirim. Kami akan segera menghubungi Anda.');
                contactForm.reset();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi kami via WhatsApp.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Scroll Animation Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for scroll animations
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Active nav link on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPortfolio();
    loadTestimonials();
    setupPortfolioModal();
});

// Portfolio Modal Functions
function setupPortfolioModal() {
    const modal = document.getElementById('portfolioDetailModal');
    const closeBtn = document.querySelector('.portfolio-modal-close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closePortfolioModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closePortfolioModal();
            }
        });
    }
    
    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePortfolioModal();
        }
    });
}

function openPortfolioModal(id) {
    const item = portfolioData.find(p => p._id === id);
    if (!item) return;
    
    const modal = document.getElementById('portfolioDetailModal');
    
    // Populate modal content
    document.getElementById('modalImage').src = item.image;
    document.getElementById('modalImage').alt = item.title;
    document.getElementById('modalCategory').textContent = item.category.replace('-', ' ');
    document.getElementById('modalTitle').textContent = item.title;
    document.getElementById('modalClient').textContent = item.client || 'N/A';
    document.getElementById('modalDate').textContent = item.date || 'N/A';
    document.getElementById('modalLocation').textContent = item.location || 'N/A';
    document.getElementById('modalDescription').textContent = item.description || 'No description available';
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePortfolioModal() {
    const modal = document.getElementById('portfolioDetailModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Make function global for onclick handler
window.openPortfolioModal = openPortfolioModal;