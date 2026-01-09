// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Typing Effect
const textElement = document.getElementById('typing-text');
const texts = ['Scientist', 'Engineer', 'Maker', 'Problem Solver'];
let count = 0;
let index = 0;
let currentText = '';
let letter = '';

(function type() {
    if (count === texts.length) {
        count = 0;
    }
    currentText = texts[count];
    letter = currentText.slice(0, ++index);

    textElement.textContent = letter;

    if (letter.length === currentText.length) {
        count++;
        index = 0;
        setTimeout(type, 2000); // Pause at end of word
    } else {
        setTimeout(type, 100); // Typing speed
    }
})();

// Intersection Observer for sections
const observerOptions = {
    threshold: 0.2
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.6s ease-out';
    observer.observe(section);
});

// Add class for visible state
const style = document.createElement('style');
style.innerHTML = `
  .section.visible {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);


/* --- Voltage Defender Mini-Game --- */
/* --- Magnetic Field Interaction --- */
class MagneticField {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Resize immediately
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Scroll listener for visibility
        window.addEventListener('scroll', () => this.handleScroll());

        this.mouse = { x: -1000, y: -1000 };
        this.particles = [];
        this.particleCount = 150; // Increased count for full screen

        this.initParticles();
        this.initEvents();
        this.animate();

        // Initial check
        this.handleScroll();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        // Re-init particles on drastic resize might be needed, but for now just letting them flow is fine
    }

    handleScroll() {
        const scrollY = window.scrollY;
        const heroHeight = document.getElementById('hero').offsetHeight;

        // Fade in after passing half the hero section
        if (scrollY > heroHeight * 0.5) {
            this.canvas.style.opacity = '1';
        } else {
            this.canvas.style.opacity = '0';
        }
    }

    initParticles() {
        this.particles = [];
        const colors = ['#64ffda', '#ffd700', '#e6f1f8'];

        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                size: Math.random() * 2 + 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                baseX: Math.random() * this.width,
                baseY: Math.random() * this.height,
                density: (Math.random() * 30) + 1
            });
        }
    }

    initEvents() {
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // No need for mouseleave on full screen usually, but can keep for off-window
    }

    update() {
        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];

            // Interaction with mouse
            let dx = this.mouse.x - p.x;
            let dy = this.mouse.y - p.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;

            // Negative distance = repulsion
            const maxDistance = 150;
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * p.density;
            let directionY = forceDirectionY * force * p.density;

            if (distance < maxDistance) {
                // Push away
                p.x -= directionX;
                p.y -= directionY;
            } else {
                // Return to base position (flow back)
                if (p.x !== p.baseX) {
                    let dx = p.x - p.baseX;
                    p.x -= dx / 50;
                }
                if (p.y !== p.baseY) {
                    let dy = p.y - p.baseY;
                    p.y -= dy / 50;
                }
            }

            // Boundaries
            // (Optional if we stick to base positions, but good safety)
        }
    }

    draw() {
        this.ctx.fillStyle = '#0a192f';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw connections
        this.ctx.lineWidth = 0.5;
        for (let a = 0; a < this.particles.length; a++) {
            for (let b = a; b < this.particles.length; b++) {
                let dx = this.particles[a].x - this.particles[b].x;
                let dy = this.particles[a].y - this.particles[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 50) {
                    this.ctx.strokeStyle = `rgba(100, 255, 218, ${1 - distance / 50})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[a].x, this.particles[a].y);
                    this.ctx.lineTo(this.particles[b].x, this.particles[b].y);
                    this.ctx.stroke();
                }
            }
        }

        // Draw particles
        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize
// Initialize
new MagneticField();

/* --- PCB Navigation Interaction --- */
const pcbFlow = document.getElementById('pcb-flow');
const nodes = document.querySelectorAll('.pcb-node');

function updatePCB() {
    let maxHeight = 0;
    let activeIndex = 0;

    // Determine active section
    let current = '';
    const sections = document.querySelectorAll('.section, .hero-section');

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= (sectionTop - 300)) {
            current = section.getAttribute('id');
        }
    });

    // Update nodes
    nodes.forEach((node, index) => {
        node.classList.remove('active');
        if (node.getAttribute('href') === `#${current}`) {
            node.classList.add('active');
            activeIndex = index;
        }
    });

    // Calculate flow height
    // (index / (total - 1)) * 100%
    if (nodes.length > 1) {
        const percentage = (activeIndex / (nodes.length - 1)) * 100;
        pcbFlow.style.height = `${percentage}%`;
    }
}

// Update on scroll
window.addEventListener('scroll', updatePCB);

// Update on click (smooth scroll handled generic above, but update state)
nodes.forEach(node => {
    node.addEventListener('click', () => {
        // slight delay to let smooth scroll start
        setTimeout(updatePCB, 50);
    });
});

// Initial call
updatePCB();


/* --- Dynamic Holo Badge Logic --- */
const holoBadge = document.getElementById('holo-badge');
const skillsSection = document.getElementById('skills');

function checkBadgeVisibility() {
    if (!skillsSection || !holoBadge) return;

    const rect = skillsSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Check if Skills section is significantly in view
    // (Top is visible OR Bottom is visible) within the viewport
    const inView = (rect.top <= windowHeight * 0.7 && rect.bottom >= windowHeight * 0.3);

    if (inView) {
        holoBadge.classList.add('visible');
    } else {
        holoBadge.classList.remove('visible');
    }
}

window.addEventListener('scroll', checkBadgeVisibility);
checkBadgeVisibility(); // Initial check

