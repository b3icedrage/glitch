import { 
  User, 
  UserStory, 
  FeedPost, 
  SparkReel, 
  CinemaVideo, 
  ChatThread, 
  UserNote,
  GlitchNotification,
  LiveStream,
  LiveChatMessage,
  GlitchSound
} from '../types';

export const CURRENT_USER: User = {
  id: 'user_me',
  name: 'Maya Lin',
  handle: 'mayacyber',
  avatar: '/src/assets/images/glitch_creator_avatar_1793019134231.jpg',
  verified: true,
  followersCount: 142800,
  followingCount: 384,
  subscribersCount: '890K',
  likesCount: '4.2M',
  walletSparks: 2850,
  bio: 'Visual designer & cyberpunk synth creator. Building future experiences in Neo-Tokyo & SF. 🚀✨',
  links: ['glitch.network/mayacyber', 'glitch.network/@mayacyber/cinema']
};

export const CREATORS: Record<string, User> = {
  kai: {
    id: 'user_kai',
    name: 'Kai Vexler',
    handle: 'kaivex',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    verified: true,
    followersCount: 520000,
    followingCount: 190,
    subscribersCount: '1.4M',
    likesCount: '12.8M',
    bio: 'Motion designer & Tokyo night street runner. Cinematic soundscapes.',
  },
  elena: {
    id: 'user_elena',
    name: 'Elena Rostova',
    handle: 'elenadance',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    verified: true,
    followersCount: 1200000,
    followingCount: 420,
    subscribersCount: '2.1M',
    likesCount: '34.5M',
    bio: 'Global freestyle choreography & hyperpop vibes. ⚡ Catch me in Seoul & Berlin.',
  },
  neon: {
    id: 'user_neon',
    name: 'Neo Labs Tech',
    handle: 'neolabstech',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    verified: true,
    followersCount: 890000,
    followingCount: 52,
    subscribersCount: '3.6M',
    likesCount: '19.1M',
    bio: 'Deep dives on next-gen hardware, custom mechanical keyboards, and quantum silicon.',
  },
  zane: {
    id: 'user_zane',
    name: 'Zane Thorne',
    handle: 'zanethorne',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    verified: false,
    followersCount: 94000,
    followingCount: 610,
    subscribersCount: '180K',
    likesCount: '1.2M',
    bio: 'Synthwave music producer. Analog synths only.',
  }
};

