// Precision HVAC NorCal - Interactive Features

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeEligibilityMap();
    initializeSavingsCalculator();
    initializeTestimonialsCarousel();
    initializeFormHandlers();
});

// Eligibility Map with Leaflet
let eligibilityMap;
let currentMarker;

function initializeEligibilityMap() {
    // Initialize the map centered on Bay Area
    eligibilityMap = L.map('eligibility-map').setView([37.7749, -122.4194], 10);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(eligibilityMap);

    // Bay Area service boundaries (approximate)
    const bayAreaBounds = [
        [37.2, -122.8],  // Southwest corner
        [38.2, -121.5]   // Northeast corner
    ];

    // Add Bay Area service area overlay
    const serviceArea = L.rectangle(bayAreaBounds, {
        color: '#28a745',
        fillColor: '#28a745',
        fillOpacity: 0.1,
        weight: 2
    }).addTo(eligibilityMap);

    serviceArea.bindPopup('<strong>Precision HVAC NorCal Service Area</strong><br>We serve the entire Bay Area!');

    // Address search functionality
    const addressInput = document.getElementById('address-search');
    const checkButton = document.getElementById('check-eligibility');

    checkButton.addEventListener('click', function() {
        const address = addressInput.value.trim();
        if (address) {
            checkAddressEligibility(address);
        }
    });

    addressInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const address = addressInput.value.trim();
            if (address) {
                checkAddressEligibility(address);
            }
        }
    });
}

function checkAddressEligibility(address) {
    // Simple geocoding simulation (in real app, use a geocoding service)
    // For demo purposes, we'll simulate Bay Area addresses
    const bayAreaCities = [
        'san francisco', 'oakland', 'berkeley', 'san jose', 'palo alto', 
        'mountain view', 'fremont', 'hayward', 'sunnyvale', 'santa clara',
        'richmond', 'vallejo', 'concord', 'antioch', 'livermore', 'pleasanton'
    ];

    const addressLower = address.toLowerCase();
    let isEligible = false;
    let lat = 37.7749;
    let lng = -122.4194;

    // Check if address contains Bay Area city names
    for (let city of bayAreaCities) {
        if (addressLower.includes(city)) {
            isEligible = true;
            // Set approximate coordinates based on city
            switch (city) {
                case 'oakland':
                    lat = 37.8044; lng = -122.2712; break;
                case 'berkeley':
                    lat = 37.8715; lng = -122.2730; break;
                case 'san jose':
                    lat = 37.3382; lng = -121.8863; break;
                case 'palo alto':
                    lat = 37.4419; lng = -122.1430; break;
                default:
                    lat = 37.7749; lng = -122.4194; // SF default
            }
            break;
        }
    }

    // Update map with location
    if (currentMarker) {
        eligibilityMap.removeLayer(currentMarker);
    }

    currentMarker = L.marker([lat, lng]).addTo(eligibilityMap);
    eligibilityMap.setView([lat, lng], 14);

    // Update eligibility results
    updateEligibilityResults(isEligible, address);
}

function updateEligibilityResults(isEligible, address) {
    const statusElement = document.getElementById('eligibility-status');
    const rebateInfo = document.getElementById('rebate-info');

    if (isEligible) {
        statusElement.innerHTML = `<span style="color: #28a745; font-weight: bold;">✓ ELIGIBLE</span> - We serve your area!`;
        rebateInfo.innerHTML = `
            <h5>Available Rebates & Incentives:</h5>
            <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
                <li>PG&E Heat Pump Rebate: Up to $3,000</li>
                <li>TECH Clean California: Up to $3,000</li>
                <li>Federal Tax Credit: Up to 30%</li>
                <li>BAAQMD Incentives: Up to $1,500</li>
            </ul>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">
                <button class="cta-button" style="font-size: 14px; padding: 8px 16px;" onclick="window.location.href='manual-j-assessment.html'">Get Full Assessment</button>
                <button class="cta-button" style="font-size: 14px; padding: 8px 16px; background: #28a745;" onclick="document.getElementById('contact').scrollIntoView({behavior: 'smooth'})">Quick Quote</button>
            </div>
        `;
        currentMarker.bindPopup(`
            <div style="text-align: center;">
                <strong>${address}</strong><br>
                <span style="color: #28a745;">✓ Eligible for Service</span><br>
                <small>Estimated rebates: $5,000+</small><br>
                <button onclick="window.location.href='manual-j-assessment.html'" style="margin-top: 8px; padding: 4px 8px; background: #2c5282; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Full Manual J Assessment</button>
            </div>
        `).openPopup();
    } else {
        statusElement.innerHTML = `<span style="color: #dc3545; font-weight: bold;">✗ Outside Service Area</span>`;
        rebateInfo.innerHTML = `
            <p style="color: #666; font-size: 14px;">
                This address appears to be outside our current service area. 
                <a href="#contact" style="color: #007bff;">Contact us</a> to discuss options.
            </p>
        `;
        if (currentMarker) {
            currentMarker.bindPopup(`
                <div style="text-align: center;">
                    <strong>${address}</strong><br>
                    <span style="color: #dc3545;">Outside Service Area</span><br>
                    <small>Contact us for availability</small>
                </div>
            `).openPopup();
        }
    }
}

