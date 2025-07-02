// Password Strength Checker with zxcvbn and HaveIBeenPwned integration
class PassGuard {
    constructor() {
        this.currentQuestionIndex = 0;
        this.qnaAnswers = {};
        this.breachCheckTimeout = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeQnA();
    }

    bindEvents() {
        const passwordInput = document.getElementById('password');
        const togglePassword = document.getElementById('togglePassword');
        const startQnA = document.getElementById('startQnA');
        const nextQuestion = document.getElementById('nextQuestion');
        const prevQuestion = document.getElementById('prevQuestion');
        const generatePassword = document.getElementById('generatePassword');
        const copyPassword = document.getElementById('copyPassword');
        const testPassword = document.getElementById('testPassword');

        // Password input events
        passwordInput.addEventListener('input', (e) => this.handlePasswordInput(e));
        passwordInput.addEventListener('paste', (e) => {
            setTimeout(() => this.handlePasswordInput(e), 10);
        });

        // Toggle password visibility
        togglePassword.addEventListener('click', () => this.togglePasswordVisibility());

        // Q&A events
        startQnA.addEventListener('click', () => this.startQnA());
        nextQuestion.addEventListener('click', () => this.nextQuestion());
        prevQuestion.addEventListener('click', () => this.prevQuestion());
        generatePassword.addEventListener('click', () => this.generatePersonalizedPassword());
        copyPassword.addEventListener('click', () => this.copyToClipboard());
        testPassword.addEventListener('click', () => this.testGeneratedPassword());
    }

    handlePasswordInput(e) {
        const password = e.target.value;
        
        if (password.length === 0) {
            this.resetStrengthMeter();
            return;
        }

        this.checkPasswordStrength(password);
        this.scheduleBreachCheck(password);
    }

    checkPasswordStrength(password) {
        if (typeof zxcvbn === 'undefined') {
            console.error('zxcvbn library not loaded');
            return;
        }

        const result = zxcvbn(password);
        this.updateStrengthMeter(result);
        this.showFeedback(result);
    }

    updateStrengthMeter(result) {
        const strengthMeter = document.getElementById('strengthMeter');
        const strengthBar = document.getElementById('strengthBar');
        const strengthEmoji = document.getElementById('strengthEmoji');
        const strengthLabel = document.getElementById('strengthLabel');
        const strengthScore = document.getElementById('strengthScore');

        // Show the strength meter
        strengthMeter.classList.add('visible');

        // Update progress bar
        const percentage = ((result.score + 1) / 5) * 100;
        strengthBar.style.width = `${percentage}%`;

        // Define strength levels
        const strengthLevels = [
            { label: 'Very Weak', emoji: '🔴', class: 'very-weak', color: '#ef4444' },
            { label: 'Weak', emoji: '🟠', class: 'weak', color: '#ff6b6b' },
            { label: 'Fair', emoji: '🟡', class: 'fair', color: '#f59e0b' },
            { label: 'Good', emoji: '🟢', class: 'good', color: '#4ecdc4' },
            { label: 'Strong', emoji: '🟢', class: 'strong', color: '#10b981' }
        ];

        const currentLevel = strengthLevels[result.score];
        
        // Update UI elements
        strengthBar.className = `strength-bar ${currentLevel.class}`;
        strengthEmoji.textContent = currentLevel.emoji;
        strengthLabel.textContent = currentLevel.label;
        strengthLabel.style.color = currentLevel.color;
        
        // Update score display
        const crackTime = result.crack_times_display.offline_slow_hashing_1e4_per_second;
        strengthScore.textContent = `Time to crack: ${crackTime}`;

        // Trigger emoji animation
        strengthEmoji.style.animation = 'none';
        setTimeout(() => {
            strengthEmoji.style.animation = 'bounce 0.5s ease-out';
        }, 10);
    }

