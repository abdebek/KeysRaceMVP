// Multilingual typing texts for 4 languages only
export const multilingualTexts = {
  en: {
    quotes: [
      "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
      "Innovation distinguishes between a leader and a follower. Stay hungry, stay foolish, and never stop learning.",
      "Success is not final, failure is not fatal: it is the courage to continue that counts. Keep moving forward."
    ],
    programming: [
      "function calculateSum(a, b) { return a + b; }",
      "const users = await fetch('/api/users').then(response => response.json());",
      "class Component extends React.Component { render() { return <div>Hello World</div>; } }"
    ],
    literature: [
      "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness.",
      "To be or not to be, that is the question: Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune.",
      "All happy families are alike; each unhappy family is unhappy in its own way."
    ]
  },
  tr: {
    quotes: [
      "Büyük işler yapmanın tek yolu, yaptığınız işi sevmektir. Henüz bulamadıysanız, aramaya devam edin. Yerleşmeyin.",
      "İnovasyon, bir lider ile bir takipçi arasındaki farkı yaratır. Aç kalın, aptal kalın ve öğrenmeyi asla bırakmayın.",
      "Başarı nihai değildir, başarısızlık ölümcül değildir: önemli olan devam etme cesaretidir. İlerlemeye devam edin."
    ],
    programming: [
      "function toplamHesapla(a, b) { return a + b; }",
      "const kullanicilar = await fetch('/api/kullanicilar').then(yanit => yanit.json());",
      "class Bileşen extends React.Component { render() { return <div>Merhaba Dünya</div>; } }"
    ],
    literature: [
      "En iyi zamanların ve en kötü zamanların dönemiydi, bilgelik çağı ve aptallık çağıydı.",
      "Olmak ya da olmamak, işte bütün mesele bu: Akılda katlanmak mı daha asil, talihsizliğin ok ve taşlarına.",
      "Bütün mutlu aileler birbirine benzer; mutsuz olan her aile kendine özgü bir biçimde mutsuztur."
    ]
  },
  es: {
    quotes: [
      "La única forma de hacer un gran trabajo es amar lo que haces. Si aún no lo has encontrado, sigue buscando. No te conformes.",
      "La innovación distingue entre un líder y un seguidor. Mantente hambriento, mantente tonto, y nunca dejes de aprender.",
      "El éxito no es definitivo, el fracaso no es fatal: es el coraje para continuar lo que cuenta. Sigue adelante."
    ],
    programming: [
      "function calcularSuma(a, b) { return a + b; }",
      "const usuarios = await fetch('/api/usuarios').then(respuesta => respuesta.json());",
      "class Componente extends React.Component { render() { return <div>Hola Mundo</div>; } }"
    ],
    literature: [
      "Era el mejor de los tiempos, era el peor de los tiempos, era la edad de la sabiduría, era la edad de la necedad.",
      "Ser o no ser, esa es la cuestión: Si es más noble para la mente sufrir las flechas y piedras de la fortuna ultrajante.",
      "Todas las familias felices se parecen; cada familia infeliz es infeliz a su manera."
    ]
  },
  fr: {
    quotes: [
      "La seule façon de faire du bon travail est d'aimer ce que vous faites. Si vous ne l'avez pas encore trouvé, continuez à chercher. Ne vous contentez pas de moins.",
      "L'innovation distingue un leader d'un suiveur. Restez affamé, restez fou, et n'arrêtez jamais d'apprendre.",
      "Le succès n'est pas définitif, l'échec n'est pas fatal : c'est le courage de continuer qui compte. Continuez d'avancer."
    ],
    programming: [
      "function calculerSomme(a, b) { return a + b; }",
      "const utilisateurs = await fetch('/api/utilisateurs').then(reponse => reponse.json());",
      "class Composant extends React.Component { render() { return <div>Bonjour le Monde</div>; } }"
    ],
    literature: [
      "C'était le meilleur des temps, c'était le pire des temps, c'était l'âge de la sagesse, c'était l'âge de la folie.",
      "Être ou ne pas être, telle est la question : S'il est plus noble pour l'esprit de souffrir les flèches et les pierres de la fortune outrageante.",
      "Toutes les familles heureuses se ressemblent ; chaque famille malheureuse est malheureuse à sa façon."
    ]
  }
};

export function getMultilingualText(language: string, category: string): string {
  const texts = multilingualTexts[language as keyof typeof multilingualTexts];
  if (!texts) {
    // Fallback to English if language not supported
    return getMultilingualText('en', category);
  }
  
  const categoryTexts = texts[category as keyof typeof texts];
  if (!categoryTexts || categoryTexts.length === 0) {
    // Fallback to quotes if category not found
    return getMultilingualText(language, 'quotes');
  }
  
  return categoryTexts[Math.floor(Math.random() * categoryTexts.length)];
}

export function getSupportedLanguages(): string[] {
  return Object.keys(multilingualTexts);
}