// Savings Calculator
function initializeSavingsCalculator() {
    const calculateButton = document.getElementById('calculate-savings');
    
    calculateButton.addEventListener('click', function() {
        const homeSize = parseInt(document.getElementById('home-size').value) || 0;
        const gasBill = parseInt(document.getElementById('gas-bill').value) || 0;
        const electricBill = parseInt(document.getElementById('electric-bill').value) || 0;

        if (homeSize > 0 && gasBill > 0) {
            calculateSavings(homeSize, gasBill, electricBill);
        } else {
            alert('Please fill in all fields to calculate savings.');
        }
    });
}

function calculateSavings(homeSize, gasBill, electricBill) {
    // Simplified savings calculation
    // In reality, this would use more sophisticated algorithms
    
    // Estimate annual gas costs
    const annualGasCost = gasBill * 12;
    
    // Estimate heat pump efficiency savings (30-50% typical)
    const efficiencySavings = annualGasCost * 0.4; // 40% savings
    
    // Estimate available rebates based on home size
    let totalRebates = 3000; // Base PG&E rebate
    if (homeSize > 1500) totalRebates += 2000; // Additional for larger homes
    if (homeSize > 2500) totalRebates += 1500; // Even more for very large homes
    
    // Add federal tax credit (30% of system cost, estimated)
    const estimatedSystemCost = homeSize * 8; // Rough estimate: $8/sq ft
    const federalTaxCredit = Math.min(estimatedSystemCost * 0.3, 6000); // Cap at $6k
    totalRebates += federalTaxCredit;

    // Update display
    document.getElementById('annual-savings').textContent = `$${efficiencySavings.toLocaleString()}`;
    document.getElementById('available-rebates').textContent = `$${totalRebates.toLocaleString()}`;
}

// Testimonials Carousel
let currentTestimonial = 0;

function initializeTestimonialsCarousel() {
    const track = document.getElementById('testimonial-track');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const testimonials = document.querySelectorAll('.testimonial-card');

    if (testimonials.length === 0) return;

    prevBtn.addEventListener('click', function() {
        currentTestimonial = currentTestimonial > 0 ? currentTestimonial - 1 : testimonials.length - 1;
        updateCarousel();
    });

    nextBtn.addEventListener('click', function() {
        currentTestimonial = currentTestimonial < testimonials.length - 1 ? currentTestimonial + 1 : 0;
        updateCarousel();
    });

    function updateCarousel() {
        const translateX = -currentTestimonial * 100;
        track.style.transform = `translateX(${translateX}%)`;
    }

    // Auto-advance carousel every 5 seconds
    setInterval(function() {
        currentTestimonial = currentTestimonial < testimonials.length - 1 ? currentTestimonial + 1 : 0;
        updateCarousel();
    }, 5000);
}

// Form Handlers
function initializeFormHandlers() {
    // Contact form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            
            // Simulate form submission
            const submitBtn = contactForm.querySelector('.form-submit-btn');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
            
            setTimeout(function() {
                alert('Thank you for your inquiry! We will contact you within 24 hours to schedule your free consultation.');
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }

    // CTA button handlers
    document.querySelectorAll('.cta-primary, .cta-button').forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.textContent.includes('Consultation') || this.textContent.includes('Quote')) {
                e.preventDefault();
                document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Phone number click-to-call
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', function() {
            // Track phone call in analytics (placeholder)
            console.log('Phone call initiated:', this.href);
        });
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.benefit-card, .service-card, .testimonial-card');
    animateElements.forEach(el => observer.observe(el));
});