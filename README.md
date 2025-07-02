# 🛡️ PassGuard - Password Strength Checker

A comprehensive, responsive web application that helps users create strong, memorable passwords with real-time security analysis.

## ✨ Features

### 🔍 Real-time Password Analysis
- **Strength Meter**: Visual progress bar with color-coded feedback
- **Security Score**: Powered by the zxcvbn library for accurate strength assessment
- **Emoji Feedback**: Fun visual indicators (🔴 Very Weak → 🟢 Strong)
- **Crack Time Estimation**: Shows how long it would take to crack your password

### 🚨 Breach Detection
- **HaveIBeenPwned Integration**: Checks if your password has been compromised in data breaches
- **Privacy-First**: Uses k-anonymity to protect your password during checks
- **Real-time Warnings**: Instant alerts if your password has been breached

### 🧠 Interactive Password Builder
- **Personalized Q&A**: 7-question survey to create memorable passwords
- **Smart Generation**: Combines your answers into strong, unique passwords
- **Memory Aids**: Explains how your password was created for easy recall
- **One-click Testing**: Test generated passwords immediately

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Engaging transitions and micro-interactions
- **Dark Mode Support**: Automatic dark/light theme detection
- **Accessibility**: Keyboard shortcuts and screen reader friendly

### 🔧 Additional Features
- **Password Visibility Toggle**: Show/hide password with eye icon
- **Copy to Clipboard**: One-click password copying
- **Security Tips**: Educational content about password best practices
- **Loading States**: Visual feedback during API calls
- **Easter Eggs**: Hidden surprises for curious users! 🎉

## 🚀 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- Internet connection (for breach checking and external libraries)

### Installation
1. Clone or download the repository
2. Open `index.html` in your web browser
3. Start creating secure passwords!

### Files Structure
```
PassGuard/
├── index.html          # Main HTML structure
├── styles.css          # Responsive CSS with animations
├── script.js           # JavaScript functionality
└── README.md          # This file
```

## 🔒 Security & Privacy

### Data Protection
- **No Data Storage**: Passwords are never stored or transmitted to our servers
- **Client-Side Processing**: All password analysis happens in your browser
- **Secure API Calls**: Breach checking uses SHA-1 hashing with k-anonymity
- **HTTPS Required**: Breach checking only works over secure connections

### Third-Party Services
- **zxcvbn**: Dropbox's password strength estimation library
- **HaveIBeenPwned API**: Troy Hunt's breach detection service
- **Google Fonts**: Inter font family for typography
- **Font Awesome**: Icons for UI elements

## 🎯 How to Use

### Basic Password Checking
1. Type your password in the input field
2. Watch the real-time strength meter update
3. Review suggestions for improvement
4. Check for breach warnings

### Password Builder (Q&A)
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
