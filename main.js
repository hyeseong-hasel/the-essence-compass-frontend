document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    const appContainer = document.getElementById('app-container');
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');
    const startJourneyBtn = document.getElementById('start-journey-btn');
    const showCtaModalBtn = document.getElementById('show-cta-modal-btn');
    const mapCtaBtn = document.getElementById('map-cta-btn');
    const ctaModal = document.getElementById('cta-modal');
    const closeModalBtn = document.querySelector('.modal .close-btn');

    // Simulate loading time and hide loading screen
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
        }, 1000);
    }, 2000);

    // Function to show a specific section
    const showSection = (sectionId) => {
        sections.forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.classList.remove('hidden');
            activeSection.classList.add('active');
        }
    };

    // Handle navigation button clicks
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const sectionId = btn.getAttribute('data-section') + '-section';
            showSection(sectionId);
        });
    });

    // Handle button to start the journey
    if (startJourneyBtn) {
        startJourneyBtn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            const journeyBtn = document.querySelector('[data-section="journey"]');
            if (journeyBtn) {
                journeyBtn.classList.add('active');
            }
            showSection('journey-section');
        });
    }

    // Handle CTA modal triggers
    const showModal = () => {
        ctaModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };

    const hideModal = () => {
        ctaModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    };

    if (showCtaModalBtn) {
        showCtaModalBtn.addEventListener('click', showModal);
    }

    if (mapCtaBtn) {
        mapCtaBtn.addEventListener('click', showModal);
    }

    // Close the modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideModal);
    }

    window.addEventListener('click', (event) => {
        if (event.target === ctaModal) {
            hideModal();
        }
    });

    // Initial state: show the welcome section
    showSection('welcome-section');
});