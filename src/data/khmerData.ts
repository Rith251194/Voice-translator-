import { VoiceOption, ToneOption, SamplePhrase } from '../types';

export const NATIVE_VOICES: VoiceOption[] = [
  {
    id: 'bopha',
    name: 'Bopha',
    khmerName: 'បុប្ផា (សំឡេងស្រីធម្មជាតិ)',
    gender: 'female',
    description: 'Natural, sweet, authentic Khmer female voice with standard articulation',
    badge: 'Female • ស្រីធម្មជាតិ',
    sampleText: 'ជំរាបសួរ! ខ្ញុំឈ្មោះបុប្ផា ជាសំឡេងស្រីធម្មជាតិ។',
  },
  {
    id: 'dara',
    name: 'Dara',
    khmerName: 'តារា (សំឡេងប្រុសពិតៗ)',
    gender: 'male',
    description: 'Authentic, warm, natural Khmer male voice with rich conversational cadence',
    badge: 'Male • ប្រុសពិតៗ',
    sampleText: 'ជំរាបសួរ! ខ្ញុំឈ្មោះតារា ជាសំឡេងប្រុសខ្មែរ។',
  },
  {
    id: 'sophea',
    name: 'Sophea',
    khmerName: 'សុភា (សំឡេងស្រីផ្លូវការ)',
    gender: 'female',
    description: 'Eloquent, clear broadcast & storytelling female voice for formal reading',
    badge: 'Female • ស្រីផ្លូវការ',
    sampleText: 'ជំរាបសួរ! ខ្ញុំឈ្មោះសុភា សូមស្វាគមន៍មកកាន់ព័ត៌មាន។',
  },
  {
    id: 'piseth',
    name: 'Piseth',
    khmerName: 'ពិសិដ្ឋ (សំឡេងប្រុសអត្ថាធិប្បាយ)',
    gender: 'male',
    description: 'Deep, resonant, authoritative male narration voice for announcements',
    badge: 'Male • ប្រុសអត្ថាធិប្បាយ',
    sampleText: 'ជំរាបសួរ! ខ្ញុំឈ្មោះពិសិដ្ឋ ជាសំឡេងប្រុសអត្ថាធិប្បាយ។',
  },
];

export const GEMINI_VOICES: VoiceOption[] = [
  {
    id: 'Kore',
    name: 'Kore',
    khmerName: 'កូរ៉េ (នារីស្រទន់)',
    gender: 'female',
    description: 'Clear, poised, balanced female voice with excellent articulation',
    badge: 'Female • Clear',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    khmerName: 'សេហ្វៀ (នារីកក់ក្តៅ)',
    gender: 'female',
    description: 'Warm, empathetic, melodic tone ideal for conversational speech',
    badge: 'Female • Warm',
  },
  {
    id: 'Puck',
    name: 'Puck',
    khmerName: 'ផាក់ (យុវជនរួសរាយ)',
    gender: 'male',
    description: 'Youthful, vibrant, energetic male voice suited for bright delivery',
    badge: 'Male • Bright',
  },
  {
    id: 'Charon',
    name: 'Charon',
    khmerName: 'ការ៉ុន (បុរសមានអំណាច)',
    gender: 'male',
    description: 'Deep, resonant, authoritative male voice for announcements and news',
    badge: 'Male • Deep',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    khmerName: 'ហ្វេនរៀ (បុរសរឹងមាំ)',
    gender: 'male',
    description: 'Crisp, bold, commanding male timbre with steady cadence',
    badge: 'Male • Strong',
  },
];