export const INITIAL_STORIES: UserStory[] = [
  {
    userId: 'user_me',
    user: CURRENT_USER,
    hasUnseen: false,
    items: [
      {
        id: 'story_me_1',
        mediaUrl: '/src/assets/images/glitch_tech_desk_1793019176039.jpg',
        type: 'image',
        durationSeconds: 6,
        timestamp: '15m ago',
        caption: 'Late night edit session for the 4K Tokyo episode! 💻✨',
        stickers: [
          {
            type: 'poll',
            question: 'Should I release in 4K HDR or 60fps SDR?',
            options: [
              { label: '4K HDR (Cinematic)', votes: 1420 },
              { label: '60fps (Fluid)', votes: 610 }
            ]
          },
          {
            type: 'soundtrack',
            trackName: 'Midnight Expressway (Glitch Remix)',
            artistName: 'Maya Lin'
          }
        ]
      }
    ]
  },
  {
    userId: 'user_kai',
    user: CREATORS.kai,
    hasUnseen: true,
    items: [
      {
        id: 'story_kai_1',
        mediaUrl: '/src/assets/images/glitch_synthwave_thumb_1793019149342.jpg',
        type: 'image',
        durationSeconds: 6,
        timestamp: '1h ago',
        caption: 'Rain on the expressway. Shinjuku at 2:00 AM.',
        stickers: [
          {
            type: 'countdown',
            question: 'Neo-Tokyo Cinema Premiere',
            targetDate: '02h 45m'
          }
        ]
      },
      {
        id: 'story_kai_2',
        mediaUrl: '/src/assets/images/glitch_creator_avatar_1793019134231.jpg',
        type: 'image',
        durationSeconds: 5,
        timestamp: '45m ago',
        caption: 'Testing the new neural audio filter 🎧',
        stickers: [
          {
            type: 'ama',
            question: 'Ask me anything about color grading in DaVinci...'
          }
        ]
      }
    ]
  },
  {
    userId: 'user_elena',
    user: CREATORS.elena,
    hasUnseen: true,
    items: [
      {
        id: 'story_elena_1',
        mediaUrl: '/src/assets/images/glitch_reel_dance_1793019162678.jpg',
        type: 'image',
        durationSeconds: 6,
        timestamp: '2h ago',
        caption: 'New battle choreography dropping on Sparks at midnight!',
        stickers: [
          {
            type: 'poll',
            question: 'Which drop tempo goes harder?',
            options: [
              { label: '140 BPM Trap', votes: 2840 },
              { label: '160 BPM Drum & Bass', votes: 3120 }
            ]
          }
        ]
      }
    ]
  },
  {
    userId: 'user_neon',
    user: CREATORS.neon,
    hasUnseen: true,
    items: [
      {
        id: 'story_neon_1',
        mediaUrl: '/src/assets/images/glitch_tech_desk_1793019176039.jpg',
        type: 'image',
        durationSeconds: 5,
        timestamp: '4h ago',
        caption: 'Custom acrylic case with hall-effect switches arrived!',
        stickers: [
          {
            type: 'soundtrack',
            trackName: 'Mechanical Symphony',
            artistName: 'Neo Labs'
          }
        ]
      }
    ]
  }
];

export const INITIAL_FEED_POSTS: FeedPost[] = [
  {
    id: 'post_1',
    author: CREATORS.kai,
    images: [
      '/src/assets/images/glitch_synthwave_thumb_1793019149342.jpg',
      '/src/assets/images/glitch_tech_desk_1793019176039.jpg'
    ],
    caption: 'Neon arteries of Shinjuku after midnight rain. Shot on custom anamorphic glass with 4K color grading. Would you live in this city?',
    location: 'Shinjuku, Tokyo',
    soundTitle: 'Kavinsky - Nightcall (Glitch Remix)',
    soundArtist: 'Glitch Sound Lab',
    likesCount: 38420,
    isLiked: false,
    isSaved: false,
    commentsCount: 428,
    timestamp: '2h ago',
    tags: ['cyberpunk', 'tokyo', 'cinematic', 'nightphotography'],
    comments: [
      {
        id: 'c1',
        user: CREATORS.elena,
        text: 'The wet reflection on the overpass is insane! 🔥',
        timestamp: '1h ago',
        likesCount: 52,
        isLiked: false
      },
      {
        id: 'c2',
        user: CURRENT_USER,
        text: 'Color palette is pure Akira vibes. Outstanding grade.',
        timestamp: '45m ago',
        likesCount: 29,
        isLiked: true,
        creatorLiked: true
      }
    ]
  },
  {
    id: 'post_2',
    author: CREATORS.elena,
    images: [
      '/src/assets/images/glitch_reel_dance_1793019162678.jpg'
    ],
    caption: 'Defying gravity on the underground circuit. We rehearsed this drop for 14 hours straight. Who wants the full tutorial breakdown on Glitch Cinema? ⚡👟',
    location: 'Berlin Mitte, Germany',
    soundTitle: 'Hyperdrive Bassline',
    soundArtist: 'Elena Rostova',
    likesCount: 89140,
    isLiked: true,
    isSaved: true,
    commentsCount: 912,
    timestamp: '5h ago',
    tags: ['dance', 'freestyle', 'sneakers', 'urbanmotion'],
    comments: [
      {
        id: 'c3',
        user: CREATORS.kai,
        text: 'That sneaker colorway is unmatched! Cleanest freeze.',
        timestamp: '4h ago',
        likesCount: 114,
        isLiked: false
      }
    ]
  },
  {
    id: 'post_3',
    author: CREATORS.neon,
    images: [
      '/src/assets/images/glitch_tech_desk_1793019176039.jpg'
    ],
    caption: 'The ultimate 2026 content battlestation. Dual 32" OLEDs, magnetic levitation switchboard, and studio-grade condenser routing. Full 20-min documentary on our channel now!',
    location: 'San Francisco, CA',
    soundTitle: 'Lo-Fi Chill Frequency',
    soundArtist: 'Neo Labs Tech',
    likesCount: 54100,
    isLiked: false,
    isSaved: false,
    commentsCount: 630,
    timestamp: '8h ago',
    tags: ['workspace', 'desksetup', 'oled', 'audiophile'],
    comments: [
      {
        id: 'c4',
        user: CURRENT_USER,
        text: 'What monitor arms are you running here?',
        timestamp: '6h ago',
        likesCount: 14,
        isLiked: false
      }
    ]
  }
];

