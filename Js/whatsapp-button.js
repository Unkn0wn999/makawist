document.addEventListener('DOMContentLoaded', function() {
    // Crear el botón de WhatsApp
    const whatsappButton = document.createElement('a');
    whatsappButton.href = 'https://wa.me/51932204477';
    whatsappButton.className = 'whatsapp-float';
    whatsappButton.setAttribute('target', '_blank');
    whatsappButton.setAttribute('rel', 'noopener noreferrer');
    whatsappButton.innerHTML = '<i class="bi bi-whatsapp"></i>';
    
    // Verificar si estamos en la página index.html
    const isIndexPage = window.location.pathname.endsWith('index.html') || 
                        window.location.pathname.endsWith('/') || 
                        window.location.pathname.endsWith('/MakawiStoreCix/');
    
    if (isIndexPage) {
        // En index.html, añadir clase especial
        whatsappButton.classList.add('index-page');
        
        // Configurar el observador para detectar cuando se pasa el carousel
        const carousel = document.getElementById('carouselMakawi');
        
        if (carousel) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    // Si el carousel ya no está visible (se ha desplazado hacia arriba)
                    if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
                        whatsappButton.classList.add('visible');
                    } else {
                        whatsappButton.classList.remove('visible');
                    }
                });
            }, { threshold: 0 });
            
            observer.observe(carousel);
        }
    }
    
    // Añadir el botón al body
    document.body.appendChild(whatsappButton);
});