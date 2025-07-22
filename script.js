// Variables globales
let currentPhotoIndex = 0;
let allPhotos = [];
let modal = null;
let modalImg = null;
let modalCaption = null;

// Inicialización cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Función principal de inicialización
function initializeApp() {
    setupModal();
    setupPhotoGallery();
    setupLazyLoading();
    setupScrollAnimations();
    setupVideoHandling();
    
    // Smooth scroll al cargar
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
}

// Configurar el modal de fotos
function setupModal() {
    modal = document.getElementById('photoModal');
    modalImg = document.getElementById('modalImg');
    modalCaption = document.getElementById('modalCaption');
    
    const closeBtn = document.querySelector('.close');
    
    // Cerrar modal con click en X
    closeBtn.onclick = function() {
        closeModal();
    };
    
    // Cerrar modal con click fuera de la imagen
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    };
    
    // Navegación con teclado
    document.addEventListener('keydown', function(event) {
        if (modal.style.display === 'block') {
            switch(event.key) {
                case 'Escape':
                    closeModal();
                    break;
                case 'ArrowLeft':
                    changePhoto(-1);
                    break;
                case 'ArrowRight':
                    changePhoto(1);
                    break;
            }
        }
    });
}

// Configurar la galería de fotos
function setupPhotoGallery() {
    const photoItems = document.querySelectorAll('.photo-item');
    allPhotos = Array.from(photoItems);
    
    photoItems.forEach((item, index) => {
        const img = item.querySelector('img');
        const overlay = item.querySelector('.photo-overlay');
        const dateElement = overlay.querySelector('.photo-date');
        const captionElement = overlay.querySelector('.photo-caption');
        
        // Click para abrir modal
        item.addEventListener('click', function() {
            openModal(index);
        });
        
        // Hover effects adicionales
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Abrir modal con la foto seleccionada
function openModal(photoIndex) {
    currentPhotoIndex = photoIndex;
    const photoItem = allPhotos[photoIndex];
    const img = photoItem.querySelector('img');
    const overlay = photoItem.querySelector('.photo-overlay');
    const dateElement = overlay.querySelector('.photo-date');
    const captionElement = overlay.querySelector('.photo-caption');
    
    modal.style.display = 'block';
    modalImg.src = img.src;
    modalImg.alt = img.alt;
    
    // Construir caption con fecha y descripción
    const date = dateElement.textContent;
    const caption = captionElement.textContent;
    modalCaption.innerHTML = `<strong>${date}</strong><br>${caption}`;
    
    // Añadir clase para animación
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Cerrar modal
function closeModal() {
    modal.style.display = 'none';
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Cambiar foto en el modal
function changePhoto(direction) {
    currentPhotoIndex += direction;
    
    // Loop circular
    if (currentPhotoIndex >= allPhotos.length) {
        currentPhotoIndex = 0;
    } else if (currentPhotoIndex < 0) {
        currentPhotoIndex = allPhotos.length - 1;
    }
    
    openModal(currentPhotoIndex);
}

// Scroll suave al álbum
function scrollToAlbum() {
    const albumSection = document.getElementById('album');
    albumSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Configurar lazy loading para las imágenes
function setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src; // Esto fuerza la carga
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback para navegadores que no soportan IntersectionObserver
        images.forEach(img => {
            img.classList.add('loaded');
        });
    }
}

// Animaciones de scroll
function setupScrollAnimations() {
    const yearSections = document.querySelectorAll('.year-section');
    
    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        yearSections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(50px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            sectionObserver.observe(section);
        });
    }
}

// Manejo especial para videos
function setupVideoHandling() {
    const videoItems = document.querySelectorAll('.photo-item');
    
    videoItems.forEach(item => {
        const img = item.querySelector('img');
        if (img && img.src.includes('.mp4')) {
            // Crear elemento video para archivos MP4
            const video = document.createElement('video');
            video.src = img.src;
            video.controls = false;
            video.muted = true;
            video.loop = true;
            video.style.width = '100%';
            video.style.height = '300px';
            video.style.objectFit = 'cover';
            video.className = img.className;
            
            // Reemplazar imagen con video
            img.parentNode.replaceChild(video, img);
            
            // Play/pause en hover
            item.addEventListener('mouseenter', () => {
                video.play();
            });
            
            item.addEventListener('mouseleave', () => {
                video.pause();
            });
            
            // Modificar el click handler para videos
            item.addEventListener('click', function(e) {
                e.preventDefault();
                // Para videos, podríamos abrir en modal diferente o en nueva ventana
                showVideoModal(video.src);
            });
        }
    });
}

// Modal especial para videos
function showVideoModal(videoSrc) {
    const videoModal = document.createElement('div');
    videoModal.className = 'modal';
    videoModal.style.display = 'block';
    videoModal.innerHTML = `
        <span class="close" onclick="this.parentNode.remove(); document.body.style.overflow='auto'">&times;</span>
        <video class="modal-content" controls autoplay>
            <source src="${videoSrc}" type="video/mp4">
            Tu navegador no soporta el elemento video.
        </video>
    `;
    
    document.body.appendChild(videoModal);
    document.body.style.overflow = 'hidden';
    
    // Cerrar con click fuera del video
    videoModal.addEventListener('click', function(e) {
        if (e.target === videoModal) {
            videoModal.remove();
            document.body.style.overflow = 'auto';
        }
    });
}

// Función para crear efectos de partículas de corazones
function createHeartParticles() {
    const heartsContainer = document.querySelector('.hearts');
    if (!heartsContainer) return;
    
    setInterval(() => {
        const heart = document.createElement('span');
        heart.textContent = '💕';
        heart.style.position = 'absolute';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = Math.random() * 20 + 10 + 'px';
        heart.style.opacity = '0.7';
        heart.style.pointerEvents = 'none';
        heart.style.animation = 'floatUp 3s linear forwards';
        
        heartsContainer.appendChild(heart);
        
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 3000);
    }, 2000);
}

// Añadir estilos CSS para la animación de corazones flotantes
function addFloatingHeartsCSS() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 0.7;
            }
            100% {
                transform: translateY(-100px) rotate(360deg);
                opacity: 0;
            }
        }
        
        .hearts {
            position: relative;
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);
}

