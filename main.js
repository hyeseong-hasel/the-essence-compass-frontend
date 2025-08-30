// Add this line at the top to configure the API URL
const API_URL = 'https://the-essence-compass-backend.onrender.com'; // Replace with your Render URL

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
        description: 'Close your eyes and ask: "What do I need to center on right now?" Wait for the answer, then proceed with intention.',
        duration: 45,
        energy: 'Confused'
    }
];

// --- Utility Functions (unchanged) ---

// Get today's date in a readable format
const getFormattedDate = () => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('en-US', options);
};

// Show a message on the login page
const showLoginMessage = (message, isError = true) => {
    const messageBox = document.getElementById('login-message');
    if (messageBox) {
        messageBox.textContent = message;
        messageBox.classList.remove('hidden');
        messageBox.classList.remove('bg-green-800', 'bg-red-800');
        messageBox.classList.add(isError ? 'bg-red-800' : 'bg-green-800');
    }
};

// Show a message on the registration page
const showRegisterMessage = (message, isError = false) => {
    const messageBox = document.getElementById('register-message');
    const messageText = document.getElementById('register-message-text');
    if (messageBox && messageText) {
        messageText.textContent = message;
        messageBox.classList.remove('hidden');
        const form = document.getElementById('register-form');
        if (form) {
            form.classList.add('hidden');
        }
    }
};

// Get user state from session storage or initialize it
const getUserState = () => {
    const state = JSON.parse(localStorage.getItem('userState')) || {};
    return {
        energy: state.energy || null,
        presence: state.presence || null
    };
};

// Save user state to session storage
const saveUserState = (state) => {
    localStorage.setItem('userState', JSON.stringify(state));
};

// Update the selected option in the UI
const updateState = (type, value, element) => {
    const state = getUserState();
    state[type] = value;
    saveUserState(state);

    const buttons = document.querySelectorAll(`.${type}-btn`);
    buttons.forEach(btn => btn.classList.remove('selected', 'bg-violet-600', 'hover:bg-violet-500'));
    element.classList.add('selected', 'bg-violet-600');

    // Update the background animation based on the energy state
    document.body.className = `min-h-screen antialiased text-white bg-cosmic state-${state.energy ? state.energy.toLowerCase() : ''}`;
    
    // Check if a micro-practice can be displayed
    checkAndDisplayPractice();
};

// Get a micro-practice based on the current energy state
const getMicroPractice = (energyState) => {
    return MICRO_PRACTICES.find(p => p.energy === energyState);
};

// Display a micro-practice if both states are selected
const checkAndDisplayPractice = () => {
    const state = getUserState();
    const practiceDisplay = document.getElementById('practice-display');
    
    if (state.energy && state.presence && practiceDisplay) {
        const practice = getMicroPractice(state.energy);
        if (practice) {
            practiceDisplay.innerHTML = `
                <h3 class="text-xl font-bold mb-2 text-fuchsia-300">${practice.title}</h3>
                <p class="text-slate-200">${practice.description}</p>
                <p class="text-sm mt-2 text-slate-400 italic">Duration: ${practice.duration} seconds</p>
            `;
        }
    }
};

// Save a journal entry
const saveJournalEntry = () => {
    const journalInput = document.getElementById('journal-input');
    const entryText = journalInput.value.trim();

    if (entryText) {
        const entry = {
            date: getFormattedDate(),
            text: entryText,
            energy: getUserState().energy,
            presence: getUserState().presence,
        };

        const entries = JSON.parse(localStorage.getItem('journalEntries')) || [];
        entries.unshift(entry);
        localStorage.setItem('journalEntries', JSON.stringify(entries));

        journalInput.value = '';
        renderJournalEntries();
        renderProgressMap();
        showMessage('Check-in saved!');
        
        // Reset states after saving
        saveUserState({});
        resetUIStates();
    }
};

const resetUIStates = () => {
    const buttons = document.querySelectorAll('.btn-option');
    buttons.forEach(btn => btn.classList.remove('selected', 'bg-violet-600', 'hover:bg-violet-500'));
    const practiceDisplay = document.getElementById('practice-display');
    if (practiceDisplay) {
        practiceDisplay.innerHTML = 'Select your current energy and presence to receive a personalized micro-practice.';
    }
};