export const TONE_OPTIONS: ToneOption[] = [
  {
    id: 'natural',
    label: 'Natural',
    khmerLabel: 'ធម្មជាតិ',
    description: 'Everyday conversational speaking style',
  },
  {
    id: 'formal',
    label: 'Formal / News',
    khmerLabel: 'ផ្លូវការ / ព័ត៌មាន',
    description: 'Articulate broadcasting delivery',
  },
  {
    id: 'storytelling',
    label: 'Storytelling',
    khmerLabel: 'និទានរឿង',
    description: 'Gentle narrative cadence with warmth',
  },
  {
    id: 'cheerful',
    label: 'Cheerful',
    khmerLabel: 'រីករាយ',
    description: 'Uplifting and spirited tone',
  },
  {
    id: 'calm',
    label: 'Calm',
    khmerLabel: 'ស្ងប់ស្ងាត់',
    description: 'Relaxed, peaceful and soothing',
  },
];

export const SAMPLE_PHRASES: SamplePhrase[] = [
  {
    id: 'g1',
    category: 'greetings',
    categoryLabel: 'Greetings (ការគួរសម)',
    khmer: 'ជំរាបសួរ! តើអ្នកសុខសប្បាយជាទេ?',
    english: 'Hello! How are you doing?',
    phonetic: 'Choum reap sour! Tae neak sok sabay te?',
  },
  {
    id: 'g2',
    category: 'greetings',
    categoryLabel: 'Greetings (ការគួរសម)',
    khmer: 'សួស្តី! អរុណសួស្តី និងទិវាសួស្តី។',
    english: 'Hi! Good morning and good day.',
    phonetic: 'Sousdey! Arun sousdey ning tivea sousdey.',
  },
  {
    id: 'g3',
    category: 'greetings',
    categoryLabel: 'Greetings (ការគួរសម)',
    khmer: 'អរគុណច្រើនសម្រាប់ការជួយនិងការគាំទ្ររបស់អ្នក។',
    english: 'Thank you very much for your help and support.',
    phonetic: 'Orkun chreun samrap kar chouy ning kar komtro roboh neak.',
  },
  {
    id: 'd1',
    category: 'daily',
    categoryLabel: 'Daily Conversation (សន្ទនាប្រចាំថ្ងៃ)',
    khmer: 'ថ្ងៃនេះអាកាសធាតុល្អណាស់ តើយើងគួរទៅដើរលេងនៅឯណា?',
    english: 'The weather is very nice today, where should we go for a walk?',
    phonetic: 'Thngay nih akas-theat l’or nah, tae yeung kuor tov daeu leng nov aena?',
  },
  {
    id: 'd2',
    category: 'daily',
    categoryLabel: 'Daily Conversation (សន្ទនាប្រចាំថ្ងៃ)',
    khmer: 'តើអ្នកចូលចិត្តញ៉ាំបាយជាមួយម្ហូបអ្វីនៅថ្ងៃនេះ?',
    english: 'What kind of food do you like to eat today?',
    phonetic: 'Tae neak chol-chet nham bay chea-mouy mhoub avei nov thngay nih?',
  },
  {
    id: 't1',
    category: 'tourism',
    categoryLabel: 'Culture & Tourism (វប្បធម៌ និងទេសចរណ៍)',
    khmer: 'សូមស្វាគមន៍មកកាន់ព្រះរាជាណាចក្រកម្ពុជា ដែលជាទឹកដីនៃភាពអស្ចារ្យ។',
    english: 'Welcome to the Kingdom of Cambodia, the land of wonder.',
    phonetic: 'Soum svakhom mok kan Preah Reacheanachak Kampuchea.',
  },
  {
    id: 't2',
    category: 'tourism',
    categoryLabel: 'Culture & Tourism (វប្បធម៌ និងទេសចរណ៍)',
    khmer: 'ប្រាសាទអង្គរវត្តគឺជាសម្បត្តិបេតិកភណ្ឌពិភពលោកដ៏អស្ចារ្យបំផុត។',
    english: 'Angkor Wat is the most magnificent world heritage site.',
    phonetic: 'Prasat Angkor Wat keu chea sombat beitikakphan piphop-lok dor oschar bomphot.',
  },
  {
    id: 'p1',
    category: 'proverbs',
    categoryLabel: 'Khmer Proverbs (សុភាសិតខ្មែរ)',
    khmer: 'ចេះដប់មិនស្មើប្រសប់មួយ។',
    english: 'Knowing ten things is not equal to being skilled at one.',
    phonetic: 'Cheh dop min smeu prasop mouy.',
  },
  {
    id: 'p2',
    category: 'proverbs',
    categoryLabel: 'Khmer Proverbs (សុភាសិតខ្មែរ)',
    khmer: 'ចូលស្ទឹងតាមបត់ ចូលស្រុកតាមទេស។',
    english: 'Follow the bend in the river, follow the customs of the land.',
    phonetic: 'Chol steung tam bot, chol srok tam tes.',
  },
  {
    id: 'n1',
    category: 'numbers',
    categoryLabel: 'Numbers & Counting (លេខ និងការរាប់)',
    khmer: 'មួយ ពីរ បី បួន ប្រាំ ប្រាំមួយ ប្រាំពីរ ប្រាំបី ប្រាំបួន ដប់',
    english: 'One, two, three, four, five, six, seven, eight, nine, ten.',
    phonetic: 'Mouy, pi, bei, buon, pram, pram-mouy, pram-pi, pram-bei, pram-buon, dop.',
  },
];

