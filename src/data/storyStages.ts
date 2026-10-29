import { StoryStage } from '../types/game';

export const STORY_STAGES: StoryStage[] = [
  {
    id: 1,
    chapter: 'Act I',
    title: 'The Shibuya Incident: Convergence',
    locationName: 'Shibuya Crossing · 23:14',
    arenaBackground: '/src/assets/images/arena_shibuya_station_1793208294305.jpg',
    playerCharId: 'itadori',
    opponentCharId: 'megumi',
    difficulty: 'Grade 2',
    winCondition: 'Exorcise the opponent and test your Divergent Fist mastery.',
    specialRules: 'Cursed energy recovery rate +20%. Black Flash timing assistance active.',
    introDialogues: [
      {
        speaker: 'Megumi Fushiguro',
        text: 'Itadori! Keep your guard up. Something massive is shifting beneath the street level.',
        side: 'right',
      },
      {
        speaker: 'Yuji Itadori',
        text: 'Right! Let\'s spar to sharpen our senses. Don\'t hold back with your Shikigami!',
        side: 'left',
      },
    ],
  },
  {
    id: 2,
    chapter: 'Act II',
    title: 'The Calamity Awakens: King of Curses',
    locationName: 'Shibuya Underpass Ruins',
    arenaBackground: '/src/assets/images/arena_shibuya_station_1793208294305.jpg',
    playerCharId: 'itadori',
    opponentCharId: 'sukuna',
    difficulty: 'Grade 1',
    winCondition: 'Survive the razor onslaught of Dismantle and land at least one Black Flash!',
    specialRules: 'Sukuna\'s attack power is boosted. Watch out for Cleave distance closing.',
    introDialogues: [
      {
        speaker: 'Ryomen Sukuna',
        text: 'Brat... you struggle so earnestly just to be crushed like an insect. Show me what that fragile flesh can do.',
        side: 'right',
      },
      {
        speaker: 'Yuji Itadori',
        text: 'I won\'t let you destroy everyone in this city! Even if it kills me, I\'ll beat you down!',
        side: 'left',
      },
    ],
  },
  {
    id: 3,
    chapter: 'Act III',
    title: 'Ten Shadows & The Sacred General',
    locationName: 'Shinjuku Crumbling Spire',
    arenaBackground: '/src/assets/images/arena_shinjuku_ruins_1793208306557.jpg',
    playerCharId: 'megumi',
    opponentCharId: 'sukuna',
    difficulty: 'Semi-Grade 1',
    winCondition: 'Deploy Chimera Shadow Garden and summon Divine General Mahoraga.',
    specialRules: 'Megumi gains bonus shadow concealment duration when dodging.',
    introDialogues: [
      {
        speaker: 'Megumi Fushiguro',
        text: 'With this treasure, I summon... Eight-Handled Sword Divergent Sila Divine General Mahoraga!',
        side: 'left',
      },
      {
        speaker: 'Ryomen Sukuna',
        text: 'Fascinating. The trump card of the Zenin clan. Let us see if your treasure can withstand Malevolent Shrine!',
        side: 'right',
      },
    ],
  },
  {
    id: 4,
    chapter: 'Act IV',
    title: 'Battle of the Strongest: Shinjuku Showdown',
    locationName: 'Shinjuku Ground Zero Ruins',
    arenaBackground: '/src/assets/images/arena_shinjuku_ruins_1793208306557.jpg',
    playerCharId: 'gojo',
    opponentCharId: 'sukuna',
    difficulty: 'Special Grade',
    winCondition: 'Achieve victory in the ultimate clash of Domain Expansions: Unlimited Void vs Malevolent Shrine!',
    specialRules: 'Both sorcerers begin with 100% Cursed Energy. Domains trigger Domain Clash minigame!',
    introDialogues: [
      {
        speaker: 'Ryomen Sukuna',
        text: 'You are merely a fish on the chopping board, Satoru Gojo. A slightly fresher one, nothing more.',
        side: 'right',
      },
      {
        speaker: 'Satoru Gojo',
        text: 'Don\'t worry. After all... you\'re the challenger here. Let\'s see who really stands at the apex.',
        side: 'left',
      },
    ],
  },
];