export const INITIAL_SPARKS: SparkReel[] = [
  {
    id: 'spark_1',
    author: CREATORS.elena,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterUrl: '/src/assets/images/glitch_reel_dance_1793019162678.jpg',
    caption: 'Street dance energy at peak tempo! Try this footwork combo and tag me #GlitchSparks 👟🔥',
    tags: ['dancechallenge', 'shorts', 'fyp', 'viral'],
    soundTitle: 'Glitch Beats Vol. 4',
    soundArtist: 'Elena Rostova x Zane Thorne',
    soundCover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80',
    likesCount: 249500,
    isLiked: false,
    isSaved: false,
    commentsCount: 1480,
    sharesCount: 38200,
    timestamp: '3h ago',
    comments: [
      {
        id: 'sc1',
        user: CREATORS.kai,
        text: 'Hit that beat drop so clean! 10/10',
        timestamp: '2h ago',
        likesCount: 84
      },
      {
        id: 'sc2',
        user: CURRENT_USER,
        text: 'The spin transition is smooth as butter 🔥',
        timestamp: '1h ago',
        likesCount: 42
      }
    ]
  },
  {
    id: 'spark_2',
    author: CREATORS.kai,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    posterUrl: '/src/assets/images/glitch_synthwave_thumb_1793019149342.jpg',
    caption: 'Tokyo expressway speedrun through midnight rain. Cinematic high-bitrate capture. 🌧️🏎️',
    tags: ['tokyo', 'speedrun', 'cybervibes', 'cinematography'],
    soundTitle: 'Midnight Expressway (Original Audio)',
    soundArtist: 'Kai Vexler',
    soundCover: '/src/assets/images/glitch_synthwave_thumb_1793019149342.jpg',
    likesCount: 182300,
    isLiked: true,
    isSaved: true,
    commentsCount: 920,
    sharesCount: 18400,
    timestamp: '1d ago',
    comments: [
      {
        id: 'sc3',
        user: CREATORS.neon,
        text: 'Look at the color balance in those tunnel lights!',
        timestamp: '18h ago',
        likesCount: 19
      }
    ]
  },
  {
    id: 'spark_3',
    author: CREATORS.neon,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    posterUrl: '/src/assets/images/glitch_tech_desk_1793019176039.jpg',
    caption: 'Listen to the sound of these lubricated magnetic hall switches. Pure ASMR satisfaction ⌨️🎧',
    tags: ['mechanicalkeyboards', 'asmr', 'desksetup', 'satisfying'],
    soundTitle: 'Keyboard Click ASMR 120WPM',
    soundArtist: 'Neo Labs Tech',
    soundCover: '/src/assets/images/glitch_tech_desk_1793019176039.jpg',
    likesCount: 93400,
    isLiked: false,
    isSaved: false,
    commentsCount: 412,
    sharesCount: 8900,
    timestamp: '2d ago',
    comments: [
      {
        id: 'sc4',
        user: CURRENT_USER,
        text: 'What grams of actuation force on those switches?',
        timestamp: '1d ago',
        likesCount: 8
      }
    ]
  }
];

