// Mobile Sidebar
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const menuIcon = menuToggle.querySelector('i');

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    
    // Icon Toggle
    if(sidebar.classList.contains('active')) {
        menuIcon.classList.remove('fa-bars');
        menuIcon.classList.add('fa-times');
    } else {
        menuIcon.classList.remove('fa-times');
        menuIcon.classList.add('fa-bars');
    }
});

// Carousel Logic
const items = document.querySelectorAll('.carousel-item');
const nextBtn = document.querySelector('.next-btn');
const prevBtn = document.querySelector('.prev-btn');
let currentIndex = 0;

function updateCarousel() {
    items.forEach((item, index) => {
        // Reset
        item.classList.remove('active', 'next', 'prev');
        item.style.zIndex = '';
        
        if (index === currentIndex) {
            item.classList.add('active');
        } else if (index === (currentIndex + 1) % items.length) {
            item.classList.add('next');
        } else if (index === (currentIndex - 1 + items.length) % items.length) {
            item.classList.add('prev');
        }
    });
}

if(items.length > 0) {
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % items.length;
        updateCarousel();
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateCarousel();
    });
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        // Mobile: Close menu on click
        if(window.innerWidth <= 968) {
            sidebar.classList.remove('active');
            menuIcon.classList.remove('fa-times');
            menuIcon.classList.add('fa-bars');
        }

        const target = document.querySelector(this.getAttribute('href'));
        if(target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Scroll Active State
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if(pageYOffset >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if(link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});