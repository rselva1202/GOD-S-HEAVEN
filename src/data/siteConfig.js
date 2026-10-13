const resolveBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) {
    return import.meta.env.BASE_URL
  }
  return '/'
}
const withBase = (path) => `${resolveBaseUrl().replace(/\/$/, '')}/${path.replace(/^\//, '')}`

export const siteConfig = {
  mode: 'restaurant',
  demoMode: false,

  loader: {
    brandName: "God's Own Country Kitchen",
    logo: withBase('logo.png'),
    tagline: 'North Cliff · Varkala · Kerala',
    colors: {
      bg: '#0B3C49',
      foam: '#7FC8C0',
      sand: '#F3E9D7',
      outline: 'rgba(243, 233, 215, 0.45)',
      sun: '#F4906F',
      sunGlow: 'rgba(244, 144, 111, 0.55)',
      horizon: 'rgba(243, 233, 215, 0.22)',
      text: '#F3E9D7',
      textMuted: 'rgba(243, 233, 215, 0.72)',
    },
    timings: {
      minDuration: 1800,
      maxDuration: 4000,
      quickFadeDuration: 600,
      reducedMotionDuration: 800,
    },
  },

  brand: {
    name: "God's Own Country Kitchen",
    shortName: "God's Own Country Kitchen",
    descriptor: 'Seafood · Live Music · Sea Views',
    logo: withBase('logo.png'),
    tagline: 'Where the cliff meets the sea.',
    taglineLines: ['Where the cliff', 'meets the sea.'],
    heroHeadline: '',
    heroSubline: '',
    city: 'Varkala, Kerala',
    cityName: 'Varkala',
    locationLine: 'North Cliff, near Helipad, Varkala, Kerala',
    landmark: 'Near the Helipad',
    waterBodyName: 'Arabian Sea',
    phone: '+91 63694 03544',
    phoneHref: 'https://wa.me/916369403544',
    whatsapp: '916369403544',
    whatsappLabel: '+91 63694 03544',
    address: 'North Cliff, near Helipad, Varkala, Kerala 695141',
    hours: 'Hours: to be confirmed',
    owner: 'Owner: to be confirmed',
    parking: 'Parking: to be confirmed',
    email: 'hello@godsowncountrykitchen.com',
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=God's+Own+Country+Kitchen+North+Cliff+Varkala",
  },

  seo: {
    title: "God's Own Country Kitchen: Seafood, Live Music & Sea Views | Varkala",
    description: "God's Own Country Kitchen on North Cliff near the Helipad, Varkala. Seafood-focused dining, outdoor seating, vegetarian options & live music.",
    ogTitle: "God's Own Country Kitchen: Seafood, Live Music & Sea Views | Varkala",
    ogDescription: "A cliff-top dining experience in Varkala overlooking the Arabian Sea. Fresh seafood, live music sessions, and outdoor sunset seating.",
    ogImage: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1600&q=85',
    themeColor: '#0B3C49',
    robots: 'index,follow',
  },

  theme: {
    ink: '#0B3C49',
    terracotta: '#B5532D',
    sand: '#F3E9D7',
    cream: '#FAF6EE',
    sage: '#7FC8C0',
    mist: '#DCEEEB',
    coral: '#F4906F',
  },

  // Service highlights (Section 3)
  highlights: [
    {
      id: 'outdoor-seating',
      title: 'Outdoor Seating',
      subtitle: 'Cliff-edge tables with open Arabian Sea views',
      description: 'Dine in the open coastal air where the sea breeze keeps the cliff cool, and the sky turns crimson at sunset.',
      tag: 'Sea Views',
      icon: '☼',
    },
    {
      id: 'vegetarian-options',
      title: 'Vegetarian Options',
      subtitle: 'Rich Kerala vegetarian curries, stews & breads',
      description: 'Dedicated vegetarian recipes cooked with fresh local coconut, ground spices, traditional appams and Malabar parottas.',
      tag: 'Fresh & Varied',
      icon: '🌿',
    },
    {
      id: 'live-music',
      title: 'Live Music',
      subtitle: 'Acoustic sessions & seaside rhythms',
      description: 'Unwind as evening sets in with acoustic musicians playing against the sound of breaking waves on North Cliff.',
      tag: 'Every Evening',
      icon: '♪',
    },
  ],

  // Menu (Section 4) - strictly sample items with no invented prices
  menu: {
    badge: 'Our Menu',
    title: 'The Cliff Kitchen Menu',
    subtitle: 'Fresh catches from Arabian Sea waters, traditional clay pot preparations, and vegetarian delicacies. All items and prices subject to daily catch and kitchen selection.',
    categories: [
      { id: 'seafood', name: 'Seafood' },
      { id: 'kerala-classics', name: 'Kerala Classics' },
      { id: 'vegetarian', name: 'Vegetarian' },
      { id: 'drinks-desserts', name: 'Drinks & Desserts' },
    ],
    items: [
      // Seafood
      {
        id: 'catch-of-the-day',
        category: 'seafood',
        name: 'Fresh Catch of the Day',
        description: 'Locally landed Arabian Sea fish grilled or pan-fried with coastal Kerala spices, curry leaves and lemon.',
        price: 'Price on menu',
        veg: false,
        highlight: true,
      },
      {
        id: 'malabar-prawn-roast',
        category: 'seafood',
        name: 'Malabar Prawn Roast',
        description: 'Tender sea prawns slow-cooked in thick caramelised shallots, crushed pepper, garlic and roasted coconut slices.',
        price: 'Price on menu',
        veg: false,
      },
      {
        id: 'karimeen-pollichathu',
        category: 'seafood',
        name: 'Karimeen Pollichathu',
        description: 'Pearl spot fish marinated in spicy red masala, wrapped in fresh banana leaf and slow-griddled to perfection.',
        price: 'Price on menu',
        veg: false,
        highlight: true,
      },
      {
        id: 'squid-pepper-fry',
        category: 'seafood',
        name: 'Squid Pepper Fry',
        description: 'Crisp squid rings tossed with crushed Tellicherry black peppercorns, curry leaves, and slivered coconut.',
        price: 'Price on menu',
        veg: false,
      },
      {
        id: 'kerala-fish-curry',
        category: 'seafood',
        name: 'Traditional Kerala Fish Curry',
        description: 'Simmered in earthen pots with fragrant cocum (kudampuli), freshly pressed coconut milk, ginger and green chillies.',
        price: 'Price on menu',
        veg: false,
      },
      {
        id: 'crab-masala',
        category: 'seafood',
        name: 'Coastal Crab Masala',
        description: 'Whole sea crab cracked and simmered in an aromatic dark roasted onion-coriander gravy.',
        price: 'Price on menu',
        veg: false,
      },

      // Kerala Classics
      {
        id: 'appam-stew',
        category: 'kerala-classics',
        name: 'Lacy Appams with Vegetable Stew',
        description: 'Crispy-edged fermented rice hoppers served alongside creamy coconut milk stew scented with cardamom and cinnamon.',
        price: 'Price on menu',
        veg: true,
        highlight: true,
      },
      {
        id: 'malabar-parotta',
        category: 'kerala-classics',
        name: 'Flaky Malabar Parotta Basket',
        description: 'Hand-layered, griddled golden parottas served hot with house spiced salna.',
        price: 'Price on menu',
        veg: true,
      },
      {
        id: 'kerala-chicken-sukka',
        category: 'kerala-classics',
        name: 'Kerala Chicken Sukka',
        description: 'Country chicken pan-roasted dry with dry-roasted whole spices, coconut pieces, and sweet shallots.',
        price: 'Price on menu',
        veg: false,
      },
      {
        id: 'thalassery-biryani',
        category: 'kerala-classics',
        name: 'Thalassery Dum Biryani',
        description: 'Short-grain Kaima rice layered with ghee, fragrant spices, fried onions and raisins.',
        price: 'Price on menu',
        veg: false,
      },

      // Vegetarian
      {
        id: 'kerala-veg-curry',
        category: 'vegetarian',
        name: 'Nadan Vegetable Curry',
        description: 'Garden vegetables simmered in a spiced coconut and cumin paste, tempered with mustard seeds and curry leaves.',
        price: 'Price on menu',
        veg: true,
        highlight: true,
      },
      {
        id: 'paneer-ghee-roast',
        category: 'vegetarian',
        name: 'Paneer Ghee Roast',
        description: 'Fresh paneer cubes seared in spiced Byadgi chilli paste, fresh curry leaves, and coastal clarified butter.',
        price: 'Price on menu',
        veg: true,
      },
      {
        id: 'mushroom-pepper-fry',
        category: 'vegetarian',
        name: 'Mushroom Pepper Fry',
        description: 'Button mushrooms sauteed with freshly crushed black pepper, capsicum and golden fried onions.',
        price: 'Price on menu',
        veg: true,
      },
      {
        id: 'avial-steamed-rice',
        category: 'vegetarian',
        name: 'Traditional Kerala Avial',
        description: 'Medley of native coastal vegetables tossed in coarse coconut-curd sauce and drizzled with raw cold-pressed coconut oil.',
        price: 'Price on menu',
        veg: true,
      },
      {
        id: 'dal-tadka-ghee',
        category: 'vegetarian',
        name: 'Yellow Dal Tadka',
        description: 'Slow-cooked yellow lentils tempered with cumin, garlic, whole dried red chillies and fresh coriander.',
        price: 'Price on menu',
        veg: true,
      },

      // Drinks & Desserts
      {
        id: 'tender-coconut-cooler',
        category: 'drinks-desserts',
        name: 'Fresh Tender Coconut Water',
        description: 'Straight from local Varkala palm trees, served chilled with fresh mint and lime.',
        price: 'Price on menu',
        veg: true,
        highlight: true,
      },
      {
        id: 'kerala-spiced-buttermilk',
        category: 'drinks-desserts',
        name: 'Sambharam (Spiced Buttermilk)',
        description: 'Cooling churned curd infused with crushed ginger, shallots, green chillies and fresh curry leaves.',
        price: 'Price on menu',
        veg: true,
      },
      {
        id: 'mango-lassi',
        category: 'drinks-desserts',
        name: 'Alphonso Mango Lassi',
        description: 'Rich creamy yogurt blended with real mango pulp and cardamom.',
        price: 'Price on menu',
        veg: true,
      },
      {
        id: 'elaneer-payasam',
        category: 'drinks-desserts',
        name: 'Tender Coconut Payasam',
        description: 'Classic warm sweet dessert made with tender coconut pulp, coconut milk, and crushed cashew nuts.',
        price: 'Price on menu',
        veg: true,
      },
    ],
  },

  // Live music lineup (Section 5)
  // Reusing horizontal scroll. 7 day cards. Highlight today's card.
  liveMusic: {
    title: 'Live Music by the Sea',
    eyebrow: 'Weekly Sunset & Evening Lineup',
    description: 'Every evening, acoustic chords and rhythmic coastal melodies accompany the sound of breaking waves on North Cliff.',
    scheduleNote: 'Artist names and performance times: to be confirmed. Check with staff or enquire via WhatsApp for tonight’s set.',
    days: [
      {
        dayIndex: 1, // Monday
        dayName: 'Monday',
        genre: 'Acoustic Sunset',
        time: 'Evening · Times: to be confirmed',
        artist: 'Artist lineup: to be confirmed',
        description: 'Gentle acoustic guitar and slow coastal melodies as the sun sinks into the Arabian Sea.',
      },
      {
        dayIndex: 2, // Tuesday
        dayName: 'Tuesday',
        genre: 'Coastal Folk & Strings',
        time: 'Evening · Times: to be confirmed',
        artist: 'Artist lineup: to be confirmed',
        description: 'Soulful string acoustic sets blending regional rhythms and international classics.',
      },
      {
        dayIndex: 3, // Wednesday
        dayName: 'Wednesday',
        genre: 'Seaside Blues',
        time: 'Evening · Times: to be confirmed',
        artist: 'Artist lineup: to be confirmed',
        description: 'Warm blues and acoustic rock ballads under the North Cliff lantern lights.',
      },
      {
        dayIndex: 4, // Thursday
        dayName: 'Thursday',
        genre: 'Indie & Unplugged',
        time: 'Evening · Times: to be confirmed',
        artist: 'Artist lineup: to be confirmed',
        description: 'Intimate unplugged sessions celebrating vocal harmonies and indie favourites.',
      },
      {
        dayIndex: 5, // Friday
        dayName: 'Friday',
        genre: 'Kerala Fusion & Rhythms',
        time: 'Evening · Times: to be confirmed',
        artist: 'Artist lineup: to be confirmed',
        description: 'Vibrant percussion and acoustic arrangements to kick off the coastal weekend.',
      },
      {
        dayIndex: 6, // Saturday
        dayName: 'Saturday',
        genre: 'Weekend Live Showcase',
        time: 'Evening · Times: to be confirmed',
        artist: 'Artist lineup: to be confirmed',
        description: 'Our headline weekend session with full acoustic ensemble overlooking the illuminated shoreline.',
      },
      {
        dayIndex: 0, // Sunday
        dayName: 'Sunday',
        genre: 'Sundowner Jam',
        time: 'Sunset & Evening · Times: to be confirmed',
        artist: 'Artist lineup: to be confirmed',
        description: 'Relaxed golden hour acoustic jam session wrapping up the week with chilled seaside vibes.',
      },
    ],
  },

  // Outdoor Seating & Sea View (Section 6)
  outdoorSeating: {
    eyebrow: 'Cliffside Atmosphere',
    title: 'Tables with unobstructed Arabian Sea views.',
    body: 'Perched high above the shoreline along Varkala’s famous red laterite cliffs, our outdoor dining area provides panoramic views across the Arabian Sea. Enjoy the ocean breeze by day and ambient lanterns by night.',
    features: [
      'Unobstructed sunset views over the water',
      'Open-air sea breeze tables',
      'Ambient cliffside night lanterns',
      'Steps away from the Varkala Helipad',
    ],
    image: {
      src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=85',
      alt: 'Open-air cliffside restaurant dining with sea breeze and ocean horizon view',
    },
  },

  // Reviews (Section 7)
  reviewsData: {
    counter: 3800,
    counterSuffix: '+',
    counterLabel: 'Google Reviews',
    googleReviewUrl: 'https://www.google.com/search?sca_esv=074237d04407bddc&sxsrf=APpeQnvLkAb7Hz__kXBC10L1XNilfnkAiw:1791914132479&si=APenkKm7iecQ4G6P-TsbSMFKIQtv3EFIqRAFw-i8uEbk55Z-_wQ9Lp_STEoGp8uhdZKydT3D11ddsyoZqzZ8tq9LL9qpQeUkCNWMG4JNiJG-fFzmsKnVgn_ofgVFcDC7BN4Qzu3GGNzILr39ya6XO7hdq-EYjFWbHw%3D%3D&q=God%27s+Own+Country+Kitchen+Reviews&sa=X&ved=2ahUKEwjdhdaqyLeXAxX8jeEIHXiBF3QQ0bkNegQIKxAF&biw=1366&bih=679&dpr=1#',
    eyebrow: 'Kind words from our guests',
    title: 'Loved by over 3,800 diners on Google.',
    reviews: [
      {
        quote: 'The fresh grilled fish with Kerala masala right next to the cliff edge was unforgettable. Live acoustic guitar at sunset made the evening pure magic.',
        author: 'Rahul S.',
        source: 'Google review',
      },
      {
        quote: 'Incredible vegetarian options alongside the seafood! The appams and coconut stew were delicious, and the outdoor sea view is second to none.',
        author: 'Emily T.',
        source: 'Google review',
      },
      {
        quote: 'Great vibe on North Cliff near the Helipad. Wonderful live music, attentive team, and watching the sunset with fresh tender coconut water was bliss.',
        author: 'Anand & Divya M.',
        source: 'Google review',
      },
    ],
  },

  // Events & Groups (Section 8)
  events: {
    eyebrow: 'Gatherings & Celebrations',
    title: 'Birthdays, group dinners & private celebrations.',
    body: 'Whether you are planning a memorable birthday dinner, a family seafood feast, or a group table for an evening of live music, we are happy to arrange special seating by the sea.',
    options: [
      {
        title: 'Group Tables',
        detail: 'Comfortable communal tables for friends and travel groups with custom seafood platters.',
      },
      {
        title: 'Birthday Celebrations',
        detail: 'Cliffside sunset tables with candlelit lanterns and celebratory desserts.',
      },
      {
        title: 'Private Sunset Parties',
        detail: 'Reserved outdoor corners with live music and tailored Kerala feast menus.',
      },
    ],
  },

  // Gallery (Section 9)
  images: {
    hero: {
      src: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2200&q=90',
      alt: 'Arabian Sea sunset glowing over Varkala cliff',
      width: 2200,
      height: 1200,
    },
    about: {
      src: withBase('images/story-restaurant.jpg'),
      fallbackSrc: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1400&q=85',
      alt: "God's Own Country Kitchen Seafood Corner restaurant illuminated on North Cliff",
      width: 1400,
      height: 1800,
      caption: "God's Own Country Kitchen · North Cliff, Varkala",
    },
    outdoor: {
      src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=85',
      alt: 'Outdoor cliff-edge tables overlooking the Arabian Sea',
      width: 1600,
      height: 1000,
      caption: 'Cliffside outdoor seating with sea breeze',
    },
    gallery: [
      {
        src: withBase('images/gallery/live-band.jpg'),
        alt: "Live music band performing on stage at God's Own Country Kitchen",
        caption: "Live band performance on the restaurant stage",
        size: 'tall',
      },
      {
        src: withBase('images/gallery/restaurant-facade.jpg'),
        alt: "God's Own Country Kitchen Seafood Corner illuminated dining space",
        caption: "Evening cliffside dining beneath warm lights",
        size: 'wide',
      },
      {
        src: withBase('images/gallery/fresh-fish-display.jpg'),
        alt: "Fresh Arabian Sea catch on ice display at God's Own Country Kitchen",
        caption: "Daily fresh Arabian Sea catch display",
        size: 'standard',
      },
      {
        src: withBase('images/gallery/coastal-dining.jpg'),
        alt: "Warm wooden interior and glowing string lights at God's Own Country Kitchen",
        caption: "Ambient indoor & verandah seating",
        size: 'wide',
      },
      {
        src: withBase('images/gallery/night-ambience.jpg'),
        alt: "Night neon signage and entrance of God's Own Country Seafood Corner",
        caption: "Vibrant North Cliff evening ambience",
        size: 'tall',
      },
    ],
  },

  // About Section (Section 2)
  about: {
    eyebrow: 'Our Story & Perch',
    title: 'A cliff-top Kerala kitchen above the waves.',
    body: "Located on Varkala’s North Cliff near the Helipad, God's Own Country Kitchen was built on a love for fresh Arabian Sea seafood, authentic Kerala recipes, and open-air evenings. Settle into our outdoor seating to watch the sunset melt into the ocean, savour fragrant coconut curries, and enjoy the rhythm of live music under the stars.",
    caption: 'Cliff-top restaurant on North Cliff near the Helipad · Est. 2012',
  },

  // Find Us (Section 10)
  location: {
    eyebrow: 'Find Us on the Cliff',
    title: 'Near the Helipad on North Cliff.',
    body: "God's Own Country Kitchen is situated on North Cliff, just steps from the Varkala Helipad. Follow the cliff path for panoramic ocean views, sea breeze, and fresh food.",
    address: 'North Cliff, near Helipad, Varkala, Kerala 695141',
    hoursPlaceholder: 'Hours: to be confirmed',
    parkingPlaceholder: 'Parking: to be confirmed',
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=God's+Own+Country+Kitchen+North+Cliff+Varkala",
  },

  // FAQ Section (Section 11)
  faqs: [
    {
      question: 'Do you offer vegetarian options?',
      answer: 'Yes! We take pride in serving a rich selection of authentic Kerala vegetarian dishes, including creamy vegetable stew, appams, Malabar parottas, paneer ghee roast, and traditional avial.',
    },
    {
      question: 'Do you have outdoor seating with sea views?',
      answer: 'Yes, our restaurant features open-air outdoor seating situated directly along North Cliff, offering panoramic, unobstructed views of the Arabian Sea and breathtaking sunsets.',
    },
    {
      question: 'When do you have live music?',
      answer: 'We host live music performances in the evenings. The weekly acoustic and vocal lineup brings gentle seaside rhythms to your dinner. Exact artists and schedule: to be confirmed.',
    },
    {
      question: 'How do we reserve a table?',
      answer: 'You can reserve a table directly using our Table Reservation form on this website or by sending us a quick WhatsApp message. We recommend booking in advance for sunset tables and weekend live music evenings.',
    },
  ],

  // Table reservation config
  reservation: {
    title: 'Reserve a Table by the Sea',
    eyebrow: 'Table Reservation',
    description: 'Book your table for lunch, golden hour sunset, or an evening of live music on North Cliff.',
    timeSlots: [
      'Lunch (12:30 PM – 3:30 PM)',
      'Sunset & Golden Hour (5:00 PM – 7:00 PM)',
      'Dinner & Live Music (7:00 PM – 10:30 PM)',
      'Other / Flexible',
    ],
    occasions: [
      'Casual dining',
      'Sunset drinks & dinner',
      'Live music evening',
      'Birthday celebration',
      'Anniversary',
      'Group / Family feast',
    ],
    guestOptions: ['1 person', '2 people', '3 people', '4 people', '5–8 people', '9+ group'],
  },
}

export const navigation = [
  { label: 'Menu', href: '#menu' },
  { label: 'Story', href: '#about' },
  { label: 'Highlights', href: '#highlights' },
  { label: 'Live Music', href: '#live-music' },
  { label: 'Outdoor', href: '#outdoor' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Find Us', href: '#location' },
]
