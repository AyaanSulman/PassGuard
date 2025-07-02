# 🛡️ PassGuard - Advanced Password Strength Checker

<div align="center">

![PassGuard Logo](https://img.shields.io/badge/🛡️-PassGuard-6366f1?style=for-the-badge&labelColor=4f46e5)

**A modern, intelligent web application for password strength analysis and secure password generation**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](#)
[![Responsive](https://img.shields.io/badge/Responsive-✅-green?style=flat-square)](#)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple?style=flat-square)](#)

[🚀 Live Demo](#installation) • [📖 Documentation](#usage) • [🤝 Contributing](#contributing)

</div>

---

## ✨ Features

### 🔍 **Real-Time Password Analysis**
- **Industry-Standard Assessment** using zxcvbn library (used by Dropbox, WordPress, etc.)
- **Visual Feedback System** with color-coded strength meters and emoji indicators
- **Crack Time Estimation** showing realistic attack scenarios
- **Breach Detection** via HaveIBeenPwned API with privacy-preserving k-anonymity
- **Actionable Suggestions** for password improvement

### 🎯 **Intelligent Password Builder**
- **Personalized Q&A System** with 7 carefully crafted questions
- **4 Password Variations** for each user profile:
  - 🔹 **Simple Combination** - Clean, readable format
  - 🔹 **Separated Format** - Enhanced with separators for memorability
  - 🔹 **Mixed Case** - Strategic capitalization with numbers
  - 🔹 **Leetspeak Version** - Advanced character substitution (a→4, e→3, etc.)
- **Smart Generation Algorithm** combining personal elements with cryptographic randomness
- **Strength Preview** for each generated password option

### 🎨 **Premium User Experience**
- **Fully Responsive Design** - Perfect on desktop, tablet, and mobile
- **Dark Mode Support** with automatic system preference detection
- **Smooth Animations** and micro-interactions
- **Keyboard Shortcuts** (Ctrl/Cmd+K to focus, Escape to clear, Enter to navigate)
- **Accessibility First** with ARIA labels and keyboard navigation
- **Progressive Web App** capabilities

### 🔒 **Privacy & Security**
- **Zero Data Storage** - Everything processed locally
- **No Server Dependencies** - Works completely offline after initial load
- **K-Anonymity Protection** - Breach checking without exposing your password
- **CSP Headers Ready** - Content Security Policy compliant

---

## 🚀 Quick Start

### Option 1: Local Development
```bash
# Clone the repository
git clone https://github.com/AyaanSulman/PassGuard.git
cd PassGuard

# Start local server (choose one)
python -m http.server 8000        # Python 3
python -m SimpleHTTPServer 8000   # Python 2
npx http-server                   # Node.js
php -S localhost:8000             # PHP

# Open browser
open http://localhost:8000
```

### Option 2: Direct File Access
```bash
# Download and extract
wget https://github.com/AyaanSulman/PassGuard/archive/main.zip
unzip main.zip
cd PassGuard-main

# Open index.html in your browser
1. Click "Start Password Builder"
2. Answer 7 personalized questions about:
   - Favorite places
   - Lucky numbers
   - Pet names
   - Hobbies
   - Birth year (modified for security)
   - Favorite colors
   - Meaningful words
3. Generate your personalized password
4. Test it in the main checker

### Keyboard Shortcuts
- `Ctrl/Cmd + K`: Focus password input
- `Escape`: Clear password input
- `Konami Code`: Unlock easter egg! ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA

## 🛠️ Technical Details

### Libraries Used
- **zxcvbn v4.4.2**: Password strength estimation
- **HaveIBeenPwned API v3**: Breach detection
- **Web Crypto API**: SHA-1 hashing for secure breach checks
- **CSS Grid & Flexbox**: Responsive layout
- **CSS Custom Properties**: Theme system

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

### Performance Features
- **Debounced API Calls**: Prevents excessive breach checking
- **Lazy Loading**: Optimized resource loading
- **CSS Animations**: Hardware-accelerated transitions
- **Responsive Images**: Optimized for all screen sizes

## 🎨 Customization

### Color Themes
The app uses CSS custom properties for easy theming:
```css
:root {
    --primary-color: #6366f1;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
}
```

### Adding Questions
To add new Q&A questions, modify the `questions` array in `script.js`:
```javascript
{
    id: 'new_question',
    question: '🎵 What\'s your favorite song?',
    type: 'text',
    placeholder: 'e.g., Bohemian Rhapsody...'
}
```

## 🤝 Contributing

We welcome contributions! Here are some ways you can help:
- Report bugs or suggest features
- Improve the UI/UX design
- Add new password generation algorithms
- Enhance accessibility features
- Translate to other languages

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Troy Hunt** for the HaveIBeenPwned service
- **Dropbox** for the zxcvbn library
- **The security community** for password best practices
- **All contributors** who help make passwords safer

## 🔗 Links

- [HaveIBeenPwned](https://haveibeenpwned.com/)
- [zxcvbn Library](https://github.com/dropbox/zxcvbn)
- [Password Security Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)

---

**Stay secure! 🛡️**

*PassGuard - Making strong passwords accessible to everyone.*