export const INITIAL_CINEMA_VIDEOS: CinemaVideo[] = [
  {
    id: 'yt_1',
    title: 'Building the Ultimate Cyberpunk Workspace: Custom Silicon, OLEDs & Acoustic Tuning',
    description: `In this comprehensive build guide, we design, fabricate, and assemble an uncompromising creator environment from scratch.\n\nTimestamps:\n0:00 - The Vision & Philosophy\n2:15 - Desk Fabrication & Solid Walnut\n5:40 - Display Setup: Dual 32" QD-OLEDs\n10:12 - Custom Audio Rig & Analog Routing\n15:30 - Final Sound Demo & Cable Management\n\nThanks to our community supporters on Glitch! Subscribe for weekly engineering documentaries.`,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: '/src/assets/images/glitch_tech_desk_1793019176039.jpg',
    duration: '18:42',
    viewsCount: '1.2M',
    uploadedAt: '3 days ago',
    channel: CREATORS.neon,
    isSubscribed: false,
    likesCount: 84200,
    isLiked: false,
    isDisliked: false,
    category: 'Tech & Hardware',
    tags: ['desksetup', 'productivity', 'audiophile', 'custompc'],
    commentsCount: 1840,
    comments: [
      {
        id: 'ytc_1',
        user: CURRENT_USER,
        text: 'The acoustic paneling in the background makes a massive difference in vocal clarity. Top notch production value!',
        timestamp: '2 days ago',
        likesCount: 412,
        creatorLiked: true,
        isLiked: true
      },
      {
        id: 'ytc_2',
        user: CREATORS.kai,
        text: 'That walnut desk slab is perfection. Where did you source the wood?',
        timestamp: '1 day ago',
        likesCount: 98,
        isLiked: false
      }
    ]
  },
  {
    id: 'yt_2',
    title: 'Tokyo 2099: Cyberpunk City Documentary in 4K 60FPS Anamorphic Cinema',
    description: `An immersive journey through the high-density districts of Shinjuku, Akihabara, and Shibuya after midnight rain. Shot on custom cinema anamorphic primes.\n\nAll music produced in-house on modular analog synthesizers.\n\nStream the full soundtrack on Glitch Audio.`,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnailUrl: '/src/assets/images/glitch_synthwave_thumb_1793019149342.jpg',
    duration: '24:15',
    viewsCount: '3.8M',
    uploadedAt: '1 week ago',
    channel: CREATORS.kai,
    isSubscribed: true,
    likesCount: 230000,
    isLiked: true,
    isDisliked: false,
    category: 'Cinematic & Travel',
    tags: ['tokyo', 'cinematic', '4k60', 'synthwave'],
    commentsCount: 4120,
    comments: [
      {
        id: 'ytc_3',
        user: CREATORS.elena,
        text: 'Watched this on my OLED TV in the dark. Felt like a portal straight to another dimension.',
        timestamp: '4 days ago',
        likesCount: 820,
        creatorLiked: true
      }
    ]
  },
  {
    id: 'yt_3',
    title: 'World Championship Street Dance Routine: Behind The Scenes & Full Choreography',
    description: `Breakdown of our 1st place performance at the Global Street Session in Seoul. Includes multi-cam angles, slow-motion breakdowns, and dancer audio commentary.`,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: '/src/assets/images/glitch_reel_dance_1793019162678.jpg',
    duration: '12:08',
    viewsCount: '890K',
    uploadedAt: '2 weeks ago',
    channel: CREATORS.elena,
    isSubscribed: true,
    likesCount: 78500,
    isLiked: false,
    isDisliked: false,
    category: 'Dance & Culture',
    tags: ['dance', 'competition', 'choreography', 'seoul'],
    commentsCount: 940,
    comments: [
      {
        id: 'ytc_4',
        user: CREATORS.neon,
        text: 'That synchronized freeze at 4:20 was unreal!',
        timestamp: '1 week ago',
        likesCount: 145
      }
    ]
  },
  {
    id: 'yt_4',
    title: 'Designing Reactive Digital Identities: UI/UX Masterclass for Modern Web Apps',
    description: `How to blend the visual punch of social media with production web architecture. Motion design, zero-pill typography, and buttery 60fps canvas performance.`,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: '/src/assets/images/glitch_creator_avatar_1793019134231.jpg',
    duration: '31:40',
    viewsCount: '540K',
    uploadedAt: '3 weeks ago',
    channel: CURRENT_USER,
    isSubscribed: false,
    likesCount: 46100,
    isLiked: false,
    isDisliked: false,
    category: 'Design & Code',
    tags: ['design', 'uiux', 'frontend', 'creativecode'],
    commentsCount: 615,
    comments: []
  }
];

