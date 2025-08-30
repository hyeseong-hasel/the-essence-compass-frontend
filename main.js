// The Essence Compass - Main JavaScript File
// API Configuration
const API_BASE_URL = 'https://the-essence-compass-backend.onrender.com/api';

// Global State Management (using in-memory storage only)
let appState = {
    user: {
        cosmicDust: 0,
        currentStreak: 0,
        totalPractices: 0,
        journalEntries: [],
        receivedRoses: []
    },
    currentSection: 'compass',
    currentCheckIn: null,
    timerInterval: null,
    practiceInProgress: false
};

// Micro-practices database
const MICRO_PRACTICES = [
    {
        id: 'heart-hello',
        title: '30-Second Heart Hello',
        icon: 'fas fa-heart',
        description: 'Place your hand on your heart and take three deep breaths. With each breath, silently say "Hello, heart. Thank you for keeping me alive."',
        duration: 30,
        energy: 'stuck'
    },
    {
        id: 'flow-breath',
        title: 'River Flow Breathing',
        icon: 'fas fa-water',
        description: 'Breathe in for 4 counts like water flowing downstream, hold for 2, then breathe out for 6 counts. Feel yourself flowing with life.',
        duration: 60,
        energy: 'flowing'
    },
    {
        id: 'power-stance',
        title: 'Lightning Strike Moment',
        icon: 'fas fa-bolt',
        description: 'Stand tall, raise your arms above your head, and imagine lightning energy flowing through you. Hold for 15 seconds.',
        duration: 15,
        energy: 'energized'
    },
    {
        id: 'clarity-pause',
        title: 'Compass Reset',
        icon: 'fas fa-compass',
        description: 'Close your eyes and ask: "What do I need to know right now?" Listen for the first gentle whisper that comes.',
        duration: 45,
        energy: 'confused'
    }
];

// Journal prompts database
const JOURNAL_PROMPTS = [
    "How can you reframe your current situation as an opportunity instead of a limitation?",
    "What would you do today if you trusted yourself completely?",
    "What is your heart trying to tell you that your mind keeps ignoring?",
    "If your future self could send you one message, what would it be?",
    "What small act of self-love can you commit to today?",
    "How are you different now than you were six months ago?",
    "What permission do you need to give yourself right now?",
    "What would unconditional self-acceptance look like in your daily life?",
    "If you could release one limiting belief today, what would it be?",
    "What brings you alive, and how can you invite more of it in?"
];

// Self-love prompts database
const SELF_LOVE_PROMPTS = [
    "What is one thing you can appreciate about yourself today?",
    "How did you show resilience this week?",
    "What unique gift do you bring to the world?",
    "What would you say to comfort your younger self?",
    "What are you most grateful for about your journey so far?",
    "How have you grown in the past month?",
    "What quality do you have that makes others feel safe?",
    "What small victory can you celebrate today?",
    "How do you nurture others, and how can you nurture yourself the same way?",
    "What makes your heart sing when you think about it?"
];

// DOM Elements Cache
const elements = {};

// Utility Functions
const utils = {
    // Get random item from array
    getRandomItem: (array) => array[Math.floor(Math.random() * array.length)],
    
    // Format date for display
    formatDate: (date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    },
    
    // Truncate text for preview
    truncateText: (text, maxLength = 100) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    },
    
    // Animate compass needle
    animateCompass: (energy, presence) => {
        const needle = elements.compassNeedle;
        if (!needle) return;
        
        // Calculate rotation based on energy and presence
        let rotation = 0;
        switch (energy) {
            case 'stuck': rotation = 180 + (presence * 10); break;
            case 'flowing': rotation = 90 + (presence * 5); break;
            case 'energized': rotation = 45 + (presence * 8); break;
            case 'confused': rotation = 270 + (presence * 15); break;
            default: rotation = presence * 36;
        }
        
        needle.style.transform = `rotate(${rotation}deg)`;
    },
    
    // Show success modal
    showModal: (title, message, icon = 'fas fa-star') => {
        const modal = elements.successModal;
        const modalTitle = elements.modalTitle;
        const modalMessage = elements.modalMessage;
        const modalIcon = modal.querySelector('.modal-icon i');
        
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalIcon.className = icon;
        
        modal.classList.remove('hidden');
    },
    
    // Hide modal
    hideModal: () => {
        elements.successModal.classList.add('hidden');
    },
    
    // Update cosmic dust display
    updateCosmicDust: (amount) => {
        appState.user.cosmicDust += amount;
        if (elements.cosmicDustCount) {
            elements.cosmicDustCount.textContent = appState.user.cosmicDust;
        }
    },
    
    // API call wrapper with error handling
    apiCall: async (endpoint, options = {}) => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Call failed:', error);
            // Return mock data for development/offline mode
            return { success: false, error: error.message };
        }
    }
};