export interface KeyboardSection {
  title: string;
  khmerTitle: string;
  keys: string[];
}

export const KHMER_KEYBOARD_SECTIONS: KeyboardSection[] = [
  {
    title: 'Consonants (Series 1 & 2)',
    khmerTitle: 'ព្យញ្ជនៈ ៣៣ តួ',
    keys: [
      'ក', 'ខ', 'គ', 'ឃ', 'ង',
      'ច', 'ឆ', 'ជ', 'ឈ', 'ញ',
      'ដ', 'ឋ', 'ឌ', 'ឍ', 'ណ',
      'ត', 'ថ', 'ទ', 'ធ', 'ន',
      'ប', 'ផ', 'ព', 'ភ', 'ម',
      'យ', 'រ', 'ល', 'វ', 'ស',
      'ហ', 'ឡ', 'អ',
    ],
  },
  {
    title: 'Subscripts (Coeng / ជើង)',
    khmerTitle: 'ជើងព្យញ្ជនៈ (្)',
    keys: [
      '្ក', '្ខ', '្គ', '្ឃ', '្ង',
      '្ច', '្ឆ', '្ជ', '្ឈ', '្ញ',
      '្ដ', '្ឋ', '្ឌ', '្ឍ', '្ណ',
      '្ត', '្ថ', '្ទ', '្ធ', '្ន',
      '្ប', '្ផ', '្ព', '្ភ', '្ម',
      '្យ', '្រ', '្ល', '្វ', '្ស',
      '្ហ', '្ឡ', '្អ',
    ],
  },
  {
    title: 'Dependent Vowels',
    khmerTitle: 'ស្រៈនិស្ស័យ',
    keys: [
      'ា', 'ិ', 'ី', 'ឹ', 'ឺ', 'ុ', 'ូ', 'ួ',
      'ើ', 'ឿ', 'ៀ', 'េ', 'ែ', 'ៃ', 'ោ', 'ៅ',
      'ុំ', 'ំ', 'ាំ', 'ះ', 'ុះ', 'េះ', 'ោះ',
    ],
  },
  {
    title: 'Independent Vowels & Diacritics',
    khmerTitle: 'ស្រៈពេញតួ & វណ្ណយុត្តិ',
    keys: [
      'ឥ', 'ឦ', 'ឧ', 'ឩ', 'ឪ', 'ឫ', 'ឬ', 'ឭ', 'ឮ', 'ឯ', 'ឰ', 'ឱ', 'ឳ',
      '់', '៌', '៍', '៎', '៏', '័', '៑', 'ៗ', '៕', '៖', '៘',
    ],
  },
  {
    title: 'Numerals & Punctuation',
    khmerTitle: 'លេខខ្មែរ & សញ្ញា',
    keys: ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩', ' ', '，', '។'],
  },
];