export const INITIAL_CHATS: ChatThread[] = [
  {
    id: 'chat_kai',
    participant: CREATORS.kai,
    lastMessage: 'The color profile on that video looks unbelievable!',
    lastTimestamp: '12m ago',
    unreadCount: 1,
    online: true,
    category: 'primary',
    messages: [
      {
        id: 'm1',
        senderId: CREATORS.kai.id,
        text: 'Hey Maya! Did you see the new anamorphic footage from Shinjuku?',
        timestamp: '10:14 AM'
      },
      {
        id: 'm2',
        senderId: CURRENT_USER.id,
        text: 'Yes! The rainy reflections on the asphalt look cinematic as hell.',
        timestamp: '10:16 AM'
      },
      {
        id: 'm2_media',
        senderId: CREATORS.kai.id,
        text: 'Shared a clip from Tokyo expressway:',
        timestamp: '10:18 AM',
        type: 'shared_media',
        sharedMedia: {
          id: 'spark_2',
          title: 'Tokyo expressway speedrun through midnight rain',
          thumbnail: '/src/assets/images/glitch_synthwave_thumb_1793019149342.jpg',
          mediaType: 'spark',
          authorHandle: 'kaivex'
        }
      },
      {
        id: 'm3',
        senderId: CREATORS.kai.id,
        text: 'The color profile on that video looks unbelievable! Want to collab on the next Glitch Spark track?',
        timestamp: '10:20 AM'
      }
    ]
  },
  {
    id: 'chat_elena',
    participant: CREATORS.elena,
    lastMessage: 'Let us shoot a duet video next Thursday in Berlin!',
    lastTimestamp: '1h ago',
    unreadCount: 0,
    online: true,
    category: 'primary',
    messages: [
      {
        id: 'm4',
        senderId: CREATORS.elena.id,
        text: 'Loved your story post about the sound design synth.',
        timestamp: 'Yesterday'
      },
      {
        id: 'm4_voice',
        senderId: CREATORS.elena.id,
        text: 'Audio voice memo',
        timestamp: 'Yesterday',
        type: 'voice',
        audioDuration: '0:18'
      },
      {
        id: 'm5',
        senderId: CURRENT_USER.id,
        text: 'Thanks Elena! It pairs so well with high energy dance beats.',
        timestamp: 'Yesterday'
      },
      {
        id: 'm6',
        senderId: CREATORS.elena.id,
        text: 'Let us shoot a duet video next Thursday in Berlin!',
        timestamp: '1h ago'
      }
    ]
  },
  {
    id: 'chat_neon',
    participant: CREATORS.neon,
    lastMessage: 'Sending you the prototype PCB layout for feedback.',
    lastTimestamp: '3h ago',
    unreadCount: 0,
    online: false,
    category: 'general',
    messages: [
      {
        id: 'm7',
        senderId: CREATORS.neon.id,
        text: 'Sending you the prototype PCB layout for feedback.',
        timestamp: '3h ago',
        type: 'image',
        mediaUrl: '/src/assets/images/glitch_tech_desk_1793019176039.jpg'
      }
    ]
  },
  {
    id: 'chat_zane',
    participant: CREATORS.zane,
    lastMessage: 'Hey Maya! I composed a 140BPM synthwave drop for your next reel.',
    lastTimestamp: '5h ago',
    unreadCount: 1,
    online: false,
    category: 'requests',
    messages: [
      {
        id: 'm8',
        senderId: CREATORS.zane.id,
        text: 'Hey Maya! I composed a 140BPM synthwave drop for your next reel. Let me know if you would like stems!',
        timestamp: '5h ago'
      }
    ]
  }
];

