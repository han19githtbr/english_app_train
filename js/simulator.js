// ═══════════════════════════════════════════════════════════════════════════
// LINGUA PRO — Conversation Simulator (integrated module)
// Injected into the App namespace via App._initSimulator()
// ═══════════════════════════════════════════════════════════════════════════

(function () {

  // ─── SCENE DATA ────────────────────────────────────────────────────────────
  const SCENES = [
    { id: 'restaurant',   name: 'Restaurant',        emoji: '🍽️', color: '#FF6B35', desc: 'Order food, ask about the menu',         tag: 'Everyday',       avatar: '👨‍🍳', avatarName: 'Marco (Waiter)',          sub: 'A restaurant in New York' },
    { id: 'airplane',     name: 'On the Airplane',   emoji: '✈️', color: '#00D4FF', desc: 'Talk to flight attendants',              tag: 'Travel',         avatar: '👩‍✈️', avatarName: 'Sarah (Flight Attendant)', sub: 'An international flight' },
    { id: 'supermarket',  name: 'Supermarket',       emoji: '🛒', color: '#00C896', desc: 'Find products, pay, ask for help',       tag: 'Shopping',       avatar: '👩‍💼', avatarName: 'Emily (Staff)',           sub: 'A supermarket in London' },
    { id: 'stadium',      name: 'Football Stadium',  emoji: '⚽', color: '#FFD700', desc: 'Chat with fans, discuss the match',      tag: 'Sports',         avatar: '🧑',  avatarName: 'Jake (Local Fan)',        sub: 'Premier League match, London' },
    { id: 'theater',      name: 'Theater',           emoji: '🎭', color: '#7B2FBE', desc: 'Buy tickets, discuss the show',          tag: 'Culture',        avatar: '👩',  avatarName: 'Diana (Usher)',           sub: 'Broadway, New York' },
    { id: 'cinema',       name: 'Cinema',            emoji: '🎬', color: '#FF4757', desc: 'Buy tickets, popcorn, discuss films',    tag: 'Entertainment',  avatar: '🧑',  avatarName: 'Tyler (Cashier)',         sub: 'A movie theater in Chicago' },
    { id: 'classroom',    name: 'Classroom',         emoji: '📚', color: '#00D4FF', desc: 'Talk to teachers, ask questions',        tag: 'Academic',       avatar: '👨‍🏫', avatarName: 'Prof. Williams',          sub: 'English university' },
    { id: 'home',         name: 'At Home',           emoji: '🏠', color: '#00C896', desc: 'Chat with your roommate',                tag: 'Everyday',       avatar: '👩',  avatarName: 'Lisa (Roommate)',         sub: 'Shared apartment in London' },
    { id: 'christmas',    name: 'Christmas Party',   emoji: '🎄', color: '#FF4757', desc: 'Holiday greetings and traditions',       tag: 'Holidays',       avatar: '👴',  avatarName: 'Uncle Bob',               sub: 'Family Christmas, USA' },
    { id: 'family-lunch', name: 'Family Lunch',      emoji: '👨‍👩‍👧', color: '#FF6B35', desc: 'Sunday lunch conversation',          tag: 'Family',         avatar: '👩',  avatarName: 'Grandma Ruth',            sub: 'Sunday family lunch' },
    { id: 'job-interview',name: 'Job Interview',     emoji: '💼', color: '#7B2FBE', desc: 'Professional English for interviews',    tag: 'Career',         avatar: '👨‍💼', avatarName: 'Mr. Harris (HR)',         sub: 'International company, London' },
    { id: 'hotel',        name: 'Hotel Check-in',    emoji: '🏨', color: '#FFD700', desc: 'Check in, ask about amenities',          tag: 'Travel',         avatar: '👩‍💼', avatarName: 'Clara (Receptionist)',    sub: '4-star hotel, London' },
    { id: 'doctor',       name: "Doctor's Office",   emoji: '🏥', color: '#00C896', desc: 'Describe symptoms, medical questions',   tag: 'Health',         avatar: '👨‍⚕️', avatarName: 'Dr. Mitchell',            sub: 'GP clinic, USA' },
    { id: 'airport',      name: 'Airport',           emoji: '🛫', color: '#00D4FF', desc: 'Check in luggage, passport control',     tag: 'Travel',         avatar: '👩',  avatarName: 'Officer Kim',             sub: 'International Airport' },
    { id: 'bank',         name: 'Bank',              emoji: '🏦', color: '#FFD700', desc: 'Open account, transfers, fees',          tag: 'Finance',        avatar: '👨‍💼', avatarName: 'Daniel (Banker)',         sub: 'High street bank, UK' },
    { id: 'cafe',         name: 'Coffee Shop',       emoji: '☕', color: '#FF6B35', desc: 'Order coffee, small talk',               tag: 'Everyday',       avatar: '👩',  avatarName: 'Zoe (Barista)',           sub: 'A cozy café in Seattle' }
  ];

  // ─── QUESTION BANK ─────────────────────────────────────────────────────────
  const QB = {
    restaurant: [
      { q: "Good evening! Do you have a reservation?", hint: "Say yes/no + your name. E.g.: 'Yes, I have a reservation under the name Johnson.'", translation: "Boa noite! Você tem uma reserva?", accept: [/yes.*reservation|reservation.*name|no.*reservation|i (have|don'?t have|made)/i, /table for/i, /name is|under|booked/i], correction: "Yes, I have a reservation under the name Johnson, for two people.", explanation: "Use 'I have a reservation under the name...' to give your booking name.", rule: "Polite Requests — Would Like" },
      { q: "What would you like to drink to start?", hint: "Use 'I'd like...' or 'Could I have...' + drink.", translation: "O que você gostaria de beber para começar?", accept: [/i'?d like|could i have|can i get|i'll have|i want/i, /water|juice|wine|beer|soda|coke|tea|coffee|lemonade/i], correction: "I'd like a glass of sparkling water, please.", explanation: "Use 'I'd like...' — polite and very common in restaurants.", rule: "Polite Requests — Would Like" },
      { q: "Are you ready to order, or do you need a few more minutes?", hint: "Say if you're ready or not.", translation: "Você está pronto para pedir?", accept: [/ready|order|few more|minute|moment|yes|sure|actually/i], correction: "Yes, I'm ready to order. I'd like the pasta, please.", explanation: "To ask for more time: 'Could we have a few more minutes?' — very polite.", rule: "Polite Requests — Would Like" },
      { q: "How would you like your steak cooked — rare, medium, or well done?", hint: "Say: 'I'd like it [rare / medium rare / medium / well done], please.'", translation: "Como você gostaria do seu bife?", accept: [/rare|medium|well.done|please|i'?d like|i want|i'll have/i], correction: "I'd like it medium rare, please.", explanation: "rare = very red, medium rare = pink, well done = fully cooked.", rule: "Polite Requests — Would Like" },
      { q: "Is everything okay with your meal?", hint: "Compliment or mention a problem. E.g.: 'Yes, it's delicious, thank you!'", translation: "Está tudo bem com a sua refeição?", accept: [/yes|delicious|amazing|great|wonderful|lovely|actually|bit|little|cold|hot|wrong|issue|thank/i], correction: "Yes, everything is delicious! The pasta is absolutely wonderful, thank you.", explanation: "To give positive feedback: 'It's delicious / amazing / wonderful.'", rule: "Compliments and Complaints" },
      { q: "Would you like to see the dessert menu?", hint: "Accept or decline politely.", translation: "Você gostaria de ver o menu de sobremesas?", accept: [/yes|please|sure|love to|bill|check|no thank|i'?m full/i], correction: "Yes, please! I'd love to see it.", explanation: "'I'd love to' is a very enthusiastic and friendly way to say yes.", rule: "Accepting & Declining Offers" },
      { q: "Can I get you anything else?", hint: "Ask for the bill, or say you're fine.", translation: "Posso trazer mais alguma coisa?", accept: [/bill|check|receipt|fine|good|that'?s all|nothing|no thank|could|please/i], correction: "Could we have the bill, please?", explanation: "In the UK say 'bill', in the USA say 'check'.", rule: "Asking for the Bill" }
    ],
    airplane: [
      { q: "Welcome aboard! Can I see your boarding pass, please?", hint: "Hand it over. E.g.: 'Of course, here you are.'", translation: "Bem-vindo a bordo! Posso ver seu cartão de embarque?", accept: [/here|of course|sure|certainly|yes|pass|boarding/i], correction: "Of course! Here you are.", explanation: "'Here you are' = when handing something to someone.", rule: "Handing Over Objects" },
      { q: "Would you like chicken or pasta for today's meal?", hint: "Choose one: 'I'd like the chicken, please.'", translation: "Você prefere frango ou macarrão?", accept: [/chicken|pasta|i'?d like|i'll have|i want|please|either/i], correction: "I'd like the chicken, please.", explanation: "Always use 'I'd like...' on planes — it's polite.", rule: "Polite Requests — Would Like" },
      { q: "Excuse me, is this seat taken?", hint: "Say yes or no. E.g.: 'No, it's free. Please, go ahead.'", translation: "Com licença, este assento está ocupado?", accept: [/no.*free|not.*taken|go ahead|empty|vacant|yes.*taken|someone|occupied/i], correction: "No, it's free. Please, go ahead!", explanation: "'Go ahead' = please proceed / feel free.", rule: "Short Natural Responses" },
      { q: "How long is the flight to London?", hint: "Give an approximate time.", translation: "Quanto tempo demora o voo para Londres?", accept: [/hour|minute|about|around|approximately|take|last|long|think/i], correction: "I think it's about nine hours, approximately.", explanation: "Use 'about' or 'around' for approximate times.", rule: "Approximation Language" },
      { q: "Could you help me put my bag in the overhead compartment?", hint: "Agree to help. E.g.: 'Of course! Let me help you.'", translation: "Você poderia me ajudar a colocar minha mala?", accept: [/of course|sure|certainly|no problem|absolutely|let me|happy to|glad/i], correction: "Of course! Let me help you with that.", explanation: "'Let me...' = I will do something for you.", rule: "Offering Help" }
    ],
    supermarket: [
      { q: "Hi! Can I help you find anything today?", hint: "Ask for a product. E.g.: 'Yes, please. I'm looking for the pasta aisle.'", translation: "Oi! Posso te ajudar a encontrar alguma coisa?", accept: [/looking for|find|where|need|yes please|could you|i'?m trying/i], correction: "Yes, please! I'm looking for the pasta aisle.", explanation: "'I'm looking for...' is the natural way to say you're searching for something.", rule: "Present Continuous — Searching" },
      { q: "Do you have a loyalty card with us?", hint: "Say yes or no.", translation: "Você tem cartão fidelidade conosco?", accept: [/yes|no|don'?t|have|here|how|get one|sign up|join/i], correction: "No, I don't have one yet. How can I get one?", explanation: "'I don't have one yet' — 'yet' suggests you might get one in the future.", rule: "Negative with 'yet'" },
      { q: "That'll be £24.50. How would you like to pay?", hint: "Say your payment method.", translation: "Serão £24,50. Como você gostaria de pagar?", accept: [/card|cash|contactless|apple pay|pay|credit|debit/i], correction: "I'll pay by card, please.", explanation: "'I'll pay by card/cash' is the standard way to say how you want to pay.", rule: "Payment Phrases" },
      { q: "Excuse me, do you know where I can find the olive oil?", hint: "Give directions or say you don't know.", translation: "Você sabe onde posso encontrar o azeite?", accept: [/aisle|next to|near|beside|left|right|end|section|shelf|know|sure|sorry/i], correction: "Yes, it's in aisle 3, next to the sauces.", explanation: "Give location with 'next to', 'near', 'at the end of'.", rule: "Prepositions of Place" }
    ],
    stadium: [
      { q: "Mate, what do you think of the game so far?", hint: "Give your opinion! E.g.: 'I think it's been really exciting!'", translation: "Cara, o que você acha do jogo até agora?", accept: [/think|believe|exciting|amazing|terrible|slow|good|bad|great|boring|honestly|really/i], correction: "I think it's been really exciting! Both teams are playing brilliantly.", explanation: "Use 'I think...' or 'In my opinion...' to give your view.", rule: "Expressing Opinions" },
      { q: "Did you see that goal? It was absolutely incredible!", hint: "Agree enthusiastically!", translation: "Você viu aquele gol? Foi absolutamente incrível!", accept: [/yes|amazing|incredible|unbelievable|couldn'?t believe|what a|brilliant|fantastic|saw|seen/i], correction: "Yes! I couldn't believe it! What an incredible goal!", explanation: "'What a + noun!' is used for exclamations of admiration.", rule: "Exclamations — What a!" },
      { q: "Who do you support? Are you a regular at matches?", hint: "Name your team and say if you go often.", translation: "Qual time você torce?", accept: [/support|follow|fan|team|come|go|often|sometimes|first time|always|regular/i], correction: "I support Arsenal and I try to come to as many matches as I can.", explanation: "'I try to + verb' = you make an effort to do something.", rule: "Frequency Expressions" },
      { q: "Can you believe the referee gave that penalty?", hint: "Agree or disagree.", translation: "Você acredita que o árbitro marcou aquele pênalti?", accept: [/no|yes|terrible|unfair|fair|right|wrong|deserved|shouldn'?t|completely|think|believe/i], correction: "No, I can't believe it! That was a terrible decision by the referee.", explanation: "To strongly disagree: 'I can't believe it!' / 'That's outrageous!'", rule: "Expressing Disbelief" }
    ],
    theater: [
      { q: "Good evening! Could I see your tickets, please?", hint: "Hand them over.", translation: "Boa noite! Posso ver seus ingressos?", accept: [/here|of course|certainly|tickets|seats|where|row|section/i], correction: "Of course! Here they are. Could you tell us where our seats are?", explanation: "At a theater: 'stalls' = ground floor, 'circle' = upper level.", rule: "Theater Vocabulary" },
      { q: "Have you seen this show before?", hint: "Use present perfect. E.g.: 'No, this is my first time!'", translation: "Você já viu este espetáculo antes?", accept: [/seen|first time|yes|no|never|before|twice|once|already|heard/i], correction: "No, this is my first time! I've heard wonderful things about it though.", explanation: "'Have you ever...?' uses Present Perfect for experiences.", rule: "Present Perfect — Experiences" },
      { q: "Would you like a programme for tonight's show?", hint: "Accept or decline politely.", translation: "Você gostaria de um programa do espetáculo?", accept: [/yes|please|how much|cost|price|no thank|fine|i'?m good/i], correction: "Yes, please! How much is it?", explanation: "A 'programme' (UK) / 'program' (US) = the booklet describing the show.", rule: "Accepting & Declining Offers" }
    ],
    cinema: [
      { q: "Hi! Which movie are you here to see tonight?", hint: "Name the film and showtime.", translation: "Qual filme você vai ver esta noite?", accept: [/here to see|watching|film|movie|showing|o'?clock|pm|tonight|tickets/i], correction: "I'm here to see the new thriller — the 8 o'clock showing.", explanation: "'I'm here to see...' = my purpose. 'Showing' = a specific screening time.", rule: "Cinema Vocabulary" },
      { q: "Would you like anything from the concession stand?", hint: "Order snacks!", translation: "Gostaria de algo da lanchonete?", accept: [/popcorn|coke|soda|drink|nachos|candy|sweet|yes|no|i'?d like|large|medium|small/i], correction: "Yes! A large popcorn and a medium Coke, please.", explanation: "Sizes: small, medium, large. Always specify when ordering.", rule: "Ordering Snacks" },
      { q: "Which genre of film do you enjoy most?", hint: "Name your favourite genre.", translation: "Qual gênero de filme você mais gosta?", accept: [/love|enjoy|like|prefer|thriller|comedy|drama|action|sci.fi|horror|romance|documentary/i], correction: "I love thrillers and sci-fi films. They keep me on the edge of my seat!", explanation: "'They keep me on the edge of my seat' = they are very exciting.", rule: "Expressing Opinions" }
    ],
    classroom: [
      { q: "Good morning. Did you all complete the reading for today?", hint: "Answer honestly.", translation: "Bom dia. Todos completaram a leitura de hoje?", accept: [/yes|no|did|didn'?t|finished|completed|read|sorry|interesting|found|had time/i], correction: "Yes, I did, Professor. I found the reading very interesting.", explanation: "Short answer: 'Yes, I did.' — avoids repetition.", rule: "Short Answers with Auxiliaries" },
      { q: "Can anyone explain what the main argument of the chapter was?", hint: "Try to summarize.", translation: "Alguém pode explicar o argumento principal?", accept: [/main|argue|argument|author|chapter|believe|think|point|idea|suggest|claim|basically/i], correction: "I believe the author argued that globalization has both positive and negative effects.", explanation: "Academic language: 'The author argues/suggests/claims that...'", rule: "Academic Reporting Verbs" },
      { q: "For your assignment, write 500 words on climate change. Any questions?", hint: "Ask about the deadline.", translation: "Escreva 500 palavras sobre mudanças climáticas. Alguma dúvida?", accept: [/due|deadline|when|references|format|submit|hand in|include|question|citation/i], correction: "Yes, Professor. When is the assignment due, and should we include references?", explanation: "'When is it due?' = What is the deadline?", rule: "Academic Questions" },
      { q: "Excuse me, could you speak up a little? I can't quite hear you.", hint: "Apologize and speak louder.", translation: "Você poderia falar um pouco mais alto?", accept: [/sorry|apologize|better|louder|this|of course|certainly|sure/i], correction: "I'm so sorry, Professor! Is this better? I'll try to speak louder.", explanation: "Apologize first, then offer a solution.", rule: "Classroom Apologies" }
    ],
    home: [
      { q: "Hey! I made pasta for dinner. Are you hungry?", hint: "React warmly.", translation: "Ei! Fiz macarrão para o jantar. Você está com fome?", accept: [/yes|starving|hungry|sounds|amazing|sweet|lovely|thank|great|wonderful|smells/i], correction: "Oh, that sounds amazing! I'm absolutely starving, thank you!", explanation: "'I'm starving' = informal for very hungry.", rule: "Informal Intensifiers" },
      { q: "Whose turn is it to do the washing up tonight?", hint: "Say it's your turn or theirs.", translation: "De quem é a vez de lavar a louça hoje?", accept: [/my turn|your turn|yesterday|last time|think|actually|did|i'll do|fair/i], correction: "I think it's my turn tonight. I'll do it after dinner.", explanation: "'It's my turn' = it's my time to do something.", rule: "Making Decisions — Will" },
      { q: "Have you paid the electricity bill this month?", hint: "Answer with yes/no.", translation: "Você pagou a conta de luz este mês?", accept: [/yes|no|paid|haven'?t|already|yet|forgot|i'll pay|remember/i], correction: "Yes, I've already paid it. I did it online yesterday.", explanation: "'I've already paid it' = Present Perfect. 'Already' = before now.", rule: "Present Perfect — Already/Yet" },
      { q: "What are your plans for the weekend?", hint: "Tell your plans.", translation: "Quais são seus planos para o fim de semana?", accept: [/going to|planning|thinking|might|hope|want|visit|meet|stay|relax|weekend|probably/i], correction: "I'm planning to visit some friends on Saturday and relax at home on Sunday.", explanation: "'I'm planning to...' and 'I'm going to...' both express future plans.", rule: "Future Plans" }
    ],
    christmas: [
      { q: "Merry Christmas! Did Santa bring you anything nice this year?", hint: "Get festive!", translation: "Feliz Natal! O Papai Noel te trouxe algo legal?", accept: [/merry|happy|christmas|got|received|gift|present|naughty|nice|santa|yes|no/i], correction: "Merry Christmas! Yes, I got some wonderful gifts this year. I'm very grateful.", explanation: "'I got' = informal past simple for receiving.", rule: "Past Simple — Receiving" },
      { q: "What are you having for Christmas dinner?", hint: "Describe the meal.", translation: "O que vocês vão comer no jantar de Natal?", accept: [/turkey|ham|beef|chicken|roast|dinner|having|cooking|traditional|family|preparing/i], correction: "We're having roast turkey with all the trimmings — potatoes, sprouts and gravy.", explanation: "'All the trimmings' = all the traditional side dishes.", rule: "Present Continuous for Future Plans" },
      { q: "Do you prefer giving or receiving gifts?", hint: "Share your opinion!", translation: "Você prefere dar ou receber presentes?", accept: [/prefer|love|enjoy|giving|receiving|both|because|makes me|feel|happy|special/i], correction: "I love giving gifts because seeing people's reactions makes me really happy.", explanation: "'Because' introduces the reason.", rule: "Expressing Preferences with Because" }
    ],
    'family-lunch': [
      { q: "So, how are your studies going, dear?", hint: "Update about your studies.", translation: "Como estão os seus estudos?", accept: [/going|well|good|great|studying|learning|difficult|easy|enjoying|progress|hard/i], correction: "They're going really well, thank you! I've been studying English and making great progress.", explanation: "'They're going well' = things are progressing well.", rule: "Present Perfect Continuous" },
      { q: "When are you planning to move abroad?", hint: "Tell your plans.", translation: "Quando você planeja se mudar para o exterior?", accept: [/planning|going to|hope|want|year|month|soon|maybe|probably|not sure|thinking/i], correction: "I'm planning to move next year, once I've improved my English enough.", explanation: "'Once I've + past participle' = when that thing is done.", rule: "Future after 'Once'" },
      { q: "Have you tried the potato salad? I made it myself!", hint: "React positively.", translation: "Você experimentou a salada de batata?", accept: [/yes|tried|delicious|amazing|wonderful|lovely|not yet|pass|could|taste|best/i], correction: "Yes! It's absolutely delicious, Grandma! You're such a wonderful cook.", explanation: "'You're such a...' is stronger than 'You're very...' for compliments.", rule: "Compliments — Such a" }
    ],
    'job-interview': [
      { q: "Could you tell me a little about yourself and your background?", hint: "Introduce yourself professionally.", translation: "Você poderia me contar sobre você e sua experiência?", accept: [/degree|experience|background|worked|studied|graduated|skills|years|qualified|professional/i], correction: "Of course. I have a degree in Business Administration and three years of experience in marketing.", explanation: "Start with your degree, then experience.", rule: "Professional Self-Introduction" },
      { q: "Why are you interested in this position?", hint: "Show enthusiasm!", translation: "Por que você está interessado nessa vaga?", accept: [/interested|excited|passionate|love|skills|experience|because|opportunity|company|role|believe|match/i], correction: "I'm really excited about this role because it aligns perfectly with my skills and career goals.", explanation: "'It aligns with' = it matches / fits with.", rule: "Job Interview Vocabulary" },
      { q: "What would you say is your greatest weakness?", hint: "Be honest but positive!", translation: "Qual é sua maior fraqueza?", accept: [/sometimes|struggle|working on|improving|used to|weakness|but|however|now|better|challenge|learning/i], correction: "I sometimes struggle with public speaking, but I've been working on it by taking a course.", explanation: "Always follow a weakness with 'but I've been working on it'.", rule: "Turning Negatives Positive" },
      { q: "Where do you see yourself in five years?", hint: "Show ambition.", translation: "Onde você se vê em cinco anos?", accept: [/five years|hope|like to|grow|develop|advance|lead|manage|career|within|company/i], correction: "In five years, I hope to have developed my skills and be taking on leadership responsibilities.", explanation: "'I hope to have + past participle' = future perfect.", rule: "Future Perfect — Career Goals" }
    ],
    hotel: [
      { q: "Welcome to The Grand. Do you have a reservation with us?", hint: "Confirm your booking.", translation: "Bem-vindo ao The Grand. Você tem uma reserva?", accept: [/yes|reservation|booking|name|booked|under|nights|room/i], correction: "Good afternoon! Yes, I have a reservation. The name is Johnson, for three nights.", explanation: "Always give your name and number of nights when checking in.", rule: "Hotel Check-in Phrases" },
      { q: "Would you like a room with a city view or a garden view?", hint: "Choose and justify.", translation: "Você prefere vista para a cidade ou para o jardim?", accept: [/city|garden|prefer|view|please|love|beautiful|quiet|light|night|morning/i], correction: "I'd prefer the city view, please. I love seeing the city lights at night.", explanation: "'I'd prefer...' = more polite than 'I want'.", rule: "Expressing Preferences" },
      { q: "Is there anything I can help you with during your stay?", hint: "Ask for information.", translation: "Há algo com que eu possa ajudá-lo?", accept: [/breakfast|gym|spa|wifi|pool|check.out|taxi|restaurant|time|information|could you|where|when/i], correction: "Could you tell me what time breakfast is served and whether the pool is open?", explanation: "'Could you tell me...?' = indirect question. More polite.", rule: "Indirect Questions" }
    ],
    doctor: [
      { q: "Hello! What seems to be the problem today?", hint: "Describe your symptoms.", translation: "Qual parece ser o problema hoje?", accept: [/pain|hurt|sore|ache|throat|head|stomach|feel|since|been|days|week|symptoms/i], correction: "I've been having a sore throat for the past three days, and I also have a slight fever.", explanation: "'I've been having' = Present Perfect Continuous.", rule: "Present Perfect Continuous" },
      { q: "On a scale of 1 to 10, how would you rate your pain?", hint: "Give a number and describe it.", translation: "De 1 a 10, como você classificaria sua dor?", accept: [/say|about|rate|pain|dull|sharp|constant|throbbing|burning|number|scale|would/i], correction: "I'd say about a 6. It's a dull, constant ache that doesn't go away.", explanation: "Describe pain: dull = low-level, sharp = intense, throbbing = pulsing.", rule: "Medical Pain Vocabulary" },
      { q: "Are you allergic to any medications?", hint: "Say yes or no.", translation: "Você é alérgico a algum medicamento?", accept: [/allergic|allergy|penicillin|aspirin|yes|no|not.*know|aware|react/i], correction: "No, I'm not allergic to anything that I'm aware of.", explanation: "'That I'm aware of' = to the best of my knowledge.", rule: "Qualified Statements" }
    ],
    airport: [
      { q: "Good morning. Can I see your passport and boarding pass?", hint: "Hand it over.", translation: "Posso ver seu passaporte e cartão de embarque?", accept: [/here|of course|certainly|sure|passport|boarding|also|question|ask/i], correction: "Of course! Here you are. Could I also ask which gate my flight departs from?", explanation: "'Could I also ask...' = adds a polite question.", rule: "Compound Polite Requests" },
      { q: "What is the purpose of your visit?", hint: "State your reason.", translation: "Qual é o motivo da sua visita?", accept: [/tourism|tourist|business|conference|visit|family|friends|study|work|holiday|vacation/i], correction: "I'm here for tourism. I'll be visiting London for two weeks.", explanation: "'I'm here for...' = my purpose is...", rule: "Stating Purpose" },
      { q: "Do you have anything to declare at customs?", hint: "Say yes or no.", translation: "Você tem algo a declarar na alfândega?", accept: [/no|yes|don'?t have|nothing|declare|anything|items|goods|carrying/i], correction: "No, I don't have anything to declare. Just my personal belongings.", explanation: "'Just my personal belongings' = only things I use personally.", rule: "Customs Vocabulary" }
    ],
    bank: [
      { q: "Good morning! How can I help you today?", hint: "State your reason.", translation: "Como posso ajudá-lo hoje?", accept: [/open|account|transfer|withdraw|deposit|card|statement|balance|loan|current|savings|please/i], correction: "Good morning! I'd like to open a current account, please.", explanation: "'Current account' (UK) = 'checking account' (US).", rule: "Banking Vocabulary" },
      { q: "Could I see some form of identification, please?", hint: "Confirm what you have.", translation: "Poderia me mostrar alguma forma de identificação?", accept: [/passport|driving.*licence|id|identification|utility|bill|acceptable|have|here|certainly/i], correction: "Of course. I have my passport and a recent utility bill. Is that sufficient?", explanation: "'Is that sufficient?' = Is that enough?", rule: "Formal Confirmation Questions" },
      { q: "Are you looking to deposit or withdraw today?", hint: "State your banking need.", translation: "Você quer depositar ou sacar hoje?", accept: [/deposit|withdraw|transfer|cash|cheque|savings|please|i'?d like|want to|actually/i], correction: "I'd like to deposit some cash into my savings account, please.", explanation: "Deposit = put money in. Withdraw = take money out.", rule: "Banking Vocabulary" }
    ],
    cafe: [
      { q: "Hi there! What can I get for you today?", hint: "Order your coffee.", translation: "Oi! O que posso te servir hoje?", accept: [/i'?d like|could i have|can i get|i'll have|latte|cappuccino|americano|flat white|espresso|coffee|tea|please/i], correction: "I'd like a large flat white with oat milk, please.", explanation: "'To go' = takeaway. 'For here' = drink in the café.", rule: "Ordering in a Café" },
      { q: "Would you like any food? We have fresh pastries today.", hint: "Accept or decline.", translation: "Gostaria de alguma comida?", accept: [/yes|no|croissant|muffin|cake|pastry|lovely|sounds|just|only|thank|coffee/i], correction: "Oh, that sounds lovely! I'll have a croissant, please.", explanation: "'That sounds lovely!' = enthusiastic acceptance.", rule: "Enthusiastic Acceptance" },
      { q: "Is it okay if I sit here and use the WiFi for a bit?", hint: "Say yes and maybe give the password.", translation: "Posso sentar aqui e usar o WiFi?", accept: [/of course|sure|certainly|no problem|yes|please|go ahead|wifi|password|menu|feel free/i], correction: "Of course! Feel free to sit wherever you like. The WiFi password is on the menu.", explanation: "'Feel free to...' = you are welcome to.", rule: "Giving Permission Warmly" }
    ]
  };

  // ─── GRAMMAR DB ────────────────────────────────────────────────────────────
  const GRAMMAR_DB = {
    "Polite Requests — Would Like": { explanation: "'I'd like' (= I would like) is the polite way to request things. Much more polite than 'I want'.", rule: "I'd like + noun  OR  I'd like to + verb", examples: ["I'd like a coffee, please.", "I'd like to make a reservation.", "We'd like the bill, please."] },
    "Present Continuous — Searching": { explanation: "Use 'am/is/are + verb-ing' for actions happening right now.", rule: "I am / She is / They are + verb-ing", examples: ["I'm looking for the bread section.", "I'm trying to find the dairy aisle.", "Are you looking for anything specific?"] },
    "Negative with 'yet'": { explanation: "'Yet' in negatives means something hasn't happened but might in the future.", rule: "I haven't done it yet. / I don't have one yet.", examples: ["I don't have one yet.", "I haven't signed up yet.", "I haven't tried that product yet."] },
    "Payment Phrases": { explanation: "Use 'pay by' or 'pay with' + your payment method.", rule: "I'll pay by card/cash. / Can I pay with cash?", examples: ["I'll pay by card.", "Can I pay with cash?", "Do you accept contactless?"] },
    "Prepositions of Place": { explanation: "next to = beside. near = close to. at the end of = at the far side.", rule: "next to / near / at the end of / on the left / on the right", examples: ["It's next to the pasta.", "It's near the entrance.", "At the end of aisle 4."] },
    "Expressing Opinions": { explanation: "Use these phrases to introduce opinions naturally.", rule: "I think... / I believe... / In my opinion... / Personally...", examples: ["I think it's been a great match.", "In my opinion, the referee was wrong.", "To be honest, I expected more goals."] },
    "Exclamations — What a!": { explanation: "'What a + noun!' shows strong emotion or admiration.", rule: "What a + noun! / What an + noun (before vowel)!", examples: ["What a goal!", "What a match!", "What an incredible save!"] },
    "Frequency Expressions": { explanation: "Use these to describe how often you do something.", rule: "always > usually > often > sometimes > occasionally > rarely > never", examples: ["I try to come to every home game.", "I occasionally go to away matches.", "I come whenever I can."] },
    "Expressing Disbelief": { explanation: "When shocked or strongly disagreeing.", rule: "I can't believe it! / That's outrageous! / Unbelievable!", examples: ["I can't believe he gave that!", "That's completely outrageous!", "What a terrible decision!"] },
    "Short Answers with Auxiliaries": { explanation: "In English, you repeat the auxiliary verb in short answers.", rule: "'Did you do it?' → 'Yes, I did.' / 'No, I didn't.'", examples: ["Yes, I did.", "No, I haven't.", "Yes, she can.", "No, they aren't."] },
    "Academic Reporting Verbs": { explanation: "When summarizing academic texts, use precise verbs.", rule: "The author argues / suggests / claims / states / demonstrates that...", examples: ["The author argues that...", "Smith suggests inequality is rising.", "The study demonstrates that exercise helps memory."] },
    "Academic Questions": { explanation: "Key academic phrases you'll use constantly.", rule: "When is it due? / How do I hand it in? / Should I include references?", examples: ["When is it due?", "How do we hand it in?", "Should I include a bibliography?"] },
    "Classroom Apologies": { explanation: "If you make a mistake or need to apologize in class.", rule: "I'm sorry, I... / I apologize for... / Excuse me, I didn't quite catch that.", examples: ["I'm sorry, could you repeat that?", "I apologize for being late.", "Excuse me, I didn't quite understand."] },
    "Informal Intensifiers": { explanation: "Instead of 'very', use stronger informal words.", rule: "starving = very hungry. exhausted = very tired. boiling = very hot. brilliant = very good.", examples: ["I'm absolutely starving!", "I'm exhausted after work.", "That was absolutely brilliant."] },
    "Making Decisions — Will": { explanation: "Use 'will' when you decide something at the moment of speaking.", rule: "I'll + verb (decided right now)", examples: ["I'll do the dishes.", "I'll take out the rubbish.", "I'll cook dinner tonight."] },
    "Present Perfect — Already/Yet": { explanation: "'Already' = positive sentences. 'Yet' = negatives and questions.", rule: "I've already done it. / I haven't done it yet.", examples: ["I've already paid the bill.", "I haven't called them yet.", "Have you eaten yet?"] },
    "Future Plans": { explanation: "Different structures for planning the future.", rule: "going to (definite) / planning to (organized) / might (uncertain)", examples: ["I'm going to visit Spain next month.", "I'm planning to study all week.", "I might go to the gym tomorrow."] },
    "Past Simple — Receiving": { explanation: "Use Past Simple for things that happened and are now finished.", rule: "I got / I received / She got / They received", examples: ["I got a new book.", "We received so many gifts.", "She got exactly what she wanted."] },
    "Present Continuous for Future Plans": { explanation: "Use 'am/is/are + verb-ing' for definite future plans.", rule: "I'm having dinner at 6. / We're visiting them tomorrow.", examples: ["We're having turkey for Christmas.", "They're visiting relatives tomorrow.", "I'm cooking for twelve people!"] },
    "Expressing Preferences with Because": { explanation: "Use 'because' to explain your preference.", rule: "I prefer + verb-ing + because... / I'd rather + verb + than + verb", examples: ["I prefer giving gifts because it's meaningful.", "I'd rather receive — I love surprises!", "I enjoy both equally, to be honest."] },
    "Present Perfect Continuous": { explanation: "Have/has + been + verb-ing — for actions that started in the past and are still continuing.", rule: "I have been / She has been + verb-ing", examples: ["I've been studying English for a year.", "She's been working there since 2020.", "We've been living here for five years."] },
    "Future after 'Once'": { explanation: "After 'once', use present or present perfect (NOT future).", rule: "Once I finish... / Once I've finished... + future result", examples: ["Once I've saved enough money, I'll go.", "Once you learn the basics, it gets easier.", "I'll call you once I arrive."] },
    "Compliments — Such a": { explanation: "'Such a + adjective + noun' is stronger than 'very + adjective'.", rule: "You're such a + adjective + noun!", examples: ["You're such a wonderful cook!", "This is such a delicious meal!", "You've been such a great host."] },
    "Professional Self-Introduction": { explanation: "Key phrases for professional introductions.", rule: "I have a degree in... / I have X years of experience in... / I'm currently...", examples: ["I have a degree in Engineering.", "I have five years of experience in finance.", "I currently work as a project manager."] },
    "Job Interview Vocabulary": { explanation: "Strong vocabulary for job interviews.", rule: "aligns with / passionate about / long-term goal / contribute", examples: ["This role aligns with my skills.", "I'm passionate about digital marketing.", "I hope to contribute to your team's growth."] },
    "Turning Negatives Positive": { explanation: "Structure: weakness + but + what you're doing about it.", rule: "I sometimes struggle with X, but I've been working on it by doing Y.", examples: ["I struggle with delegating, but I've been improving.", "I used to have trouble with deadlines, but now I use project tools.", "I'm learning to be more patient."] },
    "Future Perfect — Career Goals": { explanation: "Will have + past participle — for something you expect to complete by a future point.", rule: "I will have + past participle + by [time]", examples: ["I hope to have gained management experience.", "In five years, I will have led several projects.", "I'll have developed advanced technical skills."] },
    "Hotel Check-in Phrases": { explanation: "Key phrases when checking into a hotel.", rule: "I have a reservation under... / I booked a room for X nights.", examples: ["I have a reservation under Smith.", "I booked a double room for two nights.", "I'd like to check in, please."] },
    "Expressing Preferences": { explanation: "Different ways to express what you prefer.", rule: "I'd prefer... / I'd rather have... / Either would be fine.", examples: ["I'd prefer the garden view.", "I'd rather have a quiet room.", "Either room would be fine, thank you."] },
    "Indirect Questions": { explanation: "Indirect questions are more polite. Word order changes — no inversion.", rule: "Could you tell me + where/what/when... (normal word order)", examples: ["Could you tell me where the gym is?", "Do you know what time check-out is?", "Could you let me know if the spa is open?"] },
    "Describing Symptoms": { explanation: "Key patterns for describing how you feel at the doctor.", rule: "I have a + noun / I've been + verb-ing / It hurts when I...", examples: ["I have a terrible headache.", "I've been feeling nauseous since yesterday.", "It hurts when I swallow."] },
    "Medical Pain Vocabulary": { explanation: "Different ways to describe the type of pain.", rule: "dull / sharp / throbbing / burning / stabbing / constant", examples: ["It's a dull, throbbing pain.", "I have a sharp pain when I move.", "It's a burning sensation."] },
    "Qualified Statements": { explanation: "When you're not 100% sure, add qualifying phrases.", rule: "as far as I know / to the best of my knowledge / that I'm aware of", examples: ["I'm not allergic to anything I'm aware of.", "As far as I know, I'm healthy.", "I think my last vaccine was two years ago."] },
    "Compound Polite Requests": { explanation: "To add a second request politely.", rule: "Could I also...? / While I'm here, could you...?", examples: ["Could I also ask about the gate?", "While I'm here, could you check my seat?", "One more thing — is the flight on time?"] },
    "Stating Purpose": { explanation: "Different ways to state why you are somewhere.", rule: "I'm here for + noun / I'm here to + verb / I'll be + verb-ing", examples: ["I'm here for tourism.", "I'm here to attend a conference.", "I'll be staying for two weeks."] },
    "Customs Vocabulary": { explanation: "Key vocabulary for going through customs.", rule: "declare / personal belongings / duty-free / prohibited items", examples: ["I have nothing to declare.", "These are just personal belongings.", "I bought this duty-free."] },
    "Banking Vocabulary": { explanation: "Key banking terms in English.", rule: "current account / savings account / transfer / withdraw / deposit", examples: ["I'd like to open a current account.", "I need to make a bank transfer.", "I'd like to deposit some cash."] },
    "Formal Confirmation Questions": { explanation: "Formal questions used in banking and professional settings.", rule: "Is that sufficient? / Is that acceptable? / Could you clarify...?", examples: ["Is that sufficient for opening an account?", "Is a driving licence acceptable?", "Could you clarify the fee structure?"] },
    "Ordering in a Café": { explanation: "Coffee types and ordering vocabulary.", rule: "I'd like a + size + type + milk option, please.", examples: ["I'd like a large latte, please.", "Could I have a cappuccino to go?", "A flat white for here, please."] },
    "Enthusiastic Acceptance": { explanation: "Ways to enthusiastically accept an offer.", rule: "That sounds lovely! / I'd love that! / Why not! / Go on then!", examples: ["That sounds lovely, yes please!", "I'd love one, thank you!", "Go on then, I'll have one!"] },
    "Giving Permission Warmly": { explanation: "Warm ways to give someone permission.", rule: "Feel free to... / Please go ahead. / By all means. / Make yourself at home.", examples: ["Feel free to sit anywhere.", "Please go ahead!", "By all means, take your time."] },
    "Theater Vocabulary": { explanation: "Key vocabulary for the theater.", rule: "stalls / circle / balcony / row / seat number / interval", examples: ["We're in Row D of the stalls.", "Our seats are in the upper circle.", "Is there an interval tonight?"] },
    "Present Perfect — Experiences": { explanation: "Present Perfect for experiences in your life.", rule: "Have/has + past participle. Have you ever...?", examples: ["I've seen this show three times!", "I've never been to the theater.", "Have you ever seen Hamilton?"] },
    "Accepting & Declining Offers": { explanation: "Polite ways to accept or decline.", rule: "Accept: Yes, please! / I'd love to! / Decline: No, thank you. / Not right now.", examples: ["Yes, please! I'd love some.", "No, thank you. Just the bill, please.", "That would be lovely, thank you."] },
    "Cinema Vocabulary": { explanation: "Key vocabulary for the cinema.", rule: "showing/screening / trailer / subtitles / 3D/IMAX / matinée", examples: ["I'd like two tickets for the 7pm showing.", "Is there a 3D version?", "Which screen is it on?"] },
    "Ordering Snacks": { explanation: "How to order with sizes in English.", rule: "small / medium / large / extra large", examples: ["A large popcorn, please.", "Medium Coke to share.", "I'd like a small nachos and a regular drink."] },
    "Handing Over Objects": { explanation: "When giving something to someone.", rule: "Here you are. / Here it is! / There you go.", examples: ["Here you are.", "Here it is!", "There you go."] },
    "Short Natural Responses": { explanation: "Common short phrases used in everyday English.", rule: "Go ahead. / Not at all. / By all means. / Be my guest.", examples: ["No, it's free. Go ahead!", "Not at all, please sit down.", "Of course! By all means."] },
    "Approximation Language": { explanation: "How to express approximate values.", rule: "about / around / approximately / roughly / nearly / almost", examples: ["It takes about 9 hours.", "The flight is roughly 5 hours.", "It's approximately 3,000 miles."] },
    "Offering Help": { explanation: "Natural ways to offer help.", rule: "Let me + verb / Allow me. / I'll get that for you.", examples: ["Let me help you with that.", "Allow me to carry that for you.", "I'll get it — no worries!"] },
    "Compliments and Complaints": { explanation: "How to compliment or complain politely.", rule: "Compliment: It's delicious/amazing. Complaint: Actually, it's a bit cold/salty.", examples: ["The steak is absolutely delicious!", "Actually, my soup is a bit cold.", "Everything has been wonderful, thank you."] },
    "Asking for the Bill": { explanation: "UK says 'bill', US says 'check' — same thing.", rule: "Could we have the bill/check, please?", examples: ["Could we have the bill, please? (UK)", "Can we get the check? (US)", "Excuse me, we're ready to pay."] }
  };

  // ─── GRAMMAR CHECKS ────────────────────────────────────────────────────────
  const CHECKS = [
    { p: /^(go|went|am|is|are|was|were|have|has|had|do|did|can|will|would|could|should|may|might)\b/i, u: /^(go ahead|have a|yes|no|not|sure|of course|here|there|please|ok)/i, e: "Missing subject", h: "Start your sentence with a subject: I, we, you, they, he, she, it." },
    { p: /\bme (am|is|are|was|were|have|has|had|do|did|can|will|would)\b/i, u: null, e: "Use 'I' as subject, not 'me'", h: "Example: 'I am going' — not 'Me am going'." },
    { p: /\b(he|she|it)\s+(go|have|do|work|make|take|want|need|like|know|think|say|come|look|find|give)\b/i, u: null, e: "Third person singular needs -s/es", h: "He/she/it: 'She goes', 'He works', 'It needs'." },
    { p: /\bdon'?t\s+have\s+no\b|\bcan'?t\s+do\s+nothing\b/i, u: null, e: "Double negative", h: "In English: 'I don't have any' — NOT 'I don't have no'." },
    { p: /\ba\s+(a|e|i|o|u|hour|honest)/i, u: null, e: "Use 'an' before a vowel sound", h: "'an apple', 'an hour', 'an umbrella', 'an idea'." },
    { p: /\b(i|we|they|he|she)\s+(goed|catched|taked|maked|putted|runned|holded|standed)\b/i, u: null, e: "Irregular verb — wrong past form", h: "go→went, catch→caught, take→took, make→made, put→put, run→ran." },
    { p: /^.{0,5}$/, u: /^(yes|no|ok|sure|fine|great|good|thanks|please|sorry|hello|hi|here|of)/i, e: "Answer too short", h: "Try to answer in a complete sentence with a subject and verb." }
  ];

  // ─── STATE ─────────────────────────────────────────────────────────────────
  let scene = null, qBank = [], qIdx = 0, curQ = null;
  let score = 0, streak = 0, attempts = 0, done = false;
  let convoVoice = null, convoRate = 0.82, convoSpeaking = false;

  // ─── VOICE for SIMULATOR ───────────────────────────────────────────────────
  function loadConvoVoices() {
    if (!('speechSynthesis' in window)) return;
    const all = speechSynthesis.getVoices();
    const eng = all.filter(v => v.lang.startsWith('en'));
    const voices = eng.length ? eng : all;
    const sel = document.getElementById('convo-vs');
    if (!sel) return;
    sel.innerHTML = '';
    voices.forEach((v, i) => {
      const o = document.createElement('option');
      o.value = i; o.textContent = `${v.name} (${v.lang})`; sel.appendChild(o);
    });
    let idx = voices.findIndex(v => v.lang === 'en-US');
    if (idx < 0) idx = voices.findIndex(v => v.lang === 'en-GB');
    if (idx < 0) idx = 0;
    sel.value = idx; convoVoice = voices[idx];
    sel.onchange = () => { convoVoice = voices[parseInt(sel.value)]; };
  }

  function convoSpeak(text, onEnd) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const clean = text.replace(/[\u{1F300}-\u{1FAFF}✅❌📖💡🔧📝🇧🇷]/gu, '').replace(/\*\*/g, '').replace(/\n/g, ' ').trim();
    const utt = new SpeechSynthesisUtterance(clean);
    if (convoVoice) utt.voice = convoVoice;
    utt.rate = convoRate; utt.pitch = 1.0;
    utt.lang = convoVoice ? convoVoice.lang : 'en-US';
    const avWrap = document.getElementById('convo-av-wrap');
    const ttsBtn = document.getElementById('convo-tts-q');
    utt.onstart = () => {
      convoSpeaking = true;
      if (avWrap) avWrap.classList.add('convo-speaking');
      if (ttsBtn) { ttsBtn.innerHTML = '⏸ Pausar'; ttsBtn.classList.add('playing'); }
    };
    utt.onend = utt.onerror = () => {
      convoSpeaking = false;
      if (avWrap) avWrap.classList.remove('convo-speaking');
      if (ttsBtn) { ttsBtn.innerHTML = '🔊 Ouvir'; ttsBtn.classList.remove('playing'); }
      if (onEnd) onEnd();
    };
    speechSynthesis.speak(utt);
  }

  // ─── INTERNAL screen switcher (mirrors App's showScreen logic) ────────────
  function _showScreen(id) {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  // ─── RENDER SCENES (runs once — guarded against re-render) ────────────────
  let _scenesRendered = false;
  function renderScenes() {
    const g = document.getElementById('scenes-grid-sim');
    if (!g || _scenesRendered) return;
    _scenesRendered = true;
    SCENES.forEach(s => {
      const c = document.createElement('div');
      c.className = 'scene-card-sim';
      c.style.setProperty('--sc', s.color);
      c.innerHTML = `<div class="sc-emoji-sim">${s.emoji}</div><div class="sc-name-sim">${s.name}</div><div class="sc-desc-sim">${s.desc}</div><div class="sc-tag-sim">${s.tag}</div>`;
      c.onclick = () => startScene(s);
      g.appendChild(c);
    });
  }

  // ─── START SCENE ───────────────────────────────────────────────────────────
  function startScene(s) {
    scene = s; score = 0; streak = 0; attempts = 0; done = false;
    updateBadges();
    const base = QB[s.id] || QB.restaurant;
    qBank = [...base].sort(() => Math.random() - 0.5);
    qIdx = 0;

    // Switch to conversation screen
    _showScreen('convo-active-screen');

    document.getElementById('convo-si-emoji').textContent = s.emoji;
    document.getElementById('convo-si-name').textContent  = s.name;
    document.getElementById('convo-si-sub').textContent   = s.sub;
    document.getElementById('convo-av-face').textContent  = s.avatar;
    document.getElementById('convo-av-tag').textContent   = s.avatarName;
    document.getElementById('convo-ans-area').innerHTML   = '';
    document.getElementById('convo-ans-in').value         = '';
    document.getElementById('convo-send-btn').disabled    = false;
    document.getElementById('convo-bbtns').style.display  = 'none';
    loadQuestion();
  }

  function loadQuestion() {
    done = false; attempts = 0;
    // Reshuffle when we complete a full cycle for variety
    if (qIdx > 0 && qIdx % qBank.length === 0) {
      qBank = [...qBank].sort(() => Math.random() - 0.5);
    }
    document.getElementById('convo-ans-area').innerHTML = '';
    document.getElementById('convo-send-btn').disabled  = false;
    document.getElementById('convo-bq').innerHTML       = '<div class="convo-typing-dots"><span></span><span></span><span></span></div>';
    document.getElementById('convo-bbtns').style.display = 'none';
    curQ = qBank[qIdx % qBank.length]; qIdx++;
    // Progress bar resets at 0 when cycling, fills linearly within each cycle
    const cyclePos = qIdx % qBank.length || qBank.length;
    document.getElementById('convo-qpf').style.width = ((cyclePos / qBank.length) * 100) + '%';
    setTimeout(() => {
      document.getElementById('convo-bq').textContent      = curQ.q;
      document.getElementById('convo-bbtns').style.display = 'flex';
      const inp = document.getElementById('convo-ans-in');
      if (inp) inp.focus();
      setTimeout(() => convoSpeak(curQ.q), 200);
    }, 700);
  }

  function checkGram(answer) {
    for (const c of CHECKS) {
      if (c.p.test(answer)) { if (c.u && c.u.test(answer)) continue; return { error: true, e: c.e, h: c.h }; }
    }
    return { error: false };
  }

  function submit() {
    const inp = document.getElementById('convo-ans-in');
    const ans = inp.value.trim();
    if (!ans || done) return;
    inp.value = ''; autoResize(inp);
    attempts++;
    addBubble('user', ans);
    const gram = checkGram(ans);
    if (gram.error) {
      streak = 0; updateBadges();
      addBubble('wrong', `❌ Grammar issue: ${gram.e}\n\n📖 ${gram.h}\n\n✏️ Model answer: "${curQ.correction}"\n\n${curQ.explanation}`, curQ.rule);
      convoSpeak('There is a grammar mistake. ' + gram.h + '. Try again!');
      return;
    }
    const ok = curQ.accept.some(p => p.test(ans));
    if (ok) {
      done = true; score++; streak++; updateBadges();
      let msg = '✅ Well done! Correct!\n\n';
      if (ans.toLowerCase().trim() !== curQ.correction.toLowerCase().trim()) msg += `💬 More natural: "${curQ.correction}"\n\n`;
      msg += '📖 ' + curQ.explanation;
      addBubble('ok', msg, null);
      convoSpeak('Excellent! Well done! ' + curQ.explanation);
      doConfetti(); showNextBtn();
    } else {
      streak = 0; updateBadges();
      let msg = '';
      if (attempts === 1) { msg = `Not quite right. Try again!\n\n💡 Hint: ${curQ.hint}`; }
      else if (attempts === 2) { msg = `Keep trying! 💡 ${curQ.hint}\n\n✏️ Start with: "${curQ.correction.split(' ').slice(0, 4).join(' ')}..."`; }
      else { msg = `Good effort! Here's the model answer:\n\n✏️ "${curQ.correction}"\n\n📖 ${curQ.explanation}`; done = true; showNextBtn(); }
      addBubble('wrong', msg, curQ.rule);
      convoSpeak(attempts < 3 ? 'Try again! ' + curQ.hint : 'Here is the correct answer: ' + curQ.correction);
    }
  }

  function showNextBtn() {
    setTimeout(() => {
      const btn = document.createElement('button');
      btn.className = 'convo-next-q-btn';
      btn.innerHTML = '▶ Próxima Pergunta →';
      btn.onclick = () => { btn.remove(); loadQuestion(); };
      document.getElementById('convo-ans-area').appendChild(btn);
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      document.getElementById('convo-send-btn').disabled = true;
    }, 500);
  }

  function addBubble(type, text, rule) {
    const area = document.getElementById('convo-ans-area');
    const div = document.createElement('div'); div.className = 'convo-bubble convo-bubble-' + type;
    const labels = { user: 'Sua resposta', wrong: 'Correção', ok: 'Resposta aceita! ✅', 'hint-b': 'Dica' };
    if (labels[type]) { const l = document.createElement('div'); l.className = 'convo-blbl'; l.textContent = labels[type]; div.appendChild(l); }
    const body = document.createElement('div'); body.innerHTML = text.replace(/\n/g, '<br>'); div.appendChild(body);
    if (rule && GRAMMAR_DB[rule]) {
      const t = document.createElement('button'); t.className = 'convo-grammar-tag'; t.textContent = '📘 Learn: ' + rule;
      t.onclick = () => showGrammarModal(rule); div.appendChild(t);
    }
    if (type !== 'user' && type !== 'hint-b') {
      const sp = document.createElement('button'); sp.className = 'convo-speak-mini'; sp.innerHTML = '🔊 Ouvir';
      const clean = text.replace(/[❌✅💡📖✏️🇧🇷📝]/gu, '').replace(/\n/g, ' ');
      sp.onclick = () => convoSpeak(clean); div.appendChild(sp);
    }
    area.appendChild(div);
    div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function updateBadges() {
    const sc = document.getElementById('convo-sc');
    const st = document.getElementById('convo-st');
    if (sc) sc.textContent = score;
    if (st) st.textContent = streak;
  }

  function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  function showGrammarModal(rule) {
    const g = GRAMMAR_DB[rule]; if (!g) return;
    document.getElementById('convo-mod-title').textContent = '📘 ' + rule;
    document.getElementById('convo-mod-body').innerHTML =
      `<p>${g.explanation}</p><div class="convo-rule-ex"><strong>Structure:</strong> ${g.rule}</div>` +
      g.examples.map(e => `<div class="convo-rule-ex">✅ "${e}"</div>`).join('');
    document.getElementById('convo-gmod').classList.add('show');
  }

  function doConfetti() {
    const wrap = document.getElementById('convo-cfw');
    const cols = ['#00D4FF', '#00C896', '#FFD700', '#FF6B35', '#7B2FBE', '#FF4757'];
    for (let i = 0; i < 28; i++) {
      const p = document.createElement('div'); p.className = 'convo-cfp';
      const sz = 6 + Math.random() * 8;
      p.style.cssText = `left:${Math.random() * 100}%;background:${cols[Math.floor(Math.random() * cols.length)]};width:${sz}px;height:${sz}px;animation-delay:${Math.random() * 0.5}s;animation-duration:${1 + Math.random() * 0.8}s;border-radius:${Math.random() > 0.5 ? '50%' : '3px'}`;
      wrap.appendChild(p);
      setTimeout(() => p.remove(), 2500);
    }
  }

  // ─── PUBLIC API (injected into App) ────────────────────────────────────────
  const publicAPI = {
    openConvoSimulator() {
      if ('speechSynthesis' in window) {
        loadConvoVoices();
        speechSynthesis.onvoiceschanged = loadConvoVoices;
      }
      renderScenes();
      _showScreen('convo-picker-screen');
    },

    goConvoPicker() {
      speechSynthesis.cancel();
      _showScreen('convo-picker-screen');
      scene = null; curQ = null;
    },

    convoSubmit: submit,

    convoSpeakQ() {
      if (!curQ) return;
      if (convoSpeaking) { speechSynthesis.cancel(); convoSpeaking = false; return; }
      convoSpeak(curQ.q);
    },

    convoShowHint() { if (!curQ) return; addBubble('hint-b', '💡 ' + curQ.hint); convoSpeak(curQ.hint); },
    convoShowTranslation() { if (!curQ) return; addBubble('hint-b', '🇧🇷 ' + curQ.translation); },

    convoHandleKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } },
    convoAutoResize: autoResize,
    convoCloseModal() { document.getElementById('convo-gmod').classList.remove('show'); }
  };

  // Init voice rate control
  document.addEventListener('DOMContentLoaded', () => {
    const vr = document.getElementById('convo-vr');
    const vv = document.getElementById('convo-vv');
    if (vr && vv) {
      vr.oninput = function () {
        convoRate = parseFloat(this.value);
        vv.textContent = convoRate.toFixed(2) + 'x';
      };
    }
    if ('speechSynthesis' in window) {
      loadConvoVoices();
      speechSynthesis.onvoiceschanged = loadConvoVoices;
    }
  });

  // Inject into App namespace
  Object.assign(App, publicAPI);

})();
