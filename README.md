# KeysRace - Modern Typing Experience

A revolutionary typing test application that transforms traditional typing practice into an engaging, AI-powered learning experience. Built with modern web technologies to provide the most comprehensive typing improvement platform available.

## 🚀 Live Demo

**Production URL:** [https://keysrace.com](https://keysrace.com)

## ✨ Key Features

### 🎮 **Gamified Learning Experience**
- Interactive typing challenges with badges and achievements
- Real-time multiplayer racing competitions
- Progress tracking with visual heatmaps
- Streak counters and performance celebrations

### 🤖 **AI-Powered Coaching**
- Personalized insights based on typing patterns
- Adaptive difficulty adjustment
- Weakness identification and targeted practice
- Performance prediction and goal setting

### 📊 **Advanced Analytics**
- Real-time WPM and accuracy tracking
- Advanced metrics: consistency, rhythm, burst speed
- Detailed error analysis and improvement suggestions
- Historical performance tracking and trends

### 🎯 **Comprehensive Test Modes**
- **Timed Tests**: 15 seconds to 2 minutes
- **Word-Based Tests**: 25 to 200 words
- **Multiple Categories**: Quotes, code, literature, news
- **Custom Text Input**: Practice with your own content

### 🌐 **Modern Web Technologies**
- Progressive Web App (PWA) with offline support
- Real-time performance monitoring with Web Vitals
- Responsive design for desktop, tablet, and mobile
- Advanced error boundaries and performance optimization

### 🎨 **Premium User Experience**
- Smooth 60fps animations and transitions
- Virtual keyboard with real-time accuracy visualization
- Dark theme with beautiful gradients
- Accessibility features for inclusive design

## 🛠️ Technical Stack

### **Frontend**
- **React 18** with TypeScript for type safety
- **Framer Motion** for smooth animations
- **Tailwind CSS** with custom design system
- **Vite** for fast development and building

### **Backend & Database**
- **Supabase** for authentication and real-time database
- **PostgreSQL** with Row Level Security (RLS)
- **Edge Functions** for serverless API endpoints
- **Real-time subscriptions** for multiplayer features

### **AI Integration**
- **Multiple AI Providers**: OpenAI, Anthropic, Google Gemini, Cohere
- **Smart Provider Selection** based on task complexity and cost
- **Intelligent Caching** to optimize performance and reduce costs
- **Fallback Support** for high availability

### **Performance & Monitoring**
- **Web Vitals** tracking for Core Web Vitals
- **Real-time performance monitoring**
- **Comprehensive error boundary system**
- **Memory usage optimization**

### **Progressive Web App**
- **Service Worker** for offline functionality
- **App Manifest** for installability
- **Push Notifications** for engagement
- **Background Sync** for data persistence

## 🎯 Target Audience

### **Students**
Improve typing skills for academic success and digital literacy

### **Professionals**
Enhance productivity in remote work environments and increase efficiency

### **Developers**
Practice code typing, special characters, and programming syntax

### **Organizations**
Corporate training programs and skill assessment tools

## 🏗️ Architecture Overview

### **Database Schema**
- **Users**: Extended profiles with premium status tracking
- **Typing Results**: Comprehensive test result storage
- **Multiplayer Rooms**: Real-time game session management
- **Leaderboards**: Global ranking system across multiple timeframes
- **AI Analytics**: Cache performance and usage tracking

### **Security Features**
- **Row Level Security (RLS)** on all database tables
- **JWT Authentication** with Supabase Auth
- **API Rate Limiting** and quota management
- **Secure Edge Functions** for sensitive operations

### **Real-time Features**
- **WebSocket Connections** for multiplayer racing
- **Live Progress Updates** during typing tests
- **Real-time Leaderboard Updates**
- **Instant Performance Feedback**

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ and npm
- Supabase account for backend services
- Environment variables configured

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/keysrace.git
   cd keysrace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

### **Environment Configuration**

Create a `.env` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Provider API Keys (optional)
VITE_OPENAI_API_KEY=your-openai-key
VITE_ANTHROPIC_API_KEY=your-anthropic-key
VITE_GOOGLE_AI_API_KEY=your-google-ai-key

# Stripe Configuration (for premium features)
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Application URL
VITE_APP_URL=http://localhost:5173
```

## 📱 Progressive Web App

KeysRace is built as a Progressive Web App, offering:

- **Offline Functionality**: Practice typing even without internet
- **Install Prompt**: Add to home screen on mobile and desktop
- **Fast Loading**: Optimized caching and performance
- **Native Feel**: App-like experience across all platforms

## 🎮 Game Features

### **Typing Challenges**
- Speed challenges with WPM targets
- Accuracy challenges with precision goals
- Endurance challenges for sustained typing
- Code typing challenges for developers

### **Multiplayer Racing**
- Real-time races with up to 4 players
- Global matchmaking system
- Private rooms for friends and teams
- Tournament-style competitions

### **Achievement System**
- Unlock badges for various milestones
- Track personal records and improvements
- Share achievements on social media
- Compete on global leaderboards

## 🤖 AI Coaching System

### **Personalized Analysis**
- Identify specific weaknesses in typing patterns
- Recognize strengths and build upon them
- Generate custom practice texts
- Provide targeted improvement suggestions

### **Smart Recommendations**
- Adaptive difficulty based on performance
- Personalized lesson plans
- Goal setting and progress tracking
- Performance prediction algorithms

### **Multi-Provider Support**
- Automatic provider selection for optimal results
- Cost-effective AI usage with intelligent caching
- Fallback support for high availability
- Usage analytics and optimization

## 📊 Analytics & Insights

### **Performance Metrics**
- Words Per Minute (WPM) tracking
- Accuracy percentage monitoring
- Consistency score calculation
- Error pattern analysis

### **Advanced Analytics**
- Keystroke timing analysis
- Rhythm and flow assessment
- Burst speed measurements
- Progress trend visualization

### **Historical Data**
- Long-term performance tracking
- Improvement trend analysis
- Personal best records
- Comparative statistics

## 🔒 Privacy & Security

### **Data Protection**
- Local storage for typing results
- Encrypted data transmission
- GDPR compliance
- User data control and deletion

### **Authentication**
- Secure JWT-based authentication
- Email/password and social login options
- Session management and security
- Account recovery systems

## 🌟 Premium Features

### **AI Coaching**
- Advanced AI-powered analysis
- Personalized coaching recommendations
- Custom lesson generation
- Performance prediction

### **Multiplayer Access**
- Real-time racing competitions
- Private room creation
- Tournament participation
- Advanced matchmaking

### **Enhanced Analytics**
- Detailed performance reports
- Historical trend analysis
- Export capabilities
- Advanced visualizations

## 🤝 Contributing

We welcome contributions from the community! Please read our contributing guidelines and code of conduct before submitting pull requests.

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### **Code Standards**
- TypeScript for type safety
- ESLint and Prettier for code formatting
- Comprehensive error handling
- Performance optimization
- Accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for providing the backend infrastructure
- **Framer Motion** for beautiful animations
- **Tailwind CSS** for the design system
- **React** and **TypeScript** for the development framework
- **All contributors** who help improve KeysRace

## 📞 Support

- **Documentation**: [docs.keysrace.com](https://docs.keysrace.com)
- **Email Support**: support@keysrace.com
- **Community**: [Discord Server](https://discord.gg/keysrace)
- **Bug Reports**: [GitHub Issues](https://github.com/your-username/keysrace/issues)

---

**Transform your typing skills with KeysRace - where technology meets learning.**

*Built with ❤️ for typing enthusiasts worldwide.*