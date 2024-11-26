let darkMode = false;

// Function to clear the display
function clearDisplay() {
    document.getElementById('display').value = '';
}

// Function to append values to the display
function appendToDisplay(value) {
    document.getElementById('display').value += value;
}

// Function to perform backspace
function backspace() {
    let display = document.getElementById('display');
    display.value = display.value.slice(0, -1);
}

// Function to calculate the result
function calculateResult() {
    let expression = document.getElementById('display').value;

    try {
        // Handle percentage calculation
        expression = expression.replace(/(\d+)%/g, (match, p1) => `(${p1}/100)`);

        let result = evaluate(expression);
        document.getElementById('display').value = result;
        addHistory(expression + ' = ' + result);

        // Trigger voice output
        speakResult(result);
    } catch (e) {
        document.getElementById('display').value = 'Error';
    }
}

// Function to safely evaluate the expression
function evaluate(expression) {
    return Function('"use strict";return (' + expression + ')')();
}

// Function to add an entry to the history
function addHistory(entry) {
    let historyList = document.getElementById('history-list');
    let listItem = document.createElement('li');
    listItem.textContent = entry;
    historyList.appendChild(listItem);

    // Save to localStorage
    let history = JSON.parse(localStorage.getItem('calcHistory')) || [];
    history.push(entry);
    localStorage.setItem('calcHistory', JSON.stringify(history));
}

// Load history from localStorage when the page loads
window.onload = function() {
    let history = JSON.parse(localStorage.getItem('calcHistory')) || [];
    let historyList = document.getElementById('history-list');
    history.forEach(entry => {
        let listItem = document.createElement('li');
        listItem.textContent = entry;
        historyList.appendChild(listItem);
    });
};

// Theme Toggle Event Listener
document.getElementById('theme-toggle').addEventListener('click', () => {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode', darkMode);
    document.getElementById('theme-toggle').textContent = darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
});

// Clear History Event Listener
document.getElementById('clear-history').addEventListener('click', () => {
    document.getElementById('history-list').innerHTML = '';
    localStorage.removeItem('calcHistory');
});

// Voice Input Functionality
function initializeVoiceInput() {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('Your browser does not support Speech Recognition. Please use Google Chrome.');
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = function(event) {
        const speechResult = event.results[0][0].transcript;
        console.log('Speech received: ' + speechResult);
        appendToDisplay(speechResult);
    };

    recognition.onspeechend = function() {
        recognition.stop();
    };

    recognition.onerror = function(event) {
        alert('Error occurred in recognition: ' + event.error);
    };
}

// Voice Output Functionality
function speakResult(result) {
    if (!('speechSynthesis' in window)) {
        alert('Your browser does not support Speech Synthesis.');
        return;
    }

    const utterance = new SpeechSynthesisUtterance('The result is ' + result);
    // Optionally, set voice properties
    utterance.pitch = 1;
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
}

// Event Listeners for Voice Buttons
document.getElementById('voice-input').addEventListener('click', initializeVoiceInput);
document.getElementById('voice-output').addEventListener('click', () => {
    const displayValue = document.getElementById('display').value;
    if (displayValue) {
        speakResult(displayValue);
    } else {
        alert('Nothing to speak. Please perform a calculation first.');
    }
});
