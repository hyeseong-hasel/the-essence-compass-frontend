// The Essence Compass - Main JavaScript File
// This file is simplified and corrected to work with the provided HTML and CSS.

// Micro-practices database (remains the same)
const MICRO_PRACTICES = [
    {
        id: 'heart-hello',
        title: '30-Second Heart Hello',
        icon: 'fas fa-heart',
        description: 'Place your hand on your heart and take three deep breaths. With each breath, silently say "Hello, heart. Thank you for keeping me alive."',
        duration: 30,
        energy: 'Stuck'
    },
    {
        id: 'flow-breath',
        title: 'River Flow Breathing',
        icon: 'fas fa-water',
        description: 'Breathe in for 4 counts like water flowing downstream, hold for 2, then breathe out for 6 counts. Feel yourself flowing with life.',
        duration: 60,
        energy: 'Flowing'
    },
    {
        id: 'power-stance',
        title: 'Lightning Strike Moment',
        icon: 'fas fa-bolt',
        description: 'Stand tall, raise your arms above your head, and imagine lightning energy flowing through you. Hold for 15 seconds.',
        duration: 15,
        energy: 'Energized'
    },
    {
        id: 'clarity-pause',
        title: 'Compass Reset',
        icon: 'fas fa-compass',
        description: 'Close your eyes and ask: "What do I need to know right now?" Listen for the first gentle whisper that comes.',
        duration: 45,
        energy: 'Confused'
    }
];

// Cache DOM elements
const elements = {
    loadingPortal: document.getElementById('loading-portal'),
    mainApp: document.getElementById('main-app'),
    progressMap: document.getElementById('progress-map'),
    userName: document.getElementById('user-name'),
    energyButtons: document.querySelectorAll('.energy-btn'),
    presenceButtons: document.querySelectorAll('.presence-btn'),
    practiceDisplay: document.getElementById('practice-display'),
    journalInput: document.getElementById('journal-input'),
    journalList: document.getElementById('journal-list'),
    messageBox: document.getElementById('message-box'),
    messageText: document.getElementById('message-text'),
    loginCta: document.getElementById('login-cta'),
    loggedInContent: document.getElementById('logged-in-content'),
    loginMessage: document.getElementById('login-message'),
    registerMessage: document.getElementById('register-message'),
    registerMessageText: document.getElementById('register-message-text'),
    registerForm: document.getElementById('register-form')
};

// Global State
const appState = {
    currentEnergy: '',
    currentPresence: '',
    journalEntries: JSON.parse(localStorage.getItem('journalEntries')) || [],
    checkInCount: parseInt(localStorage.getItem('checkInCount')) || 0,
    isLoggedIn: localStorage.getItem('userLoggedIn') === 'true'
};

// Utility function to show a temporary message on the main app page
const showMessage = (message, type = 'success') => {
    elements.messageText.textContent = message;
    
    // Set background color based on type
    if (type === 'success') {
        elements.messageBox.classList.add('bg-green-500');
        elements.messageBox.classList.remove('bg-red-500');
    } else {
        elements.messageBox.classList.add('bg-red-500');
        elements.messageBox.classList.remove('bg-green-500');
    }
    
    elements.messageBox.classList.remove('hidden');
    
    setTimeout(() => {
        elements.messageBox.classList.add('hidden');
    }, 3000);
};

// New function to show messages on the login page
const showLoginMessage = (message, type = 'error') => {
    if (elements.loginMessage) {
        elements.loginMessage.textContent = message;
        elements.loginMessage.classList.remove('hidden');
        if (type === 'error') {
            elements.loginMessage.classList.add('bg-red-800');
        }
    }
};

// New function to show messages on the register page
const showRegisterMessage = (message) => {
    if (elements.registerMessage && elements.registerMessageText) {
        elements.registerMessageText.textContent = message;
        elements.registerForm.classList.add('hidden');
        elements.registerMessage.classList.remove('hidden');
    }
};

// Function to handle state updates from buttons
window.updateState = (type, value, button) => {
    // Check if the user is logged in before allowing interaction
    if (!appState.isLoggedIn) {
        showMessage('Please log in to use the daily compass.', 'error');
        return;
    }
    // Clear 'selected' class from all buttons of the same type
    document.querySelectorAll(`.${type}-btn`).forEach(btn => {
        btn.classList.remove('selected');
        btn.style.backgroundColor = ''; // Clear inline style if any
        btn.style.color = '';
    });

    // Add 'selected' class to the clicked button
    button.classList.add('selected');
    button.style.backgroundColor = '#8B5CF6';
    button.style.color = 'white';

    // Update global state
    if (type === 'energy') {
        appState.currentEnergy = value;
        // Also apply the state-based CSS class to the body for the background effect
        document.body.className = document.body.className.replace(/state-\w+/g, ''); // Remove old state
        document.body.classList.add(`state-${value.toLowerCase()}`); // Add new one
    } else {
        appState.currentPresence = value;
    }

    // Check if both have been selected to trigger the practice display
    if (appState.currentEnergy && appState.currentPresence) {
        showPractice();
    }
};