// Initialize DOM elements cache
function cacheElements() {
    const ids = [
        'loading-screen', 'app-container', 'compass-visual', 'compass-needle',
        'check-in-card', 'guidance-card', 'get-guidance', 'start-practice',
        'complete-practice', 'timer-display', 'timer-minutes', 'timer-seconds',
        'current-question', 'presence-range', 'practice-icon', 'practice-title',
        'practice-description', 'cosmic-dust-count', 'success-modal', 'close-modal',
        'modal-title', 'modal-message', 'journal-entry', 'word-count',
        'save-entry', 'new-prompt', 'journal-prompt-text', 'entry-list',
        'rose-message', 'rose-char-count', 'send-rose', 'roses-container',
        'new-self-love-prompt', 'self-love-prompt', 'star-map', 'journey-progress'
    ];
    
    ids.forEach(id => {
        elements[id] = document.getElementById(id);
    });
    
    // Cache navigation buttons
    elements.navBtns = document.querySelectorAll('.nav-btn');
    elements.energyBtns = document.querySelectorAll('.energy-btn');
    elements.contentSections = document.querySelectorAll('.content-section');
}

// Loading Screen Management
function handleLoadingScreen() {
    setTimeout(() => {
        elements['loading-screen'].classList.add('hidden');
        elements['app-container'].classList.remove('hidden');
    }, 2000);
}

// Navigation System
function initializeNavigation() {
    elements.navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSection = btn.dataset.section;
            switchSection(targetSection);
        });
    });
}

function switchSection(sectionName) {
    // Update active nav button
    elements.navBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionName);
    });
    
    // Update active content section
    elements.contentSections.forEach(section => {
        section.classList.toggle('active', section.id === `${sectionName}-section`);
    });
    
    appState.currentSection = sectionName;
    
    // Initialize section-specific functionality
    switch (sectionName) {
        case 'map':
            drawConstellation();
            break;
        case 'journal':
            updateWordCount();
            loadJournalHistory();
            break;
        case 'roses':
            updateCharCount();
            loadReceivedRoses();
            break;
    }
}

// Daily Compass Functionality
function initializeCompass() {
    // Energy button selection
    elements.energyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.energyBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });
    
    // Get guidance button
    if (elements['get-guidance']) {
        elements['get-guidance'].addEventListener('click', handleGetGuidance);
    }
    
    // Start practice button
    if (elements['start-practice']) {
        elements['start-practice'].addEventListener('click', startPracticeTimer);
    }
    
    // Complete practice button
    if (elements['complete-practice']) {
        elements['complete-practice'].addEventListener('click', completePractice);
    }
    
    // Presence slider
    if (elements['presence-range']) {
        elements['presence-range'].addEventListener('input', updateCompassNeedle);
    }
}

function handleGetGuidance() {
    const selectedEnergy = document.querySelector('.energy-btn.selected');
    const presenceValue = elements['presence-range'].value;
    
    if (!selectedEnergy) {
        alert('Please select your current energy state first.');
        return;
    }
    
    const energyType = selectedEnergy.dataset.energy;
    const practice = MICRO_PRACTICES.find(p => p.energy === energyType) || utils.getRandomItem(MICRO_PRACTICES);
    
    // Update compass needle
    utils.animateCompass(energyType, parseInt(presenceValue));
    
    // Show guidance card
    showGuidancePractice(practice);
    
    // Hide check-in card and show guidance
    elements['check-in-card'].classList.add('hidden');
    elements['guidance-card'].classList.remove('hidden');
    
    // Store current check-in
    appState.currentCheckIn = {
        energy: energyType,
        presence: presenceValue,
        practice: practice,
        timestamp: new Date()
    };
    
    // Send to backend (with fallback)
    utils.apiCall('/check-in', {
        method: 'POST',
        body: JSON.stringify({
            energy: energyType,
            presence: presenceValue,
            practice_id: practice.id
        })
    });
}