export const INITIAL_NOTES: UserNote[] = [
  {
    id: 'note_me',
    userId: CURRENT_USER.id,
    user: CURRENT_USER,
    text: 'Rendering the 4K Tokyo episode 🎨⚡',
    musicTrack: 'Nightcall (Glitch Remix)',
    timestamp: '2h ago'
  },
  {
    id: 'note_kai',
    userId: CREATORS.kai.id,
    user: CREATORS.kai,
    text: 'Rainy expressway at 2 AM 🌧️🏎️',
    musicTrack: 'Midnight Expressway',
    timestamp: '4h ago'
  },
  {
    id: 'note_elena',
    userId: CREATORS.elena.id,
    user: CREATORS.elena,
    text: 'Freestyle session live in Berlin 👟🔥',
    musicTrack: 'Hyperdrive Bassline',
    timestamp: '1h ago'
  },
  {
    id: 'note_neon',
    userId: CREATORS.neon.id,
    user: CREATORS.neon,
    text: 'Hall-effect switch testing ⌨️🎧',
    musicTrack: 'Keyboard ASMR 120WPM',
    timestamp: '5h ago'
  },
  {
    id: 'note_zane',
    userId: CREATORS.zane.id,
    user: CREATORS.zane,
    text: 'Analog synth jams all night 🎹🪐',
    musicTrack: 'Analog Dreams Vol. 2',
    timestamp: '3h ago'
  }
];

export const INITIAL_NOTIFICATIONS: GlitchNotification[] = [
  {
    id: 'notif_1',
    type: 'super_spark',
    actor: CREATORS.kai,
    content: 'sent you 500 Super-Sparks on "Midnight City Drift"!',
    targetId: 'spark_1',
    targetType: 'spark',
    targetThumbnail: '/src/assets/images/glitch_synthwave_thumb_1793019149342.jpg',
    timestamp: '10m ago',
    read: false
  },
  {
    id: 'notif_2',
    type: 'like',
    actor: CREATORS.elena,
    content: 'and 14 others liked your Spark reel',
    targetId: 'spark_1',
    targetType: 'spark',
    targetThumbnail: '/src/assets/images/glitch_reel_dance_1793019162678.jpg',
    timestamp: '35m ago',
    read: false,
    groupedCount: 15
  },
  {
    id: 'notif_3',
    type: 'comment',
    actor: CREATORS.neon,
    content: 'commented: "That mechanical switch actuation curve is pristine."',
    targetId: 'yt_3',
    targetType: 'tube',
    targetThumbnail: '/src/assets/images/glitch_tech_desk_1793019176039.jpg',
    timestamp: '2h ago',
    read: false
  },
  {
    id: 'notif_4',
    type: 'subscribe',
    actor: CREATORS.zane,
    content: 'unlocked a Level 2 Channel Pass to your Cinema series',
    timestamp: '4h ago',
    read: true
  },
  {
    id: 'notif_5',
    type: 'mention',
    actor: CREATORS.kai,
    content: 'mentioned you in a note: "Rendering the 4K Tokyo episode with @mayacyber"',
    timestamp: '6h ago',
    read: true
  },
  {
    id: 'notif_6',
    type: 'system',
    actor: CURRENT_USER,
    content: 'Your Glitch creator payout of $489.20 is ready for withdrawal.',
    timestamp: '1d ago',
    read: true
  }
];

