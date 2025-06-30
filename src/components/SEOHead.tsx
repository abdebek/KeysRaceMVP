import React from 'react';

export function SEOHead() {
  React.useEffect(() => {
    // Update meta tags for better social sharing and hackathon visibility
    const updateMetaTag = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    const updateNameTag = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Open Graph tags
    updateMetaTag('og:title', 'KeysRace - World\'s Largest Hackathon Entry | AI-Powered Typing Coach');
    updateMetaTag('og:description', 'Revolutionary typing test app built with Bolt.new. Features AI coaching, real-time multiplayer, and gamified learning. Competing for multiple hackathon prizes!');
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:url', 'https://keysrace.waanfeetan.com');
    updateMetaTag('og:image', 'https://keysrace.waanfeetan.com/og-image.png');

    // Twitter Card tags
    updateNameTag('twitter:card', 'summary_large_image');
    updateNameTag('twitter:title', 'KeysRace - World\'s Largest Hackathon Entry');
    updateNameTag('twitter:description', 'AI-powered typing coach built with Bolt.new. Gamified learning, real-time multiplayer, and advanced analytics. #WorldsLargestHackathon');
    updateNameTag('twitter:image', 'https://keysrace.waanfeetan.com/og-image.png');

    // Additional meta tags for hackathon
    updateNameTag('description', 'KeysRace: Revolutionary typing test app built with Bolt.new for the World\'s Largest Hackathon. Features AI coaching, multiplayer racing, gamified challenges, and advanced analytics. Targeting multiple prize categories including Creative Use of AI, Most Beautiful UI, and Future Unicorn.');
    updateNameTag('keywords', 'typing test, AI coach, Bolt.new, hackathon, World\'s Largest Hackathon, WPM, typing speed, gamified learning, multiplayer, progressive web app, 2025');
    updateNameTag('author', 'KeysRace Team');
    updateNameTag('robots', 'index, follow');

    // Hackathon specific tags
    updateNameTag('hackathon', 'World\'s Largest Hackathon');
    updateNameTag('platform', 'Bolt.new');
    updateNameTag('category', 'Education, AI, Gaming, Productivity');

    // Update title
    document.title = 'KeysRace - World\'s Largest Hackathon Entry | AI-Powered Typing Coach';
  }, []);

  return null;
}