import {
  cryptoTracker,
  fylo,
  giphy,
  greatWave,
  guitar,
  offering,
  poe,
  pokebattles,
  record,
  slushy,
  snake,
  sp,
  startpage,
  tradingPost,
  youtubeDl,
} from '../utils/svgs'

export interface ProjectDisplayMeta {
  category: string
  icon: string
  image: string
  technologies: string[]
  accent: string
  description: string
}

export const projectDisplayMeta: Record<string, ProjectDisplayMeta> = {
  'Youtube Subscription Downloader': {
    category: 'Tool',
    icon: 'YT',
    image: youtubeDl,
    technologies: ['Electron', 'JavaScript', 'YouTube API'],
    accent: 'red',
    description: 'Download videos from your YouTube subscriptions with ease.',
  },
  'PoE Wishlist': {
    category: 'Web App',
    icon: 'POE',
    image: poe,
    technologies: ['Ruby', 'Rails', 'PostgreSQL'],
    accent: 'violet',
    description: 'Track and manage your Path of Exile item wishlists.',
  },
  'Slushy.gg': {
    category: 'Web App',
    icon: 'SL',
    image: slushy,
    technologies: ['Next.js', 'Tailwind', 'PostgreSQL'],
    accent: 'cyan',
    description: 'A polished web app with modern product patterns.',
  },
  'My Guitar Site': {
    category: 'Web App',
    icon: 'GT',
    image: guitar,
    technologies: ['Gatsby', 'GraphQL', 'Netlify'],
    accent: 'orange',
    description: 'A music-focused web experience built with Gatsby.',
  },
  'The Offering': {
    category: 'Web App',
    icon: 'OF',
    image: offering,
    technologies: ['Ruby', 'Rails', 'PostgreSQL'],
    accent: 'yellow',
    description: 'A Rails application with a focused product workflow.',
  },
  Portfolio: {
    category: 'Web App',
    icon: 'SP',
    image: sp,
    technologies: ['Gatsby', 'TypeScript', 'CSS'],
    accent: 'blue',
    description: 'The current SPDEVUK portfolio and writing platform.',
  },
  'Linux Screen Recorder': {
    category: 'Tool',
    icon: 'LR',
    image: record,
    technologies: ['Rust', 'FFmpeg', 'GTK'],
    accent: 'blue',
    description: 'A Linux desktop recording tool for quick captures.',
  },
  Pokebattles: {
    category: 'Web App',
    icon: 'PB',
    image: pokebattles,
    technologies: ['React', 'TypeScript', 'Node.js'],
    accent: 'red',
    description: 'A playful web app experiment with battle mechanics.',
  },
  Fylo: {
    category: 'Web App',
    icon: 'FY',
    image: fylo,
    technologies: ['JavaScript', 'Sass', 'Firebase'],
    accent: 'cyan',
    description: 'A file-sharing themed frontend build.',
  },
  'Giphy Finder': {
    category: 'API',
    icon: 'GF',
    image: giphy,
    technologies: ['JavaScript', 'GIPHY API'],
    accent: 'green',
    description: 'A small API-powered search tool for GIF discovery.',
  },
  'Old Portfolio': {
    category: 'Web App',
    icon: 'OP',
    image: sp,
    technologies: ['HTML', 'CSS', 'JavaScript'],
    accent: 'violet',
    description: 'A previous iteration of the portfolio.',
  },
  'Elixir Snake Game': {
    category: 'Game',
    icon: 'SG',
    image: snake,
    technologies: ['Elixir', 'Phoenix', 'LiveView'],
    accent: 'purple',
    description: 'A browser game experiment using the Elixir stack.',
  },
  'Ruby Wallpaper Scraper': {
    category: 'Tool',
    icon: 'RW',
    image: greatWave,
    technologies: ['Ruby', 'Nokogiri', 'Sidekiq'],
    accent: 'red',
    description: 'A scraper for collecting wallpaper assets.',
  },
  'Crypto Tracker': {
    category: 'Web App',
    icon: 'CT',
    image: cryptoTracker,
    technologies: ['React', 'Chart.js', 'CoinGecko API'],
    accent: 'green',
    description: 'Track cryptocurrency prices with a lightweight UI.',
  },
  Startpage: {
    category: 'Web App',
    icon: 'ST',
    image: startpage,
    technologies: ['HTML', 'CSS', 'JavaScript'],
    accent: 'blue',
    description: 'A custom browser start page.',
  },
  'Dance Gavin Dance': {
    category: 'Experiment',
    icon: 'DG',
    image: guitar,
    technologies: ['Gatsby', 'GraphQL', 'Netlify'],
    accent: 'purple',
    description: 'A fan-site experiment for music content.',
  },
  TradingPost: {
    category: 'Web App',
    icon: 'TP',
    image: tradingPost,
    technologies: ['Ruby', 'Rails', 'PostgreSQL'],
    accent: 'yellow',
    description: 'A trading workflow web application.',
  },
  'Trading Post': {
    category: 'Web App',
    icon: 'TP',
    image: tradingPost,
    technologies: ['Ruby', 'Rails', 'PostgreSQL'],
    accent: 'yellow',
    description: 'A trading workflow web application.',
  },
}

export const getProjectMeta = (title: string): ProjectDisplayMeta =>
  projectDisplayMeta[title] || {
    category: 'Experiment',
    icon: title
      .split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    image: sp,
    technologies: ['JavaScript', 'CSS'],
    accent: 'blue',
    description: 'A shipped project from the SPDEVUK archive.',
  }

export const blogTypeLabels: Record<string, string> = {
  ai: 'AI',
  javascript: 'JavaScript',
  react: 'React',
  money: 'Finance',
  digitalocean: 'Web Dev',
  career: 'Career',
  web: 'Web Dev',
}

export const getBlogTypeLabel = (type?: string) =>
  type ? blogTypeLabels[type] || type : 'Web Dev'
