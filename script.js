// ============================================
// TIMER DE CONTAGEM REGRESSIVA
// ============================================

function initializeTimer() {
    // Define o tempo de expiração (24 horas a partir de agora)
    const expirationTime = localStorage.getItem('timerExpiration');
    let endTime;

    if (!expirationTime) {
        endTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 horas
        localStorage.setItem('timerExpiration', endTime);
    } else {
        endTime = parseInt(expirationTime);
    }

    function updateTimer() {
        const now = new Date().getTime();
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
            // Timer expirou
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            
            // Opcional: mostrar mensagem ou redirecionar
            console.log('Oferta expirada');
            return;
        }

        // Calcula horas, minutos e segundos
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        // Atualiza o display
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }

    // Atualiza o timer imediatamente
    updateTimer();

    // Atualiza a cada segundo
    setInterval(updateTimer, 1000);
}

// ============================================
// RASTREAMENTO DE SCROLL E ENGAJAMENTO
// ============================================

let scrollPercentage = 0;
let hasScrolled = false;
let hasInteracted = false;

function trackScroll() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;

    scrollPercentage = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);

    if (scrollPercentage > 25 && !hasScrolled) {
        hasScrolled = true;
        recordEvent('page_scroll', { percentage: scrollPercentage });
    }
}

function trackInteraction() {
    if (!hasInteracted) {
        hasInteracted = true;
        recordEvent('user_interaction', { type: 'engagement' });
    }
}

// ============================================
// RASTREAMENTO DE EVENTOS
// ============================================

function recordEvent(eventName, eventData = {}) {
    // Envia dados para analytics (Google Analytics, Pixel, etc.)
    console.log(`Event: ${eventName}`, eventData);

    // Exemplo com Google Analytics (descomente se usar)
    // if (window.gtag) {
    //     gtag('event', eventName, eventData);
    // }

    // Armazena localmente para análise
    const events = JSON.parse(localStorage.getItem('pageEvents') || '[]');
    events.push({
        event: eventName,
        timestamp: new Date().toISOString(),
        data: eventData
    });
    localStorage.setItem('pageEvents', JSON.stringify(events));
}

// ============================================
// BOTÕES CTA
// ============================================

function setupCTAButtons() {
    const ctaButtons = document.querySelectorAll('.cta-button');

    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            recordEvent('cta_clicked', {
                buttonText: this.textContent,
                scrollPercentage: scrollPercentage
            });

            // Simula clique (em produção, redirecionar para checkout)
            handleCTAClick();
        });

        // Rastreia hover
        button.addEventListener('mouseenter', function() {
            recordEvent('cta_hovered', {
                buttonText: this.textContent
            });
        });
    });
}

function handleCTAClick() {
    // Aqui você redireciona para a página de checkout
    // Exemplo: window.location.href = 'https://checkout.seu-site.com/upsell-pintos';
    
    // Para demonstração, mostra um alerta
    alert('Redirecionando para checkout...\n\nEm produção, isso levaria ao seu sistema de pagamento.');
    
    recordEvent('conversion_initiated', {
        product: 'manejo_pintos_upsell',
        timestamp: new Date().toISOString()
    });
}

// ============================================
// EFEITO DE SCROLL PARALLAX LEVE
// ============================================

function initParallax() {
    const heroSection = document.querySelector('.hero');
    
    if (!heroSection) return;

    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        const parallaxSpeed = 0.5;
        
        heroSection.style.backgroundPosition = `0 ${scrollPosition * parallaxSpeed}px`;
    });
}

// ============================================
// DETECÇÃO DE INTENÇÃO DE SAÍDA
// ============================================

function detectExitIntent() {
    let isExitIntentShown = false;

    document.addEventListener('mouseleave', function(e) {
        if (e.clientY <= 0 && !isExitIntentShown && scrollPercentage < 80) {
            isExitIntentShown = true;
            recordEvent('exit_intent_detected', {
                scrollPercentage: scrollPercentage
            });

            // Opcional: mostrar modal de retenção
            // showExitModal();
        }
    });
}

// ============================================
// OTIMIZAÇÕES DE PERFORMANCE
// ============================================

// Lazy loading de imagens
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// ============================================
// DETECÇÃO DE DISPOSITIVO
// ============================================

function detectDevice() {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android/i.test(userAgent) && !/Mobile/i.test(userAgent);

    recordEvent('device_detected', {
        isMobile: isMobile,
        isTablet: isTablet,
        userAgent: userAgent.substring(0, 50)
    });

    return { isMobile, isTablet };
}

// ============================================
// OTIMIZAÇÃO DE CLIQUE EM MOBILE
// ============================================

function optimizeMobileInteraction() {
    const buttons = document.querySelectorAll('.cta-button');
    
    buttons.forEach(button => {
        // Remove delay de 300ms em mobile
        button.style.touchAction = 'manipulation';
        
        // Adiciona feedback tátil
        button.addEventListener('touchstart', function() {
            this.style.opacity = '0.9';
        });
        
        button.addEventListener('touchend', function() {
            this.style.opacity = '1';
        });
    });
}

// ============================================
// RASTREAMENTO DE TEMPO NA PÁGINA
// ============================================

function trackTimeOnPage() {
    const startTime = new Date().getTime();

    window.addEventListener('beforeunload', function() {
        const timeOnPage = Math.round((new Date().getTime() - startTime) / 1000);
        
        recordEvent('page_exit', {
            timeOnPage: timeOnPage,
            scrollPercentage: scrollPercentage,
            hasInteracted: hasInteracted
        });
    });
}

// ============================================
// OTIMIZAÇÃO DE SCROLL PERFORMANCE
// ============================================

let ticking = false;

function onScroll() {
    if (!ticking) {
        window.requestAnimationFrame(function() {
            trackScroll();
            ticking = false;
        });
        ticking = true;
    }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de Upsell - Manejo de Pintos carregada');

    // Inicializa componentes
    initializeTimer();
    setupCTAButtons();
    initParallax();
    detectExitIntent();
    detectDevice();
    optimizeMobileInteraction();
    trackTimeOnPage();

    // Rastreamento de eventos
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', trackInteraction);
    document.addEventListener('keydown', trackInteraction);
    document.addEventListener('touchstart', trackInteraction);

    // Log de inicialização
    recordEvent('page_loaded', {
        timestamp: new Date().toISOString(),
        url: window.location.href
    });
});

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

// Função para enviar dados para servidor (opcional)
function sendAnalyticsData() {
    const events = JSON.parse(localStorage.getItem('pageEvents') || '[]');
    
    if (events.length > 0) {
        // Envia para seu servidor
        fetch('/api/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ events: events })
        }).catch(err => console.log('Analytics enviado'));
    }
}

// Envia dados a cada 30 segundos
setInterval(sendAnalyticsData, 30000);

// ============================================
// TRATAMENTO DE ERROS
// ============================================

window.addEventListener('error', function(event) {
    recordEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno
    });
});

// ============================================
// PRELOAD DE RECURSOS
// ============================================

function preloadResources() {
    // Preload de fonts (se necessário)
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap';
    document.head.appendChild(link);
}

preloadResources();

// ============================================
// SUPORTE A MODO ESCURO (OPCIONAL)
// ============================================

function initDarkModeSupport() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
    }
}

// initDarkModeSupport(); // Descomente se implementar tema escuro
