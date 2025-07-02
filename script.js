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
                id: 'user_name',
                question: '👤 What\'s your first name or nickname?',
                type: 'text',
                placeholder: 'e.g., Alex, Sam, Johnny...'
            },
            {
                id: 'favorite_anime',
                question: '🎌 What\'s your favorite anime or manga?',
                type: 'text',
                placeholder: 'e.g., Naruto, One Piece, Attack on Titan...'
            },
            {
                id: 'favorite_superhero',
                question: '🦸 Who\'s your favorite superhero?',
                type: 'options',
                options: ['Batman', 'Superman', 'Spider-Man', 'Wonder Woman', 'Iron Man', 'Captain America', 'Thor', 'Hulk', 'Flash', 'Other']
            },
            {
                id: 'pet_name',
                question: '🐕 What\'s your pet\'s name (or a pet you\'d like to have)?',
                type: 'text',
                placeholder: 'e.g., Buddy, Luna, Max, Bella...'
            },
            {
                id: 'lucky_number',
                question: '🔢 What\'s your lucky number or favorite number?',
                type: 'text',
                placeholder: 'e.g., 7, 13, 42, 99...'
            },
            {
                id: 'birth_year',
                question: '📅 What year were you born? (We\'ll scramble it for security)',
                type: 'text',
                placeholder: 'e.g., 1995, 2000, 1988...'
            },
            {
                id: 'favorite_food',
                question: '🍕 What\'s your favorite food or snack?',
                type: 'text',
                placeholder: 'e.g., Pizza, Sushi, Chocolate...'
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
                this.updateNavigationButtons(); // Update buttons when typing
            });
            
            // Also update on Enter key
            textInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && this.qnaAnswers[question.id] && this.qnaAnswers[question.id].trim() !== '') {
                    if (this.currentQuestionIndex === this.questions.length - 1) {
                        this.generatePersonalizedPassword();
                    } else {
                        this.nextQuestion();
                    }
                }
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
        
        // Auto-advance after selection (optional - makes it smoother)
        setTimeout(() => {
            if (this.currentQuestionIndex === this.questions.length - 1) {
                // Last question - show generate button
                const generateButton = document.getElementById('generatePassword');
                if (generateButton) {
                    generateButton.style.display = 'inline-flex';
                }
            } else {
                // Auto-advance to next question after 1 second
                setTimeout(() => {
                    this.nextQuestion();
                }, 1000);
            }
        }, 100);
    }

    updateNavigationButtons() {
        const prevButton = document.getElementById('prevQuestion');
        const nextButton = document.getElementById('nextQuestion');
        const generateButton = document.getElementById('generatePassword');

        if (!prevButton || !nextButton || !generateButton) {
            console.error('Navigation buttons not found');
            return;
        }

        // Show/hide previous button
        prevButton.style.display = this.currentQuestionIndex > 0 ? 'inline-flex' : 'none';

        // Show/hide next/generate buttons
        const isLastQuestion = this.currentQuestionIndex === this.questions.length - 1;
        const currentQuestion = this.questions[this.currentQuestionIndex];
        const hasAnswer = this.qnaAnswers[currentQuestion.id] && this.qnaAnswers[currentQuestion.id].trim() !== '';

        console.log('Current question:', this.currentQuestionIndex, 'Has answer:', hasAnswer, 'Is last:', isLastQuestion);

        if (isLastQuestion) {
            nextButton.style.display = 'none';
            generateButton.style.display = hasAnswer ? 'inline-flex' : 'none';
        } else {
            nextButton.style.display = hasAnswer ? 'inline-flex' : 'none';
            generateButton.style.display = 'none';
        }

        // Always show Next button initially to allow progression
        if (!hasAnswer && this.currentQuestionIndex === 0) {
            nextButton.style.display = 'inline-flex';
            nextButton.textContent = 'Skip';
        } else if (hasAnswer) {
            nextButton.textContent = 'Next';
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
        const symbols = ['!', '@', '#', '$', '%', '&', '*', '+', '=', '?'];
        const separators = ['_', '-', '.'];
        
        // Extract and process components from answers
        Object.entries(this.qnaAnswers).forEach(([key, value]) => {
            if (value && value.trim()) {
                switch (key) {
                    case 'user_name':
                        // Use first 3-4 letters of name, capitalize first letter
                        const name = value.trim().replace(/\s+/g, '');
                        components.push(this.capitalizeFirst(name.substring(0, Math.min(4, name.length))));
                        break;
                    case 'favorite_anime':
                        // Take first word or abbreviation
                        const anime = value.trim().split(' ')[0];
                        components.push(this.capitalizeFirst(anime.substring(0, Math.min(5, anime.length))));
                        break;
                    case 'favorite_superhero':
                        // Use abbreviation or short form
                        const hero = value.trim();
                        if (hero.includes('-')) {
                            // For Spider-Man, etc.
                            components.push(hero.split('-').map(part => part[0]).join('').toUpperCase());
                        } else {
                            components.push(hero.substring(0, Math.min(4, hero.length)));
                        }
                        break;
                    case 'pet_name':
                        components.push(this.capitalizeFirst(value.trim().substring(0, Math.min(5, value.trim().length))));
                        break;
                    case 'lucky_number':
                        components.push(value.toString());
                        break;
                    case 'birth_year':
                        // Scramble birth year for security
                        const year = value.toString();
                        const scrambled = year.split('').sort(() => Math.random() - 0.5).join('');
                        components.push(scrambled);
                        break;
                    case 'favorite_food':
                        const food = value.trim().replace(/\s+/g, '');
                        components.push(this.capitalizeFirst(food.substring(0, Math.min(4, food.length))));
                        break;
                }
            }
        });

        // Add complexity elements
        components.push(symbols[Math.floor(Math.random() * symbols.length)]);
        components.push(Math.floor(Math.random() * 999).toString().padStart(2, '0'));
        
        // Add a separator for readability
        const separator = separators[Math.floor(Math.random() * separators.length)];
        
        // Create multiple password variations
        const passwords = this.createPasswordVariations(components, separator, symbols);
        
        // Show generated passwords
        this.showGeneratedPasswords(passwords);
    }

    createPasswordVariations(components, separator, symbols) {
        const variations = [];
        
        // Variation 1: Simple concatenation with symbol at end
        const simple = components.join('') + symbols[Math.floor(Math.random() * symbols.length)];
        variations.push({
            password: simple,
            description: 'Simple combination of your personal elements'
        });
        
        // Variation 2: Separated with random separator
        const separated = components.join(separator) + symbols[Math.floor(Math.random() * symbols.length)];
        variations.push({
            password: separated,
            description: 'Separated format for better readability'
        });
        
        // Variation 3: Mixed case with numbers interspersed
        const mixed = this.createMixedCasePassword(components, symbols);
        variations.push({
            password: mixed,
            description: 'Mixed case with enhanced security'
        });
        
        // Variation 4: Leetspeak version
        const leetspeak = this.createLeetspeakPassword(components, symbols);
        variations.push({
            password: leetspeak,
            description: 'Leetspeak version (replaces some letters with numbers)'
        });
        
        return variations;
    }
    
    createMixedCasePassword(components, symbols) {
        let password = '';
        components.forEach((component, index) => {
            if (index % 2 === 0) {
                password += component.toLowerCase();
            } else {
                password += component.toUpperCase();
            }
            if (index < components.length - 1) {
                password += Math.floor(Math.random() * 10);
            }
        });
        return password + symbols[Math.floor(Math.random() * symbols.length)];
    }
    
    createLeetspeakPassword(components, symbols) {
        const leetMap = {
            'a': '4', 'e': '3', 'i': '1', 'o': '0', 's': '5', 't': '7', 'l': '1'
        };
        
        let password = components.join('');
        Object.entries(leetMap).forEach(([letter, number]) => {
            password = password.replace(new RegExp(letter, 'gi'), number);
        });
        
        return password + symbols[Math.floor(Math.random() * symbols.length)];
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    showGeneratedPasswords(passwords) {
        const generatedPasswordDiv = document.getElementById('generatedPassword');
        const resultPasswordInput = document.getElementById('resultPassword');
        const passwordExplanation = document.getElementById('passwordExplanation');

        // Create a container for multiple password options
        let passwordOptionsHTML = '<div class="password-options">';
        
        passwords.forEach((passObj, index) => {
            const isSelected = index === 0 ? 'selected' : '';
            passwordOptionsHTML += `
                <div class="password-option ${isSelected}" data-password="${passObj.password}" data-description="${passObj.description}">
                    <div class="password-display">
                        <input type="text" value="${passObj.password}" readonly class="password-option-input">
                        <button class="btn-copy-option" onclick="passGuard.copyPasswordOption('${passObj.password}')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <p class="password-option-description">${passObj.description}</p>
                    <div class="password-strength-preview" id="strength-preview-${index}"></div>
                </div>
            `;
        });
        
        passwordOptionsHTML += '</div>';
        
        // Update the generated password section
        const newHTML = `
            <h3>🎉 Your personalized password options:</h3>
            ${passwordOptionsHTML}
            <div class="password-selection">
                <p>Click on any password to select it, then test its strength!</p>
                <button class="btn btn-primary" id="testSelectedPassword">Test Selected Password</button>
            </div>
        `;
        
        generatedPasswordDiv.innerHTML = newHTML;
        
        // Set the first password as default
        resultPasswordInput.value = passwords[0].password;
        
        // Create explanation
        const explanationParts = [];
        if (this.qnaAnswers.user_name) explanationParts.push('your name');
        if (this.qnaAnswers.favorite_anime) explanationParts.push('your favorite anime');
        if (this.qnaAnswers.favorite_superhero) explanationParts.push('your favorite superhero');
        if (this.qnaAnswers.pet_name) explanationParts.push('your pet\'s name');
        if (this.qnaAnswers.favorite_food) explanationParts.push('your favorite food');
        
        passwordExplanation.textContent = `These passwords combine ${explanationParts.join(', ')}, scrambled numbers, and symbols to create something both secure and memorable for you.`;
        
        // Add click handlers for password options
        document.querySelectorAll('.password-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.password-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                resultPasswordInput.value = option.dataset.password;
            });
        });
        
        // Add handler for test button
        document.getElementById('testSelectedPassword').addEventListener('click', () => {
            this.testGeneratedPassword();
        });
        
        // Show strength preview for each password
        passwords.forEach((passObj, index) => {
            if (typeof zxcvbn !== 'undefined') {
                const result = zxcvbn(passObj.password);
                const strengthPreview = document.getElementById(`strength-preview-${index}`);
                const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
                const strengthColors = ['#ef4444', '#ff6b6b', '#f59e0b', '#4ecdc4', '#10b981'];
                
                strengthPreview.innerHTML = `
                    <div class="mini-strength-bar" style="background: ${strengthColors[result.score]}; width: ${((result.score + 1) / 5) * 100}%"></div>
                    <span class="mini-strength-label" style="color: ${strengthColors[result.score]}">${strengthLevels[result.score]}</span>
                `;
            }
        });
        
        generatedPasswordDiv.style.display = 'block';
        generatedPasswordDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    copyPasswordOption(password) {
        navigator.clipboard.writeText(password).then(() => {
            // Show success feedback
            const event = new CustomEvent('passwordCopied');
            document.dispatchEvent(event);
        }).catch(err => {
            console.error('Failed to copy password:', err);
        });
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