// Display a message box at the top of the screen
const showMessage = (message, duration = 3000) => {
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
    if (messageBox && messageText) {
        messageText.textContent = message;
        messageBox.classList.remove('hidden');
        setTimeout(() => {
            messageBox.classList.add('hidden');
        }, duration);
    }
};

// Render the progress map based on saved entries
const renderProgressMap = () => {
    const progressMap = document.getElementById('progress-map');
    if (!progressMap) return;
    
    const entries = JSON.parse(localStorage.getItem('journalEntries')) || [];
    const maxCircles = 20;
    const completedCount = entries.length > maxCircles ? maxCircles : entries.length;
    
    let mapHtml = '';
    for (let i = 0; i < maxCircles; i++) {
        const isActive = i < completedCount;
        mapHtml += `<div class="map-circle ${isActive ? 'completed' : ''}"></div>`;
    }
    progressMap.innerHTML = mapHtml;
};

// Render the journal entries in the UI
const renderJournalEntries = () => {
    const journalList = document.getElementById('journal-list');
    if (!journalList) return;
    
    const entries = JSON.parse(localStorage.getItem('journalEntries')) || [];
    if (entries.length === 0) {
        journalList.innerHTML = '<p class="text-center text-slate-400 italic">Your cosmic journey begins here. Entries will appear after your first check-in.</p>';
        return;
    }

    let entriesHtml = '';
    entries.forEach(entry => {
        entriesHtml += `
            <div class="p-4 bg-slate-700 rounded-lg">
                <p class="text-sm text-slate-400 mb-1">${entry.date}</p>
                <p class="text-white">${entry.text}</p>
                <p class="text-sm mt-2 italic text-fuchsia-300">Energy: ${entry.energy || 'N/A'}, Presence: ${entry.presence || 'N/A'}</p>
            </div>
        `;
    });
    journalList.innerHTML = entriesHtml;
};

// --- New and Updated Core Functions ---

// Handle a user login with the backend API
const handleLogin = async (event) => {
    event.preventDefault();
    const emailInput = document.getElementById('email').value;
    const passwordInput = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: emailInput, password: passwordInput })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('userLoggedIn', 'true');
            console.log(data); // Log the response from the server
            alert('Login successful!');
            window.location.href = 'index.html';
        } else {
            showLoginMessage(data.message || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        showLoginMessage('Network error. Could not connect to the server.');
    }
};

// Handle a user registration with the backend API
const handleRegistration = async (event) => {
    event.preventDefault();
    const usernameInput = document.getElementById('username').value;
    const emailInput = document.getElementById('email').value;
    const passwordInput = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: usernameInput, email: emailInput, password: passwordInput })
        });

        const data = await response.json();
        
        if (response.ok) {
            showRegisterMessage(data.message || 'Registration successful!');
        } else {
            showRegisterMessage(data.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        showRegisterMessage('Network error. Could not connect to the server.');
    }
};

// --- Page Initialization (unchanged) ---

const initPage = () => {
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    const loginCta = document.getElementById('login-cta');
    const loggedInContent = document.getElementById('logged-in-content');
    const userNameElement = document.getElementById('user-name');
    const loadingPortal = document.getElementById('loading-portal');
    const mainApp = document.getElementById('main-app');
    
    if (isLoggedIn) {
        if (loginCta && loggedInContent) {
            loginCta.classList.add('hidden');
            loggedInContent.classList.remove('hidden');
        }
        if (userNameElement) {
            // In a real app, you would fetch the user's name from the backend
            userNameElement.textContent = 'Visionary';
        }
        renderProgressMap();
        renderJournalEntries();
    } else {
        if (loginCta && loggedInContent) {
            loginCta.classList.remove('hidden');
            loggedInContent.classList.add('hidden');
        }
    }

    // Portal animation
    if (loadingPortal && mainApp) {
        setTimeout(() => {
            const spark = loadingPortal.querySelector('.spark');
            if (spark) {
                spark.classList.add('swoosh-transition');
            }
        }, 500);
        setTimeout(() => {
            loadingPortal.style.opacity = '0';
        }, 1500);
        setTimeout(() => {
            loadingPortal.style.display = 'none';
            mainApp.style.opacity = '1';
        }, 2500);
    }

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
};

// Call the initialization function when the page loads
document.addEventListener('DOMContentLoaded', initPage);