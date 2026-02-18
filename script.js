/* --- FUNÇÃO PARA CARREGAR COMPONENTES --- */
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Erro ao carregar ' + filePath);

        const html = await response.text();
        const element = document.getElementById(elementId);

        if (element) {
            // Substitui o placeholder pelo conteúdo real
            element.outerHTML = html;
        }

        // Inicia a lógica JS específica de cada componente APÓS ele existir no DOM
        if (elementId === 'footer-placeholder') {
            iniciarCarrossel();
        }

        if (elementId === 'header-placeholder') {
            iniciarMenuMobile();
        }

    } catch (error) {
        console.error('Erro ao carregar componente:', error);
    }
}

/* --- INICIALIZAÇÃO --- */
document.addEventListener("DOMContentLoaded", () => {
    loadComponent('header-placeholder', 'header.html');
    loadComponent('footer-placeholder', 'footer.html');
    iniciarOutrosScripts();
});


/* --- LÓGICA DO MENU MOBILE --- */
function iniciarMenuMobile() {
    const menuBtn = document.getElementById("menuBtn");
    const closeMenu = document.getElementById("closeMenu");
    const nav = document.getElementById("menuMobile");

    if (menuBtn && closeMenu && nav) {
        menuBtn.addEventListener("click", () => {
            nav.classList.add("ativo");
            document.body.style.overflow = "hidden";
        });

        closeMenu.addEventListener("click", () => {
            nav.classList.remove("ativo");
            document.body.style.overflow = "auto";
        });

        document.querySelectorAll('.navegacao-primaria a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove("ativo");
                document.body.style.overflow = "auto";
            });
        });
    }
}

/* --- LÓGICA DO CARROSSEL --- */
function iniciarCarrossel() {
    const track = document.querySelector('.carousel-track');

    if (track) {
        const slides = Array.from(track.children);
        const nextBtn = document.querySelector('.carousel-btn.next');
        const prevBtn = document.querySelector('.carousel-btn.prev');
        const indicators = document.querySelectorAll('.carousel-indicators span');

        // Se houver imagens, defina a largura baseada na primeira
        let imgWidth = 440;
        if (slides.length > 0) {
            const firstImg = slides[0].querySelector('img');
            if (firstImg) {
                // Se a imagem já carregou, pega a largura, senão espera
                if (firstImg.complete) {
                    imgWidth = firstImg.offsetWidth;
                } else {
                    firstImg.onload = () => { imgWidth = firstImg.offsetWidth; };
                }
            }
        }

        let gap = 22;
        let index = 0;
        const visible = 3;

        function duplicateSlides() {
            // Clona apenas se tiver slides suficientes para não bugar o loop
            if (slides.length >= visible) {
                const cloneNeeded = visible;
                for (let i = 0; i < cloneNeeded; i++) {
                    const clone = slides[i].cloneNode(true);
                    track.appendChild(clone);
                }
            }
        }
        duplicateSlides();

        let total = track.children.length;

        window.addEventListener('resize', () => {
            if (slides[0]) imgWidth = slides[0].querySelector('img').offsetWidth;
        });

        function updateCarousel(animate = true) {
            const offset = index * (imgWidth + gap);
            track.style.transition = animate ? "transform 0.5s ease" : "none";
            track.style.transform = `translateX(-${offset}px)`;
            updateIndicators();
        }

        function updateIndicators() {
            indicators.forEach(i => i.classList.remove("active"));
            // O % slides.length garante que o indicador volte ao inicio
            if (indicators[index % slides.length]) indicators[index % slides.length].classList.add("active");
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                index++;
                if (index > total - visible) {
                    index = 1; // Volta suavemente
                    updateCarousel(false);
                    setTimeout(() => updateCarousel(true), 20); // Pequeno delay para o navegador processar
                } else {
                    updateCarousel(true);
                }
            });
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                index--;
                if (index < 0) {
                    index = total - visible - 1;
                    updateCarousel(false);
                    setTimeout(() => updateCarousel(true), 20);
                } else {
                    updateCarousel(true);
                }
            });
        }

        indicators.forEach(ind => {
            ind.addEventListener("click", () => {
                index = Number(ind.dataset.slide);
                updateCarousel(true);
            });
        });

        // Loop automático
        setInterval(() => {
            nextBtn.click();
        }, 3500);
    }
}

/* --- OUTROS SCRIPTS (Lightbox, Accordion, Scroll) --- */
function iniciarOutrosScripts() {

    // SCROLL REVEAL
    const revealElements = document.querySelectorAll(".scroll-reveal");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    revealElements.forEach(el => observer.observe(el));

    // ACCORDION (Identidade)
    document.querySelectorAll(".identidade-direita .topico").forEach(btn => {
        btn.addEventListener("click", () => {
            const item = btn.parentElement;

            // Acessibilidade: Alternar aria-expanded
            const isExpanded = item.classList.contains("ativo");
            btn.setAttribute("aria-expanded", !isExpanded);

            document.querySelectorAll(".identidade-direita .item").forEach(i => {
                if (i !== item) {
                    i.classList.remove("ativo");
                    i.querySelector('.topico').setAttribute("aria-expanded", "false");
                }
            });
            item.classList.toggle("ativo");
        });
    });

    // LIGHTBOX
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const captionText = document.getElementById('caption');
    const images = document.querySelectorAll('.abrir-lightbox');
    const closeBtn = document.querySelector('.close-lightbox');
    const prevBtnLb = document.querySelector('.nav-btn.prev-btn'); 
    const nextBtnLb = document.querySelector('.nav-btn.next-btn'); 

    if (lightbox) {
        let currentIndex = 0;

        function openModal(index) {
            lightbox.style.display = "flex";
            lightboxImg.src = images[index].src;
            captionText.innerHTML = images[index].alt;
            currentIndex = index;
            document.body.style.overflow = "hidden";
        }

        function closeModal() {
            lightbox.style.display = "none";
            document.body.style.overflow = "auto";
        }

        images.forEach((img, index) => {
            img.addEventListener('click', () => {
                openModal(index);
            });
        });

        closeBtn.addEventListener('click', closeModal);

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeModal();
        });

        // Navegação Lightbox
        if (nextBtnLb) {
            nextBtnLb.addEventListener('click', (e) => {
                e.stopPropagation();
                currentIndex++;
                if (currentIndex >= images.length) currentIndex = 0;
                openModal(currentIndex);
            });
        }

        if (prevBtnLb) {
            prevBtnLb.addEventListener('click', (e) => {
                e.stopPropagation();
                currentIndex--;
                if (currentIndex < 0) currentIndex = images.length - 1;
                openModal(currentIndex);
            });
        }

        document.addEventListener('keydown', (e) => {
            if (lightbox.style.display === "flex") {
                if (e.key === "ArrowLeft" && prevBtnLb) prevBtnLb.click();
                if (e.key === "ArrowRight" && nextBtnLb) nextBtnLb.click();
                if (e.key === "Escape") closeModal();
            }
        });
    }
}