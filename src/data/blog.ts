/**
 * YOU LOOP Journal articles.
 *
 * Extracted verbatim from the article array that used to live inside
 * youloop_blog.html. `body` is trusted, hand-authored HTML and is rendered
 * with dangerouslySetInnerHTML, exactly as the original page did.
 */

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  seo: string[];
  readTime: string;
  category: string;
  tagColor: string;
  emoji: string;
  bgColor: string;
  body: string;
  reelHook: string;
  reelCta: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id:"01", slug:"fast-fashion-solution-custom-crochet",
    title:"The Real Problem With Fast Fashion (And Why Customisation Is the Fix)",
    subtitle:"It's not about buying less. It's about buying right.",
    seo:["fast fashion alternative","sustainable fashion 2026","custom crochet dress"],
    readTime:"1 min read", category:"Sustainability", tagColor:"#3b4a3f",
    emoji:"🌱",
    bgColor:"rgba(59,74,63,0.08)",
    body:`<p>A rubbish truck full of clothes hits a landfill <strong>every single second.</strong> 92 million tonnes of textile waste, every year.</p>
<p>Here's the thing: you're not the problem. The desire to wear different things for different moods? That's human. That's healthy. The problem is the industry that responded with <em>volume</em> instead of <em>intention.</em></p>
<h3>You don't need more clothes. You need the right one.</h3>
<p>Think about how many occasions you actually dress for in a month. Birthday dinner. A date. A performance. A celebration. Ten, maybe twelve moments where your outfit actually matters.</p>
<p>Now count what's in your wardrobe.</p>
<p>The ratio doesn't add up — and the planet is paying for that gap.</p>
<h3>The fix isn't complicated.</h3>
<p>One piece. Made for you. Made once. No overproduction. No guessing. No waste.</p>
<p>When nothing exists until you ask for it, the entire equation changes.</p>
<p><strong>"Every piece has one owner. By design."</strong></p>
<p>That's not a marketing line. That's the only model that actually works — for you, for the planet, and for the creators who make it.</p>
<p><strong>Fast fashion fills wardrobes. Custom fashion fills moments.</strong> That's YOU LOOP.</p>`,
    reelHook:"A rubbish truck full of clothes hits a landfill every single second. Here's the only fashion model that doesn't contribute to that. #FastFashion #SlowMade #YOULOOP",
    reelCta:"Order your one piece at youloop.co"
  },
  {
    id:"02", slug:"main-character-energy-outfit-ideas",
    title:"Main Character Energy: When to Wear It and What to Wear",
    subtitle:"Not every day. The moments that were made for you.",
    seo:["main character energy outfit","birthday outfit ideas women 2026","crochet occasion wear"],
    readTime:"1 min read", category:"Style", tagColor:"#aa4a30",
    emoji:"✨",
    bgColor:"rgba(170,74,48,0.08)",
    body:`<p>Main character energy is having a moment — and for good reason. <strong>Psychology Today</strong> describes it as the confidence, charisma, and self-assuredness we see in the protagonists of our favourite stories.</p>
<p>But here's what the TikTok trend doesn't tell you: <strong>wearing it every day is exhausting.</strong></p>
<p>The most powerful version of main character energy is <em>intentional.</em> Reserved. Brought out for the moments that genuinely deserve it.</p>
<h3>Your main character moments:</h3>
<ul>
<li>🎂 <strong>Your birthday</strong> — the one day everyone already has eyes on you</li>
<li>🎓 <strong>Graduation dinner</strong> — years of work, one table set for you</li>
<li>💌 <strong>First date</strong> — the version of you that chose to show up</li>
<li>💍 <strong>Pre-wedding</strong> — before the big day, still all about you</li>
<li>🎤 <strong>On-stage / spotlight moment</strong> — your craft, witnessed</li>
<li>🥂 <strong>Celebration dinner</strong> — when your people gather for what you built</li>
<li>🌟 <strong>First day at the new chapter</strong> — how you'll be remembered from here</li>
</ul>
<p>These moments don't need a performance. They need <strong>presence.</strong></p>
<p>And when you walk into them wearing something made specifically for that scene — not for the rack, not for a thousand other women — the energy you carry is different.</p>
<p>Not louder. <strong>Truer.</strong></p>`,
    reelHook:"Main character energy isn't for every day. Here are the 7 moments it was actually made for. #MainCharacterEnergy #YOULOOP #CustomFashion",
    reelCta:"What's your main character moment? Tell us in the comments ↓"
  },
  {
    id:"03", slug:"y2k-crochet-fashion-trend-2026",
    title:"Why Y2K Crochet Is 2026's Biggest Fashion Moment",
    subtitle:"And why this time, it actually means something.",
    seo:["Y2K crochet fashion 2026","crochet dress trend","Gen Z crochet outfit"],
    readTime:"1 min read", category:"Trends", tagColor:"#d49a37",
    emoji:"💫",
    bgColor:"rgba(212,154,55,0.08)",
    body:`<p>Crochet tops peaked at <strong>search value 90 in May 2026</strong> — the highest in over a decade. Y2K nostalgia, retro styling, and handmade authenticity are defining 2026 fashion — and crochet sits at the exact centre of all three.</p>
<p>But something is different this time.</p>
<p>Gen Z didn't just bring back the aesthetic. They brought back the <em>intention.</em> For a generation acutely aware of environmental issues, crochet represents everything fast fashion doesn't — <strong>handmade, personal, durable, one-of-a-kind.</strong></p>
<h3>What makes crochet different in 2026:</h3>
<ul>
<li>Every stitch placed by a human hand — impossible to mass-produce without losing what makes it worth wearing</li>
<li>Cotton crochet biodegrades. Polyester fast fashion pollutes oceans for 200+ years</li>
<li>A custom crochet piece lasts because it was made to fit <em>you</em> — not a size average</li>
</ul>
<h3>Y2K energy + slow fashion values = the aesthetic that holds up.</h3>
<p>The ruffle hem mini dress. The leg warmers. The fingerless gloves. The color sets. It's nostalgic <em>and</em> intentional. Bold <em>and</em> considered.</p>
<p>That's the YOU LOOP signature. <strong>Fast fashion fills wardrobes. Custom fashion fills moments.</strong></p>`,
    reelHook:"Y2K crochet is back — but this time it's sustainable. Here's why this trend actually means something. #Y2K #CrochetFashion #SlowFashion #YOULOOP",
    reelCta:"Which color is yours? Soft Riot / Golden Hour / Midnight / Garden 👇"
  },
  {
    id:"04", slug:"custom-birthday-outfit-thailand",
    title:"The Best Birthday Outfit Is One Nobody Else Has",
    subtitle:"Custom crochet birthday sets, made to order.",
    seo:["custom birthday outfit 2026","birthday crochet dress Thailand","unique birthday look women","made to order crochet set"],
    readTime:"1 min read", category:"Occasions", tagColor:"#aa4a30",
    emoji:"🎂",
    bgColor:"rgba(170,74,48,0.08)",
    body:`<p>Google's Spring 2026 trending searches show statement jewellery and co-ord sets at all-time highs. But the search nobody is tracking? <strong>Custom-made birthday outfits.</strong> Because once you've worn one, you understand why the mass-produced version never felt the same.</p><p>Your birthday is the one day a year the entire room already has a reason to look at you.</p>
<p>So why wear something a thousand other women also own?</p>
<h3>The YOU LOOP Birthday Set (SR-01):</h3>
<p>A custom crochet mini dress, hand warmers, and leg warmers — made in your chosen color, your chosen size, for your specific moment. Nothing exists until you order it. Everything is made for you.</p>
<p>Four colors to choose from:</p>
<ul>
<li>🌸 <strong>Soft Riot</strong> — dusty rose with deep plum and gold ruffles</li>
<li>☀️ <strong>Golden Hour</strong> — warm cream with camel and mustard ruffles</li>
<li>🌙 <strong>Midnight</strong> — deep plum gradient with gold accent</li>
<li>🌿 <strong>Garden</strong> — lime green with brown, orange, and gold ruffles</li>
</ul>
<p>Lead time: <strong>10–14 days.</strong> Plan ahead for the moment that deserves it.</p>
<p>2,200 THB. Handmade. Made once. Made for you.</p>`,
    reelHook:"Your birthday outfit should not exist anywhere else in the world. Here's how we make sure it doesn't. #BirthdayOutfit #CustomFashion #YOULOOP",
    reelCta:"DM us or order at youloop.co — birthdays book up fast 🎂"
  },
  {
    id:"05", slug:"feminine-masculine-energy-balance-fashion",
    title:"Soft but Riot: Why Balanced Energy Is the New Power Move",
    subtitle:"The YOU LOOP philosophy on feminine energy and the middle path.",
    seo:["feminine energy fashion 2026","soft feminine aesthetic","balanced energy women","intentional fashion"],
    readTime:"1.5 min read", category:"Philosophy", tagColor:"#2a1e1b",
    emoji:"🌙",
    bgColor:"rgba(42,30,27,0.08)",
    body:`<p>Neuroscientist Professor Daphna Joel analysed brain scans of over 1,400 people and found that <strong>only 0–8% had entirely male or entirely female brain features.</strong> The vast majority of us are a mosaic — a unique mix of both.</p>
<p>We already knew this, didn't we?</p>
<p>Some days you are soft. Nurturing. Open. Receiving. Other days you are fire. Focused. Decisive. Unmoving. Both are you. Both are valid. The problem happens when you get stuck in one for too long.</p>
<h3>What imbalance looks like:</h3>
<ul>
<li>Too much masculine energy → stressed, overworked, rigid, disconnected</li>
<li>Too much feminine energy → emotionally overwhelmed, difficulty with boundaries</li>
</ul>
<p>The Buddha described the solution as <strong>Majjhima Patipada</strong> — the Middle Way. Not neutrality. The dynamic balance of two forces working together, each empowered by the other.</p>
<h3>What this has to do with fashion:</h3>
<p>YOU LOOP was born from this philosophy. <strong>Soft Riot</strong> is not just a collection name. It's a description of balanced energy expressed through what you wear. Soft enough to be feminine. Sharp enough to mean something.</p>
<p>You don't wear it every day. You wear it when your energy — and your moment — align.</p>
<p>That's not fashion. That's intention.</p>`,
    reelHook:"A neuroscientist studied 1,400 people and found we're all a mix of masculine and feminine energy. Here's why YOU LOOP was built on that exact idea. #FeminineEnergy #SoftRiot #YOULOOP",
    reelCta:"Save this if it resonated 🌿 #EnergyBalance #IntentionalFashion"
  },
  {
    id:"06", slug:"slow-fashion-movement-crochet",
    title:"Slow Fashion Is Not Boring. It's a Rebellion.",
    subtitle:"Why making something by hand is the most radical act in fashion right now.",
    seo:["slow fashion movement 2026","handmade fashion sustainable","crochet slow fashion","slow fashion Thailand"],
    readTime:"1 min read", category:"Sustainability", tagColor:"#3b4a3f",
    emoji:"✊",
    bgColor:"rgba(59,74,63,0.08)",
    body:`<p>The fashion industry produces <strong>10% of global carbon emissions</strong> — more than aviation and shipping combined.</p>
<p>85% of all textiles go to dumps each year. A garment truck, to landfill, every single second.</p>
<p>Slow fashion is the response. But here's what people get wrong:</p>
<p><strong>Slow fashion is not boring. It's not beige linen and minimalism.</strong></p>
<p>Slow fashion is a ruffle hem mini dress in deep plum with gold accents. It's a three-piece crop set in lime green that arrives 14 days after you ordered it, made by a real woman who chose her craft. It's Y2K energy and bold color and the silhouette you wanted — <em>built differently.</em></p>
<h3>What makes something slow fashion:</h3>
<ul>
<li>Made when asked, not before → zero overproduction</li>
<li>Made by a skilled human, not a machine → craft has value</li>
<li>Made for one person → never generic, never wasted</li>
</ul>
<p><strong>"Crochet is our rebellion against disposable fashion."</strong></p>
<p>Not because it's harder. Because it cannot be rushed without becoming something else entirely. Every loop takes time. That time is what you're wearing.</p>`,
    reelHook:"Slow fashion doesn't mean boring. It means a ruffle hem crochet dress made specifically for you. Here's the difference. #SlowFashion #CrochetFashion #YOULOOP #SustainableFashion",
    reelCta:"We love the look. We refuse the waste. 🌿 youloop.co"
  },
  {
    id:"07", slug:"who-gets-paid-your-top",
    title:"Who Actually Gets Paid for Your $22 Top?",
    subtitle:"The real math behind a fast fashion price tag.",
    seo:["fast fashion wages 2026","garment worker pay","ethical fashion pricing"],
    readTime:"1 min read", category:"Impact", tagColor:"#aa4a30",
    emoji:"🧵",
    bgColor:"rgba(166,61,83,0.08)",
    body:`<p>A $22 crochet-style top moves through a lot of hands before it reaches yours. The person who actually made it gets the smallest cut of all.</p>
<p>Industry research puts it plainly: garment workers receive an estimated <strong>0.6% of a garment's retail price.</strong> On a $22 top, that's about <strong>13 cents.</strong></p>
<h3>Where the rest goes</h3>
<p>Materials, factory margins, shipping, brand markup, retail markup, marketing. By the time a price tag reaches a store shelf, the person whose hands actually built the piece is the last one considered — and the first one squeezed when costs need to come down.</p>
<p>This isn't a rare bad actor. It's the standard structure of how most clothing gets made and sold.</p>
<h3>What YOU LOOP does differently</h3>
<p>Every artisan we work with is paid a fixed, fair production fee for every piece — agreed before the work starts, not negotiated down after. No middle layer of factory margins between the maker and the payment.</p>
<p><strong>Fair pay isn't a bonus feature. It's the starting point.</strong></p>`,
    reelHook:"$22 top. 13 cents to the woman who made it. Here's where the rest of your money actually goes. #FastFashion #GarmentWorkers #YOULOOP",
    reelCta:"Every YOU LOOP piece pays its maker fairly, by design."
  },
  {
    id:"08", slug:"skilled-women-someone-elses-job",
    title:"Skilled Women. Doing Someone Else's Job.",
    subtitle:"What happens to real skills when the market won't recognize them.",
    seo:["Myanmar migrant workers Thailand","displaced women skills","refugee employment"],
    readTime:"1 min read", category:"Impact", tagColor:"#aa4a30",
    emoji:"🧶",
    bgColor:"rgba(166,61,83,0.08)",
    body:`<p>Millions of people have left Myanmar for Thailand since the 2021 coup — over 4 million by recent estimates, the largest migrant community in the country.</p>
<p>Most end up in the same handful of sectors: construction, seafood processing, textile factories, domestic work, restaurants. Migrant labor is often described as quietly essential to Thailand's infrastructure and export economy — <em>load-bearing, but rarely credited.</em></p>
<h3>The skill doesn't disappear. It just stops counting.</h3>
<p>A woman who ran a tailoring shop back home. A former teacher. A nurse. A woman who learned crochet and weaving from her grandmother before she could read. In Thailand, none of that shows up on the job application — because for most migrant workers, the available categories start and end at manual labor.</p>
<p>The skill isn't gone. The market just isn't built to see it.</p>
<h3>What we build instead</h3>
<p>YOU LOOP works directly with Myanmar artisan women whose craft skills already exist — and pays them for exactly that skill, not for whatever labor category they were sorted into on arrival. No retraining from zero. Just a market finally built to use what they already know.</p>`,
    reelHook:"Over 4 million Myanmar workers in Thailand. Most sorted into the same few labor categories, no matter their real skills. Here's the gap we're closing. #MigrantWorkers #SkillsGap #YOULOOP",
    reelCta:"Skilled hands. Finally paid for the skill."
  },
  {
    id:"09", slug:"water-we-will-drink-2030",
    title:"The Water We'll Drink in 2030",
    subtitle:"What happens to clothes after they're thrown away.",
    seo:["textile waste environment","microplastics water 2026","sustainable fashion facts"],
    readTime:"1 min read", category:"Impact", tagColor:"#aa4a30",
    emoji:"💧",
    bgColor:"rgba(166,61,83,0.08)",
    body:`<p>A garbage truck's worth of textiles is landfilled or burned <strong>every second</strong>, worldwide.</p>
<p>Most of it doesn't just sit there. As synthetic fabric breaks down in landfills, it releases microplastics into the surrounding soil and water — a process scientists call landfill leachate contamination.</p>
<h3>The 2030 projection</h3>
<p>Peer-reviewed research projects that <strong>microplastic pollution in groundwater is set to rise sharply by 2030</strong> — driven in part by exactly this: mountains of discarded textiles slowly leaching into the water table. Roughly a quarter of the world's population depends on groundwater for drinking water.</p>
<p>This isn't a distant, abstract problem. It's the water under your feet, right now, absorbing what gets thrown away today.</p>
<h3>Why made-to-order matters here</h3>
<p>The only garment that never becomes landfill waste is the one that was actually wanted in the first place. YOU LOOP makes nothing until someone orders it — no overproduction sitting in a warehouse, destined for a dumpster the moment a trend cycle ends.</p>
<p><strong>Fewer clothes. Made with intention. Nothing extra to throw away.</strong></p>`,
    reelHook:"A truck's worth of clothes hits a landfill every second. Here's what that means for the water we'll drink by 2030. #TextileWaste #SustainableFashion #YOULOOP",
    reelCta:"Made when ordered. Never made to be thrown away."
  },
  {
    id:"10", slug:"48-hours-no-overtime",
    title:"48 Hours a Week Is the Easy Version",
    subtitle:"What a \"normal\" week looks like in garment manufacturing.",
    seo:["garment worker conditions Cambodia","Cambodia textile industry","factory labor hours"],
    readTime:"1 min read", category:"Impact", tagColor:"#aa4a30",
    emoji:"⏱️",
    bgColor:"rgba(166,61,83,0.08)",
    body:`<p>In Cambodia's garment sector — one of the country's largest export industries — a standard work week is built around <strong>48 hours</strong>, before any overtime is added on top. Workers often describe 10–12 hour days, six days a week, just to hit production quotas.</p>
<p>Cambodian garment workers earn among the lowest wages in the region — roughly <strong>$256 a month</strong> for manufacturing work, in an industry that supplies a large share of the world's clothing brands.</p>
<h3>The quota problem</h3>
<p>Long hours aren't a side effect — they're often the only way to hit the piece quotas that determine whether a worker gets paid at all that week. Rest, sick days, and predictable schedules become luxuries the system wasn't built to offer.</p>
<h3>A different pace, by design</h3>
<p>YOU LOOP's artisans aren't racing a quota line. Each piece is made at a pace that allows for actual craftsmanship — because the entire model depends on quality holding up, not volume.</p>
<p><strong>Slow, by design, isn't a limitation. It's the whole point.</strong></p>`,
    reelHook:"48 hours is the 'normal' week in garment manufacturing — before overtime. Here's why we build differently. #GarmentWorkers #Cambodia #SlowFashion #YOULOOP",
    reelCta:"No quotas. No rush. Just the work, done right."
  },
  {
    id:"11", slug:"expensive-piece-actually-cheaper",
    title:"Why the \"Expensive\" Piece Is Actually Cheaper",
    subtitle:"The real math behind cost-per-wear.",
    seo:["cost per wear","sustainable fashion budget","slow fashion value"],
    readTime:"1 min read", category:"Impact", tagColor:"#aa4a30",
    emoji:"🧮",
    bgColor:"rgba(166,61,83,0.08)",
    body:`<p>Not cheap like fast fashion. Not expensive like a designer label. YOU LOOP sits in a deliberate middle path — and the math backs it up.</p>
<h3>Run the numbers</h3>
<p>A $66 custom piece, worn 50 times over its life, costs about <strong>$1.32 per wear.</strong></p>
<p>A $6 fast-fashion top, worn twice before it's forgotten in the back of a drawer, costs about <strong>$3.00 per wear.</strong></p>
<p>The "cheap" option is more expensive — every single time you actually wear it.</p>
<h3>Why the gap exists</h3>
<p>Fast fashion is priced to be disposable, and it delivers exactly that: pieces that fall apart, go out of style in a season, or simply never get worn again after the first excitement fades. A piece made for a specific moment — sized right, meant for you — gets pulled out of the closet again and again, then passed down when you're done with it.</p>
<p><strong>Intention is always cheaper in the end.</strong></p>`,
    reelHook:"A $6 top costs more per wear than a $66 custom piece. Here's the math nobody shows you. #CostPerWear #SlowFashion #YOULOOP",
    reelCta:"Do the math on your own closet. We'll wait."
  },
];

export const BLOG_CATEGORIES = [
  'all',
  'Sustainability',
  'Style',
  'Trends',
  'Occasions',
  'Philosophy',
  'Impact',
] as const;