// Function to display the personalized micro-practice
const showPractice = () => {
    const practice = MICRO_PRACTICES.find(p => p.energy === appState.currentEnergy) || MICRO_PRACTICES[0];
    elements.practiceDisplay.innerHTML = `
        <p class="font-bold text-lg mb-2 text-fuchsia-400">${practice.title}</p>
        <p>${practice.description}</p>
        <p class="mt-4 text-xs italic text-slate-500">Practice duration: ${practice.duration} seconds</p>
    `;
    elements.practiceDisplay.classList.add('radiate');
};

// Function to save a journal entry
window.saveJournalEntry = () => {
    if (!appState.isLoggedIn) {
        showMessage('Please log in to save your check-in.', 'error');
        return;
    }
    const entryText = elements.journalInput.value.trim();
    if (entryText.length > 0) {
        const newEntry = {
            id: Date.now(),
            text: entryText,
            timestamp: new Date().toISOString(),
            energy: appState.currentEnergy || 'Not selected',
            presence: appState.currentPresence || 'Not selected'
        };

        // Add to state and local storage
        appState.journalEntries.unshift(newEntry);
        localStorage.setItem('journalEntries', JSON.stringify(appState.journalEntries));

        // Update UI
        elements.journalInput.value = '';
        renderJournalEntries();
        updateProgressMap();
        showMessage('Check-in saved successfully!');
    } else {
        showMessage('Please write something in your journal before saving.', 'error');
    }
};

// Function to render past journal entries
const renderJournalEntries = () => {
    elements.journalList.innerHTML = '';
    if (appState.journalEntries.length === 0) {
        elements.journalList.innerHTML = `<p class="text-center text-slate-400 italic">Your cosmic journey begins here. Entries will appear after your first check-in.</p>`;
    } else {
        appState.journalEntries.forEach(entry => {
            const date = new Date(entry.timestamp).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            const entryElement = document.createElement('div');
            entryElement.className = 'bg-slate-700 p-4 rounded-xl border border-slate-600';
            entryElement.innerHTML = `
                <p class="text-xs text-slate-400 mb-2">${date}</p>
                <p class="text-sm italic text-slate-300 mb-2">Energy: ${entry.energy} | Presence: ${entry.presence}</p>
                <p>${entry.text}</p>
            `;
            elements.journalList.appendChild(entryElement);
        });
    }
};

// Function to update the progress map
const updateProgressMap = () => {
    // Increment check-in count and save
    appState.checkInCount = appState.journalEntries.length;
    localStorage.setItem('checkInCount', appState.checkInCount);

    elements.progressMap.innerHTML = '';
    const totalCircles = 5;
    
    for (let i = 0; i < totalCircles; i++) {
        const circle = document.createElement('div');
        circle.className = 'map-circle';
        
        if (i < appState.checkInCount) {
            circle.classList.add('completed');
        } else if (i === appState.checkInCount) {
            circle.classList.add('active');
        }
        
        elements.progressMap.appendChild(circle);
    }
};

// Check if user is logged in and show appropriate content
const checkLoginStatus = () => {
    if (appState.isLoggedIn) {
        if (elements.loginCta) elements.loginCta.classList.add('hidden');
        if (elements.loggedInContent) elements.loggedInContent.classList.remove('hidden');
        renderJournalEntries();
        updateProgressMap();
    } else {
        if (elements.loginCta) elements.loginCta.classList.remove('hidden');
        if (elements.loggedInContent) elements.loggedInContent.classList.add('hidden');
    }
};

// Initial app setup
const initializeApp = () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (elements.loadingPortal) {
        // Simulate a loading delay for the main page
        setTimeout(() => {
            elements.loadingPortal.classList.add('opacity-0');
            elements.loadingPortal.addEventListener('transitionend', () => {
                elements.loadingPortal.remove();
                if (elements.mainApp) {
                    elements.mainApp.classList.remove('opacity-0');
                    checkLoginStatus(); // Check login status after loading is complete
                }
            });
        }, 2000);
    }
    
    // Add event listeners for the new forms
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
};

// Hard-coded user for demonstration
const registeredUser = {
    email: 'test@user.com',
    password: 'password123'
};

// Handle a successful login
const handleLogin = (event) => {
    event.preventDefault();
    const emailInput = document.getElementById('email').value;
    const passwordInput = document.getElementById('password').value;
    
    // Check if the input matches our hard-coded user
    if (emailInput === registeredUser.email && passwordInput === registeredUser.password) {
        // Simulate a successful login
        localStorage.setItem('userLoggedIn', 'true');
        alert('Login successful!');
        window.location.href = 'index.html';
    } else {
        // Handle login failure
        showLoginMessage('Incorrect email or password. Please try again or reset your password.');
    }
};

// Handle a successful registration
const handleRegistration = (event) => {
    event.preventDefault();
    // In a real app, you would send this data to a server for account creation.
    // For this demonstration, we'll just show a success message.
    showRegisterMessage('Registration successful! You can now log in with your new account.');
    // The form is now hidden, and the user can click the "Go to Login" link.
};


document.addEventListener('DOMContentLoaded', initializeApp);