    showFeedback(result) {
        const feedbackSection = document.getElementById('feedbackSection');
        const feedbackList = document.getElementById('feedbackList');

        if (result.feedback.suggestions.length > 0 || result.feedback.warning) {
            feedbackSection.style.display = 'block';
            feedbackList.innerHTML = '';

            // Add warning if present
            if (result.feedback.warning) {
                const warningItem = document.createElement('li');
                warningItem.textContent = result.feedback.warning;
                warningItem.style.color = '#ef4444';
                feedbackList.appendChild(warningItem);
            }

            // Add suggestions
            result.feedback.suggestions.forEach(suggestion => {
                const suggestionItem = document.createElement('li');
                suggestionItem.textContent = suggestion;
                feedbackList.appendChild(suggestionItem);
            });
        } else {
            feedbackSection.style.display = 'none';
        }
    }

    scheduleBreachCheck(password) {
        // Clear existing timeout
        if (this.breachCheckTimeout) {
            clearTimeout(this.breachCheckTimeout);
        }

        // Schedule breach check after 1 second of no typing
        this.breachCheckTimeout = setTimeout(() => {
            this.checkPasswordBreach(password);
        }, 1000);
    }

    async checkPasswordBreach(password) {
        if (password.length < 4) return; // Don't check very short passwords

        const breachCheck = document.getElementById('breachCheck');
        const breachWarning = document.getElementById('breachWarning');
        const breachSafe = document.getElementById('breachSafe');
        const loadingSpinner = document.getElementById('loadingSpinner');

        try {
            loadingSpinner.style.display = 'flex';
            
            // Hash the password using SHA-1
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-1', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

            // Use k-anonymity: send only first 5 characters of hash
            const prefix = hashHex.substring(0, 5);
            const suffix = hashHex.substring(5);

            const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
            
            if (!response.ok) {
                throw new Error('API request failed');
            }

            const text = await response.text();
            const lines = text.split('\n');
            
            let isBreached = false;
            let breachCount = 0;

            for (const line of lines) {
                const [hashSuffix, count] = line.split(':');
                if (hashSuffix === suffix) {
                    isBreached = true;
                    breachCount = parseInt(count);
                    break;
                }
            }

            // Show results
            breachCheck.style.display = 'block';
            
            if (isBreached) {
                breachWarning.style.display = 'flex';
                breachSafe.style.display = 'none';
                breachWarning.querySelector('span').textContent = 
                    `This password has been found in ${breachCount.toLocaleString()} data breaches!`;
            } else {
                breachWarning.style.display = 'none';
                breachSafe.style.display = 'flex';
            }

        } catch (error) {
            console.error('Breach check failed:', error);
            breachCheck.style.display = 'none';
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    resetStrengthMeter() {
        const strengthMeter = document.getElementById('strengthMeter');
        const breachCheck = document.getElementById('breachCheck');
        const feedbackSection = document.getElementById('feedbackSection');

        strengthMeter.classList.remove('visible');
        breachCheck.style.display = 'none';
        feedbackSection.style.display = 'none';
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.querySelector('#togglePassword i');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            toggleIcon.className = 'fas fa-eye';
        }
    }

    // Q&A System for Password Generation
    initializeQnA() {
        this.questions = [
            {
                id: 'favorite_place',
                question: '🏖️ What\'s your favorite place or dream destination?',
                type: 'text',
                placeholder: 'e.g., Paris, Beach, Mountains...'
            },
            {
                id: 'favorite_number',
                question: '🔢 Do you have a favorite number or lucky number?',
                type: 'text',
                placeholder: 'e.g., 7, 42, 2024...'
            },
            {
                id: 'pet_name',
                question: '🐕 What\'s the name of a pet (current or childhood)?',
                type: 'text',
                placeholder: 'e.g., Buddy, Whiskers, Rex...'
            },
            {
                id: 'hobby',
                question: '🎨 What\'s one of your favorite hobbies?',
                type: 'options',
                options: ['Reading', 'Gaming', 'Cooking', 'Sports', 'Music', 'Art', 'Travel', 'Other']
            },
            {
                id: 'birth_year',
                question: '📅 What year were you born? (We\'ll modify it for security)',
                type: 'text',
                placeholder: 'e.g., 1990, 1985...'
            },
            {
                id: 'favorite_color',
                question: '🌈 What\'s your favorite color?',
                type: 'options',
                options: ['Red', 'Blue', 'Green', 'Purple', 'Orange', 'Yellow', 'Pink', 'Black', 'White']
            },
            {
                id: 'memorable_word',
                question: '💭 Think of a word that\'s meaningful to you',
                type: 'text',
                placeholder: 'e.g., Freedom, Adventure, Family...'
            }
        ];
    }

    startQnA() {
        const qnaHeader = document.querySelector('.qna-header');
        const qnaContent = document.getElementById('qnaContent');
        
        qnaHeader.style.display = 'none';
        qnaContent.style.display = 'block';
        
        this.currentQuestionIndex = 0;
        this.qnaAnswers = {};
        this.showQuestion();
    }

    showQuestion() {
        const questionContainer = document.getElementById('questionContainer');
        const question = this.questions[this.currentQuestionIndex];
        
        let questionHTML = `
            <div class="question">
                <h3>${question.question}</h3>
        `;

        if (question.type === 'text') {
            questionHTML += `
                <input type="text" 
                       class="text-input" 
                       id="answer_${question.id}" 
                       placeholder="${question.placeholder}"
                       value="${this.qnaAnswers[question.id] || ''}">
            `;
        } else if (question.type === 'options') {
            questionHTML += '<div class="question-options">';
            question.options.forEach(option => {
                const isSelected = this.qnaAnswers[question.id] === option ? 'selected' : '';
                questionHTML += `
                    <button class="option-button ${isSelected}" 
                            onclick="passGuard.selectOption('${question.id}', '${option}')">
                        ${option}
                    </button>
                `;
            });
            questionHTML += '</div>';
        }

        questionHTML += '</div>';
        questionContainer.innerHTML = questionHTML;

        // Update navigation buttons
        this.updateNavigationButtons();

        // Focus on text input if present
        const textInput = document.getElementById(`answer_${question.id}`);
        if (textInput) {
            textInput.focus();
            textInput.addEventListener('input', (e) => {
                this.qnaAnswers[question.id] = e.target.value;
            });
        }
    }

    selectOption(questionId, option) {
        this.qnaAnswers[questionId] = option;
        
        // Update button states
        const buttons = document.querySelectorAll('.option-button');
        buttons.forEach(btn => {
            btn.classList.remove('selected');
            if (btn.textContent.trim() === option) {
                btn.classList.add('selected');
            }
        });

        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const prevButton = document.getElementById('prevQuestion');
        const nextButton = document.getElementById('nextQuestion');
        const generateButton = document.getElementById('generatePassword');

        // Show/hide previous button
        prevButton.style.display = this.currentQuestionIndex > 0 ? 'inline-flex' : 'none';

        // Show/hide next/generate buttons
        const isLastQuestion = this.currentQuestionIndex === this.questions.length - 1;
        const hasAnswer = this.qnaAnswers[this.questions[this.currentQuestionIndex].id];

        if (isLastQuestion) {
            nextButton.style.display = 'none';
            generateButton.style.display = hasAnswer ? 'inline-flex' : 'none';
        } else {
            nextButton.style.display = hasAnswer ? 'inline-flex' : 'none';
            generateButton.style.display = 'none';
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.showQuestion();
        }
    }

    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showQuestion();
        }
    }

    generatePersonalizedPassword() {
        const components = [];
        const symbols = ['!', '@', '#', '$', '%', '&', '*'];
        
        // Extract meaningful components from answers
        Object.entries(this.qnaAnswers).forEach(([key, value]) => {
            if (value && value.trim()) {
                switch (key) {
                    case 'favorite_place':
                        components.push(this.capitalizeFirst(value.trim().replace(/\s+/g, '')));
                        break;
                    case 'favorite_number':
                        components.push(value.toString());
                        break;
                    case 'pet_name':
                        components.push(this.capitalizeFirst(value.trim()));
                        break;
                    case 'hobby':
                        components.push(value.substring(0, 3).toLowerCase());
                        break;
                    case 'birth_year':
                        // Modify birth year for security (reverse it)
                        const year = value.toString();
                        components.push(year.split('').reverse().join(''));
                        break;
                    case 'favorite_color':
                        components.push(value.substring(0, 2).toUpperCase());
                        break;
                    case 'memorable_word':
                        components.push(this.capitalizeFirst(value.trim()));
                        break;
                }
            }
        });

        // Add random symbol
        components.push(symbols[Math.floor(Math.random() * symbols.length)]);
        
        // Add random number
        components.push(Math.floor(Math.random() * 99).toString().padStart(2, '0'));

        // Shuffle components
        for (let i = components.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [components[i], components[j]] = [components[j], components[i]];
        }

        const password = components.join('');
        
        // Show generated password
        this.showGeneratedPassword(password);
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    showGeneratedPassword(password) {
        const generatedPasswordDiv = document.getElementById('generatedPassword');
        const resultPasswordInput = document.getElementById('resultPassword');
        const passwordExplanation = document.getElementById('passwordExplanation');

        resultPasswordInput.value = password;
        
        // Create explanation
        const explanationParts = [];
        if (this.qnaAnswers.favorite_place) explanationParts.push('your favorite place');
        if (this.qnaAnswers.pet_name) explanationParts.push('your pet\'s name');
        if (this.qnaAnswers.memorable_word) explanationParts.push('your meaningful word');
        if (this.qnaAnswers.hobby) explanationParts.push('your hobby');
        
        passwordExplanation.textContent = `This password combines ${explanationParts.join(', ')}, modified numbers, and symbols to create something both secure and memorable for you.`;
        
        generatedPasswordDiv.style.display = 'block';
        generatedPasswordDiv.scrollIntoView({ behavior: 'smooth' });
    }

    async copyToClipboard() {
        const resultPassword = document.getElementById('resultPassword');
        const copyButton = document.getElementById('copyPassword');
        
        try {
            await navigator.clipboard.writeText(resultPassword.value);
            
            // Visual feedback
            const originalHTML = copyButton.innerHTML;
            copyButton.innerHTML = '<i class="fas fa-check"></i>';
            copyButton.style.background = '#10b981';
            
            setTimeout(() => {
                copyButton.innerHTML = originalHTML;
                copyButton.style.background = '';
            }, 2000);
            
        } catch (err) {
            console.error('Failed to copy password:', err);
            // Fallback: select the text
            resultPassword.select();
            resultPassword.setSelectionRange(0, 99999);
        }
    }

    testGeneratedPassword() {
        const resultPassword = document.getElementById('resultPassword');
        const passwordInput = document.getElementById('password');
        
        // Set the generated password in the main input
        passwordInput.value = resultPassword.value;
        
        // Trigger password analysis
        this.handlePasswordInput({ target: passwordInput });
        
        // Scroll to the top
        document.querySelector('.password-section').scrollIntoView({ behavior: 'smooth' });
        
        // Focus on the password input
        passwordInput.focus();
    }
}