export const INITIAL_LIVE_STREAMS: LiveStream[] = [
  {
    id: 'live_kai_1',
    streamer: CREATORS.kai,
    title: 'LIVE: Coding a Cyberpunk Synth in Rust + Visuals (AMA)',
    category: 'Creative Tech',
    viewerCount: 8420,
    thumbnailUrl: '/src/assets/images/glitch_tech_desk_1793019176039.jpg',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    startedAt: '42m ago',
    tags: ['LiveCoding', 'Rust', 'CreativeTech', 'Synthwave'],
    coHost: CREATORS.neon
  },
  {
    id: 'live_elena_1',
    streamer: CREATORS.elena,
    title: 'Glitch Battle Stage: Seoul Street Style Rehearsal',
    category: 'Music & Performance',
    viewerCount: 14190,
    thumbnailUrl: '/src/assets/images/glitch_reel_dance_1793019162678.jpg',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    startedAt: '1h 10m ago',
    tags: ['Freestyle', 'Hyperpop', 'DanceBattle']
  },
  {
    id: 'live_neon_1',
    streamer: CREATORS.neon,
    title: 'Assembling a $5,000 Custom Optical Keyboard with Hall Sensors',
    category: 'Hardware & Modding',
    viewerCount: 5210,
    thumbnailUrl: '/src/assets/images/glitch_tech_desk_1793019176039.jpg',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    startedAt: '25m ago',
    tags: ['MechanicalKeyboards', 'CustomBuild', 'Tech']
  }
];

export const INITIAL_LIVE_CHATS: LiveChatMessage[] = [
  {
    id: 'chat_1',
    user: CREATORS.zane,
    message: 'That low pass filter resonance is unreal 🔥',
    timestamp: 'Just now'
  },
  {
    id: 'chat_2',
    user: CREATORS.elena,
    message: 'Dropped 500 Super-Sparks! Keep cooking!',
    timestamp: 'Just now',
    isSuperSpark: true,
    superSparkAmount: 500,
    superSparkTier: 'matrix'
  },
  {
    id: 'chat_3',
    user: CREATORS.neon,
    message: 'Switching audio routing on OBS now, you should hear the secondary oscillator clean.',
    timestamp: '1m ago'
  },
  {
    id: 'chat_4',
    user: CURRENT_USER,
    message: 'Watching from SF, the 60fps feed is buttery smooth!',
    timestamp: '2m ago'
  }
];

export const INITIAL_SOUNDS: GlitchSound[] = [
  {
    id: 'sound_1',
    title: 'Kavinsky - Nightcall (Glitch Remix)',
    artist: 'Glitch Sound Lab',
    coverUrl: '/src/assets/images/glitch_synthwave_thumb_1793019149342.jpg',
    duration: '0:34',
    usageCount: '142.8K',
    category: 'Synthwave'
  },
  {
    id: 'sound_2',
    title: 'Hyperdrive Bassline',
    artist: 'Elena Rostova',
    coverUrl: '/src/assets/images/glitch_reel_dance_1793019162678.jpg',
    duration: '0:22',
    usageCount: '98.4K',
    category: 'Hyperpop'
  },
  {
    id: 'sound_3',
    title: 'Midnight Expressway',
    artist: 'Kai Vexler',
    coverUrl: '/src/assets/images/glitch_creator_avatar_1793019134231.jpg',
    duration: '0:45',
    usageCount: '215.1K',
    category: 'Cyberpunk'
  },
  {
    id: 'sound_4',
    title: 'Keyboard ASMR 120WPM',
    artist: 'Neo Labs Tech',
    coverUrl: '/src/assets/images/glitch_tech_desk_1793019176039.jpg',
    duration: '0:30',
    usageCount: '44.3K',
    category: 'Ambience'
  }
];


