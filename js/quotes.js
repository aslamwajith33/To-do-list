// DAYFLOW - Motivational Quotes Collection (50+ Curated Quotes)
const MOTIVATIONAL_QUOTES = [
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln", category: "Discipline" },
  { text: "Small progress every day leads to big results.", author: "Satya Nani", category: "Consistency" },
  { text: "You don't have to be extreme, just consistent.", author: "Anonymous", category: "Consistency" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant", category: "Discipline" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier", category: "Consistency" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso", category: "Action" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "Focus" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "Action" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss", category: "Productivity" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki", category: "Growth" },
  { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin", category: "Persistence" },
  { text: "Great things are done by a series of small things brought together.", author: "Vincent Van Gogh", category: "Consistency" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt", category: "Mindset" },
  { text: "Motivation gets you going, but discipline keeps you growing.", author: "John C. Maxwell", category: "Discipline" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "Persistence" },
  { text: "You showed up today. That's what matters.", author: "DAYFLOW Wisdom", category: "Consistency" },
  { text: "Dream big, start small, but most of all, start.", author: "Simon Sinek", category: "Action" },
  { text: "Self-discipline begins with the mastery of your thoughts.", author: "Napoleon Hill", category: "Discipline" },
  { text: "Either you run the day or the day runs you.", author: "Jim Rohn", category: "Productivity" },
  { text: "The hard days are what make you stronger.", author: "Aly Raisman", category: "Strength" },
  { text: "Consistency is more important than perfection.", author: "Anonymous", category: "Consistency" },
  { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King", category: "Discipline" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery", category: "Growth" },
  { text: "Success isn't always about greatness. It's about consistency. Consistent hard work leads to success.", author: "Dwayne Johnson", category: "Consistency" },
  { text: "The difference between who you are and who you want to be is what you do.", author: "Bill Phillips", category: "Action" },
  { text: "Continuous improvement is better than delayed perfection.", author: "Mark Twain", category: "Growth" },
  { text: "If you get 1% better each day for one year, you'll end up 37 times better.", author: "James Clear", category: "Growth" },
  { text: "Discipline equals freedom.", author: "Jocko Willink", category: "Discipline" },
  { text: "What we fear doing most is usually what we most need to do.", author: "Tim Ferriss", category: "Courage" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle", category: "Habit" },
  { text: "A year from now you may wish you had started today.", author: "Karen Lamb", category: "Action" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali", category: "Focus" },
  { text: "The only bad workout is the one that didn't happen.", author: "Anonymous", category: "Action" },
  { text: "You will never always be motivated, so you must learn to be disciplined.", author: "Anonymous", category: "Discipline" },
  { text: "Mastering others is strength. Mastering yourself is true power.", author: "Lao Tzu", category: "Discipline" },
  { text: "Little by little, a little becomes a lot.", author: "Tanzanian Proverb", category: "Consistency" },
  { text: "Your daily routine will either build your future or hold you back.", author: "Anonymous", category: "Habit" },
  { text: "Courage doesn't always roar. Sometimes courage is the quiet voice at the end of the day saying, 'I will try again tomorrow.'", author: "Mary Anne Radmacher", category: "Persistence" },
  { text: "I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.", author: "Bruce Lee", category: "Mastery" },
  { text: "The miracle isn't that I finished. The miracle is that I had the courage to start.", author: "John Bingham", category: "Courage" },
  { text: "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort.", author: "Paul J. Meyer", category: "Productivity" },
  { text: "Focus is a muscle. The more you practice it, the stronger it gets.", author: "Anonymous", category: "Focus" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe", category: "Action" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser", category: "Growth" },
  { text: "Work hard in silence, let your success be your noise.", author: "Frank Ocean", category: "Hard Work" },
  { text: "Don't wish it were easier; wish you were better.", author: "Jim Rohn", category: "Growth" },
  { text: "Consistency transforms average into excellence.", author: "Anonymous", category: "Consistency" },
  { text: "One day or day one. You decide.", author: "Paulo Coelho", category: "Decision" },
  { text: "Everything is hard before it is easy.", author: "Johann Wolfgang von Goethe", category: "Learning" },
  { text: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius", category: "Consistency" },
  { text: "Show up every day with purpose, and watch how momentum builds your dreams.", author: "DAYFLOW Philosophy", category: "Discipline" },
  { text: "Never let what you cannot do interfere with what you can do.", author: "John Wooden", category: "Action" }
];

const CELEBRATION_QUOTES = [
  "Discipline is choosing what you want most over what you want now.",
  "Small progress every day leads to big results.",
  "You showed up today. That's what matters.",
  "Success is the sum of small efforts repeated daily.",
  "You conquered your daily goals today! Keep this momentum alive.",
  "Consistency is your superpower. Another great day in the books!"
];

class QuoteManager {
  constructor() {
    this.lastQuoteIndex = -1;
  }

  getRandomQuote() {
    let index;
    do {
      index = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    } while (index === this.lastQuoteIndex && MOTIVATIONAL_QUOTES.length > 1);
    
    this.lastQuoteIndex = index;
    return MOTIVATIONAL_QUOTES[index];
  }

  getDailyQuote() {
    // Deterministic quote based on day of year, so it stays consistent for the day until refreshed
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const index = dayOfYear % MOTIVATIONAL_QUOTES.length;
    this.lastQuoteIndex = index;
    return MOTIVATIONAL_QUOTES[index];
  }

  getCelebrationQuote() {
    const index = Math.floor(Math.random() * CELEBRATION_QUOTES.length);
    return CELEBRATION_QUOTES[index];
  }
}

window.quoteManager = new QuoteManager();
window.MOTIVATIONAL_QUOTES = MOTIVATIONAL_QUOTES;
window.CELEBRATION_QUOTES = CELEBRATION_QUOTES;