// Initialize the application
const passGuard = new PassGuard();

// Add some utility functions for better UX
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to focus password input
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('password').focus();
        }
        
        // Escape to clear password input
        if (e.key === 'Escape') {
            const passwordInput = document.getElementById('password');
            if (document.activeElement === passwordInput) {
                passwordInput.value = '';
                passGuard.resetStrengthMeter();
            }
        }
    });

    // Add password input placeholder animation
    const passwordInput = document.getElementById('password');
    const placeholders = [
        'Type your password here...',
        'Make it strong and unique...',
        'Try mixing letters, numbers & symbols...',
        'Length matters for security...'
    ];
    
    let placeholderIndex = 0;
    setInterval(() => {
        if (passwordInput.value === '' && document.activeElement !== passwordInput) {
            passwordInput.placeholder = placeholders[placeholderIndex];
            placeholderIndex = (placeholderIndex + 1) % placeholders.length;
        }
    }, 3000);
});

// Add some Easter eggs and fun interactions
let konamiCode = [];
const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

document.addEventListener('keydown', function(e) {
    konamiCode.push(e.code);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        // Easter egg: Show a fun message
        const title = document.querySelector('.title');
        title.innerHTML = '<i class="fas fa-shield-alt"></i> 🎉 PassGuard Pro Unlocked! 🎉';
        title.style.animation = 'pulse 1s infinite';
        
        setTimeout(() => {
            title.innerHTML = '<i class="fas fa-shield-alt"></i> PassGuard';
            title.style.animation = '';
        }, 5000);
        
        konamiCode = [];
    }
});