function showGuidancePractice(practice) {
    elements['practice-icon'].className = practice.icon;
    elements['practice-title'].textContent = practice.title;
    elements['practice-description'].textContent = practice.description;
    
    // Reset timer display
    const minutes = Math.floor(practice.duration / 60);
    const seconds = practice.duration % 60;
    elements['timer-minutes'].textContent = minutes.toString().padStart(2, '0');
    elements['timer-seconds'].textContent = seconds.toString().padStart(2, '0');
}

function startPracticeTimer() {
    if (appState.practiceInProgress) return;
    
    const practice = appState.currentCheckIn?.practice;
    if (!practice) return;
    
    appState.practiceInProgress = true;
    let timeLeft = practice.duration;
    
    elements['start-practice'].style.display = 'none';
    elements['timer-display'].classList.remove('hidden');
    
    appState.timerInterval = setInterval(() => {
        timeLeft--;
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        elements['timer-minutes'].textContent = minutes.toString().padStart(2, '0');
        elements['timer-seconds'].textContent = seconds.toString().padStart(2, '0');
        
        if (timeLeft <= 0) {
            clearInterval(appState.timerInterval);
            appState.practiceInProgress = false;
            
            // Show completion notification
            utils.showModal('Practice Complete!', 'Take a moment to notice how you feel. Ready to mark it complete?');
        }
    }, 1000);
}

function completePractice() {
    if (appState.timerInterval) {
        clearInterval(appState.timerInterval);
    }
    
    const pointsEarned = 5;
    utils.updateCosmicDust(pointsEarned);
    appState.user.totalPractices++;
    
    // Send completion to backend
    utils.apiCall('/complete-practice', {
        method: 'POST',
        body: JSON.stringify({
            practice_id: appState.currentCheckIn?.practice.id,
            points_earned: pointsEarned
        })
    });
    
    utils.showModal('Cosmic Alignment Complete!', `You've earned ${pointsEarned} Cosmic Dust points!`, 'fas fa-star');
    
    // Reset for next practice
    setTimeout(() => {
        elements['guidance-card'].classList.add('hidden');
        elements['check-in-card'].classList.remove('hidden');
        elements['start-practice'].style.display = 'flex';
        elements['timer-display'].classList.add('hidden');
        
        // Clear selections
        elements.energyBtns.forEach(btn => btn.classList.remove('selected'));
        elements['presence-range'].value = 5;
        
        appState.practiceInProgress = false;
        appState.currentCheckIn = null;
    }, 3000);
}

function updateCompassNeedle() {
    const selectedEnergy = document.querySelector('.energy-btn.selected');
    if (selectedEnergy) {
        const energyType = selectedEnergy.dataset.energy;
        const presenceValue = parseInt(elements['presence-range'].value);
        utils.animateCompass(energyType, presenceValue);
    }
}

// Soul Essence Map (Canvas)
function drawConstellation() {
    const canvas = elements['star-map'];
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Create gradient background
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.1)');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw constellation points based on user progress
    const totalPractices = appState.user.totalPractices;
    const maxStars = 12;
    const completedStars = Math.min(totalPractices, maxStars);
    
    for (let i = 0; i < maxStars; i++) {
        const angle = (i / maxStars) * 2 * Math.PI;
        const radius = Math.min(width, height) * 0.3;
        const x = width/2 + Math.cos(angle) * radius;
        const y = height/2 + Math.sin(angle) * radius;
        
        ctx.beginPath();
        
        if (i < completedStars) {
            // Completed star
            ctx.fillStyle = '#FFD700';
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 10;
        } else if (i === completedStars) {
            // Current star
            ctx.fillStyle = '#FF6B9D';
            ctx.shadowColor = '#FF6B9D';
            ctx.shadowBlur = 8;
        } else {
            // Future star
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.shadowBlur = 0;
        }
        
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw connections between completed stars
        if (i > 0 && i <= completedStars) {
            const prevAngle = ((i-1) / maxStars) * 2 * Math.PI;
            const prevX = width/2 + Math.cos(prevAngle) * radius;
            const prevY = height/2 + Math.sin(prevAngle) * radius;
            
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
            ctx.lineWidth = 1;
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }
    
    // Update progress bar
    const progressPercent = (completedStars / maxStars) * 100;
    if (elements['journey-progress']) {
        elements['journey-progress'].style.width = `${progressPercent}%`;
    }
}

// Journal Functionality
function initializeJournal() {
    // Word counter
    if (elements['journal-entry']) {
        elements['journal-entry'].addEventListener('input', updateWordCount);
    }
    
    // Save entry button
    if (elements['save-entry']) {
        elements['save-entry'].addEventListener('click', saveJournalEntry);
    }
    
    // New prompt button
    if (elements['new-prompt']) {
        elements['new-prompt'].addEventListener('click', generateNewPrompt);
    }
    
    // Load initial prompt
    generateNewPrompt();
    loadJournalHistory();
}