// Función para detectar si es móvil
function isMobile() {
    return window.innerWidth <= 768;
}

// Optimizaciones para móviles
function setupMobileOptimizations() {
    if (isMobile()) {
        // Reducir efectos en móviles para mejor rendimiento
        const style = document.createElement('style');
        style.textContent = `
            .photo-item:hover {
                transform: none !important;
            }
            
            .hero-image:hover {
                transform: none !important;
            }
            
            * {
                animation-duration: 0.3s !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Función para compartir en redes sociales
function shareOnSocialMedia(platform) {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('¡Celebrando 5 años de amor! 💕');
    
    let shareUrl = '';
    
    switch(platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${text}%20${url}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

// Función para descargar una foto
function downloadPhoto(photoElement) {
    const link = document.createElement('a');
    link.href = photoElement.src;
    link.download = photoElement.alt || 'foto-aniversario.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Inicializar efectos adicionales cuando la página esté completamente cargada
window.addEventListener('load', function() {
    addFloatingHeartsCSS();
    createHeartParticles();
    setupMobileOptimizations();
    
    // Añadir clase loaded al body para activar animaciones finales
    document.body.classList.add('loaded');
});

// Manejar resize de ventana
window.addEventListener('resize', function() {
    // Reajustar modal si está abierto
    if (modal && modal.style.display === 'block') {
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.maxWidth = '90%';
            modalContent.style.maxHeight = '80%';
        }
    }
});

// Prevenir scroll del body cuando el modal está abierto
function preventBodyScroll(prevent) {
    if (prevent) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

// Función para crear un slideshow automático (opcional)
function startAutoSlideshow() {
    let slideshowInterval;
    
    function nextSlide() {
        if (modal.style.display === 'block') {
            changePhoto(1);
        }
    }
    
    function startSlideshow() {
        slideshowInterval = setInterval(nextSlide, 5000); // 5 segundos
    }
    
    function stopSlideshow() {
        clearInterval(slideshowInterval);
    }
    
    // Exponer funciones globalmente para uso opcional
    window.startSlideshow = startSlideshow;
    window.stopSlideshow = stopSlideshow;
}

// Inicializar slideshow
startAutoSlideshow();

// Easter egg: corazones al hacer doble click
document.addEventListener('dblclick', function(e) {
    const heart = document.createElement('div');
    heart.textContent = '💖';
    heart.style.position = 'fixed';
    heart.style.left = e.clientX + 'px';
    heart.style.top = e.clientY + 'px';
    heart.style.fontSize = '2rem';
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '9999';
    heart.style.animation = 'floatUp 2s ease-out forwards';
    
    document.body.appendChild(heart);
    
    setTimeout(() => {
        if (heart.parentNode) {
            heart.parentNode.removeChild(heart);
        }
    }, 2000);
});

console.log('💕 ¡Feliz 5to Aniversario! 💕');
console.log('Con amor, desde el código ❤️'); 