function updateWordCount() {
    const text = elements['journal-entry'].value;
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    elements['word-count'].textContent = wordCount;
}

function generateNewPrompt() {
    const randomPrompt = utils.getRandomItem(JOURNAL_PROMPTS);
    elements['journal-prompt-text'].textContent = randomPrompt;
}

function saveJournalEntry() {
    const entryText = elements['journal-entry'].value.trim();
    if (!entryText) {
        alert('Please write something before saving.');
        return;
    }
    
    const entry = {
        id: Date.now(),
        text: entryText,
        prompt: elements['journal-prompt-text'].textContent,
        date: new Date(),
        wordCount: entryText.split(/\s+/).length
    };
    
    appState.user.journalEntries.unshift(entry);
    
    // Send to backend
    utils.apiCall('/journal-entry', {
        method: 'POST',
        body: JSON.stringify({
            text: entryText,
            prompt: entry.prompt
        })
    });
    
    // Clear editor and show success
    elements['journal-entry'].value = '';
    updateWordCount();
    generateNewPrompt();
    loadJournalHistory();
    
    utils.showModal('Journal Saved!', 'Your entry has been saved to your personal history.', 'fas fa-book');
}

function loadJournalHistory() {
    const entryList = elements.entryList;
    if (!entryList) return;
    
    entryList.innerHTML = '';
    appState.user.journalEntries.forEach(entry => {
        const entryItem = document.createElement('div');
        entryItem.className = 'journal-entry-item';
        entryItem.innerHTML = `
            <div class="journal-entry-header">
                <span>${utils.formatDate(entry.date)}</span>
                <span>${entry.wordCount} words</span>
            </div>
            <p class="entry-preview">${utils.truncateText(entry.text)}</p>
        `;
        entryList.appendChild(entryItem);
    });
}

// Rose Circle Functionality
function initializeRoses() {
    if (elements['rose-message']) {
        elements['rose-message'].addEventListener('input', updateCharCount);
    }
    
    if (elements['send-rose']) {
        elements['send-rose'].addEventListener('click', sendRose);
    }
    
    if (elements['new-self-love-prompt']) {
        elements['new-self-love-prompt'].addEventListener('click', generateNewSelfLovePrompt);
    }
    
    generateNewSelfLovePrompt();
    loadReceivedRoses();
}

function updateCharCount() {
    const text = elements['rose-message'].value;
    const charCount = text.length;
    elements['rose-char-count'].textContent = `${charCount}/280`;
}

function generateNewSelfLovePrompt() {
    const randomPrompt = utils.getRandomItem(SELF_LOVE_PROMPTS);
    elements['self-love-prompt'].textContent = randomPrompt;
}

function sendRose() {
    const message = elements['rose-message'].value.trim();
    if (!message) {
        alert('Please write a message before sending a rose.');
        return;
    }
    
    const rose = {
        id: Date.now(),
        message: message,
        date: new Date()
    };
    
    appState.user.receivedRoses.unshift(rose);
    
    // Send to backend
    utils.apiCall('/send-rose', {
        method: 'POST',
        body: JSON.stringify({
            message: message
        })
    });
    
    // Clear input and show success
    elements['rose-message'].value = '';
    updateCharCount();
    loadReceivedRoses();
    
    utils.showModal('Rose Sent!', 'Your digital rose has been sent into the circle of self-love.', 'fas fa-hand-holding-heart');
}

function loadReceivedRoses() {
    const rosesContainer = elements.rosesContainer;
    if (!rosesContainer) return;
    
    rosesContainer.innerHTML = '';
    appState.user.receivedRoses.forEach(rose => {
        const roseItem = document.createElement('div');
        roseItem.className = 'rose-item';
        roseItem.innerHTML = `
            <p class="rose-message-text">${rose.message}</p>
            <span class="rose-meta">Received on ${utils.formatDate(rose.date)}</span>
        `;
        rosesContainer.appendChild(roseItem);
    });
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    handleLoadingScreen();
    initializeNavigation();
    initializeCompass();
    initializeJournal();
    initializeRoses();
    
    // Hide modal on close button click
    if (elements['close-modal']) {
        elements['close-modal'].addEventListener('click', utils.hideModal);
    }
    
    // Initial content setup
    switchSection('compass');
});