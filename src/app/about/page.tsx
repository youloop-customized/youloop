import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import s from './about.module.css';

export const metadata: Metadata = {
  title: { absolute: 'About YOU LOOP | Custom Crochet Fashion Platform' },
  description:
    'YOU LOOP is a custom crochet fashion platform built on Soft Riot energy. Fast fashion fills wardrobes. Custom fashion fills moments. Custom fashion for your most intentional moment. Keep it Soft Riot. Only female can save the world with Soft Riot energy — the balance of feminine and masculine, expressed through intentional fashion made by hand.',
  alternates: { canonical: '/about' },
};

const JUMP_LINKS = [
  { href: '#story', label: 'The Story' },
  { href: '#problem', label: 'The Problem' },
  { href: '#solution', label: 'The Solution' },
  { href: '#values', label: 'Values' },
  { href: '#founder', label: 'Founder' },
  { href: '#soft-riot', label: 'Soft Riot' },
  { href: '#manifesto', label: 'Manifesto' },
  { href: '#cta', label: 'Get Started' },
];

const VALUES = [
  {
    icon: '🌿',
    title: 'Made to order',
    desc: 'Nothing exists until you ask for it. Every piece made once, for you, with intention.',
  },
  {
    icon: '🤝',
    title: 'Creator economy',
    desc: 'Local artisan women paid fairly for their craft. Not factory wages — creator wages.',
  },
  {
    icon: '⚖️',
    title: 'Energy balance',
    desc: 'Soft Riot is the philosophy. Feminine and masculine in balance. Neither extreme.',
  },
  {
    icon: '✂️',
    title: 'Slow craft',
    desc: 'Crochet cannot be rushed without becoming something else. Every loop is time. That time is what you wear.',
  },
  {
    icon: '🎯',
    title: 'Intentional moments',
    desc: 'Fashion for the moments that were made for you — not for every Tuesday.',
  },
  {
    icon: '🔁',
    title: 'Zero overproduction',
    desc: 'If nobody orders, nothing is made. The most honest environmental position in fashion.',
  },
];

export default function AboutPage() {
  return (
    <div className={s.page}>
      <SiteNav active="about" />

      {/* HERO */}
      <div className={s.hero}>
        <div className={s.eyebrow}>What is YOU LOOP</div>
        <h1 className={s.heroTitle}>
          Fast fashion fills wardrobes.
          <br />
          <em>Custom fashion fills moments.</em>
        </h1>
        <div className={s.heroDivider} />
        <p className={s.heroValues}>
          &quot;A custom fashion platform for women who know that real power is soft and riot at the
          same time.&quot;
        </p>
      </div>

      {/* SECTION JUMP NAV */}
      <div className={s.sectionNav}>
        <div className={s.sectionNavInner}>
          {JUMP_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* ORIGIN STORY */}
      <section id="story">
        <div className={s.container}>
          <div className={s.sectionEyebrow}>The YOU LOOP story</div>
          <h2 className={s.sectionTitle}>
            I built this with my <em>whole background.</em>
            <br />
            Not just an idea.
          </h2>

          <p className={s.bodyText}>
            I&apos;m originally from Myanmar. I live in Chiang Mai now. Before any of this, I ran a
            startup back home called <strong>One Sett</strong>, a customisation platform where I
            worked with local dressmakers who were genuinely skilled but had no way to reach
            customers on their own. I handled the marketing and the orders; they handled the craft.
            The women I worked with saw their income grow by as much as five times. That&apos;s not
            a number I&apos;m pulling out to sound good — actual numbers we built together.
          </p>

          <p className={s.bodyText}>
            I&apos;m also an artist. A rapper. When I moved to Chiang Mai chasing that, I
            didn&apos;t use any of my business or marketing background at first. I worked as a
            waitress. A bartender. Whatever kept me afloat.
          </p>

          <p className={s.bodyText}>
            Through that, I met a lot of young women from Myanmar with real skills — crochet,
            painting, craft work, some self-taught, some passed down. But here, they&apos;d set all
            of it aside to wash dishes and clean rooms, because that&apos;s what paid today. I
            watched women younger than me sending money home, surviving in a country that
            wasn&apos;t theirs, while the one thing that made them exceptional sat completely
            unused.
          </p>

          <p className={s.bodyText}>
            One of them made the dress that started all of this. She&apos;s a third-year technology
            student back home in Myanmar, learning to code. In Chiang Mai, she works part-time as a
            housekeeper at the community house I was staying in. She crocheted the original Birthday
            Set I wore to my own performance.{' '}
            <strong>
              That contradiction — real skill sitting idle while she earns survival wages doing
              something else entirely — is the whole reason YOU LOOP exists.
            </strong>
          </p>

          <p className={s.bodyText}>
            It took the 4SEAS community here in Chiang Mai, and friends who kept pulling me back
            toward building something, to reconnect with the founder in me. That&apos;s what
            restarted everything. I built YOU LOOP using AI, start to finish, in two weeks.
            It&apos;s live now.
          </p>

          <div className={s.videoWrapper}>
            <iframe
              src="https://www.youtube.com/embed/JlbWOBVZNiA"
              title="YOU LOOP Story"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className={s.videoCaption}>
            Watch the full story — recorded in one take, no script. (The video doesn&apos;t cover
            everything — keep reading below for the rest.)
          </p>

          <p className={s.bodyText}>
            Why crochet, specifically? Because it can&apos;t be mass-produced on a machine. It
            stretches to fit real bodies instead of forcing bodies to fit a size chart. And
            it&apos;s fast enough for a new artisan to learn and start earning from almost
            immediately. It was never an aesthetic choice — it&apos;s a structural one.
          </p>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section id="problem">
        <div className={s.container}>
          <div className={s.sectionEyebrow}>The problem we&apos;re solving</div>
          <h2 className={s.sectionTitle}>
            Fashion became fast.
            <br />
            <em>We made it intentional.</em>
          </h2>

          <p className={s.bodyText}>
            I didn&apos;t arrive at this from a marketing brief. I arrived at it from watching real
            women — artisans, dressmakers, my own community — get underpaid and overlooked by an
            industry built for volume, not people. Here&apos;s the case for why that has to change.
          </p>

          <p className={s.bodyText}>
            Why did fashion become fast fashion? Not because people are careless. Because people
            want to feel different on different days. Different moods. Different moments. Different
            versions of themselves stepping into different rooms.
          </p>

          <p className={s.bodyText}>
            That impulse is completely human. And it&apos;s not the problem.
          </p>

          <p className={s.bodyText}>
            The problem is the industry that responded to that impulse with{' '}
            <strong>volume instead of intention.</strong> 92 million tonnes of textile waste per
            year. A rubbish truck full of clothing hitting a landfill every single second. Creators
            underpaid. Customers owning 100 pieces that carry no meaning, no memory, no energy.
          </p>

          <div className={s.pullQuote}>
            <p>
              &quot;You don&apos;t need more clothes. You need fewer pieces that mean more. A
              wardrobe of intention beats a wardrobe of volume every time.&quot;
            </p>
            <cite>— Yu Thu, Founder of YOU LOOP</cite>
          </div>

          <p className={s.bodyText}>
            The ratio doesn&apos;t add up. Think about how many distinct occasions you actually
            dress for in a month — birthday dinner, a date, a performance, a celebration. Ten, maybe
            twelve moments where your outfit actually matters. Now count what&apos;s in your
            wardrobe.
          </p>

          <p className={s.bodyText}>
            <strong>Custom fashion solves this structurally.</strong> When a piece is made for one
            person, for one moment, with one intention — it gets worn again. It carries energy. It
            reduces the need for more. It trains the impulse toward meaning instead of quantity.
          </p>
        </div>
      </section>

      {/* THESIS BLOCKS */}
      <section id="solution" style={{ paddingTop: 0 }}>
        <div className={s.container}>
          <div className={s.thesisGrid}>
            <div className={s.thesisBlock}>
              <div className={s.thesisLabel}>The solution</div>
              <p className={s.thesisText}>
                YOU LOOP is a custom crochet fashion platform where{' '}
                <strong>nothing exists until you ask for it.</strong> Every piece is made to order —
                never in advance, never in bulk, never for nobody. Creators are paid fairly for
                their time and craft. Customers receive something unique, meaningful, and
                intentional. No overproduction. No waste.
              </p>
            </div>

            <div className={`${s.thesisBlock} ${s.green}`}>
              <div className={s.thesisLabel}>The impact</div>
              <p className={s.thesisText}>
                One custom piece replaces ten fast fashion purchases. A piece made for your birthday
                doesn&apos;t sit in a drawer waiting for next year — it gets worn to a friend&apos;s
                dinner, a reception, a quiet Tuesday that felt like it needed something special.
                Eventually, it gets passed down — to a niece, a sister, someone who&apos;ll carry
                the same piece into her own moments. Fewer clothes. More meaning. Less waste.
                Creators earn fair prices for handmade work. The platform runs on demand — if nobody
                orders, nothing is made. That is the only model that actually works for the planet.
              </p>
            </div>

            <div className={`${s.thesisBlock} ${s.gold}`}>
              <div className={s.thesisLabel}>The price point</div>
              <p className={s.thesisText}>
                Not cheap like fast fashion. Not expensive like a designer brand. A middle path —
                fair for the creator who makes it, accessible for the customer who wears it, and
                valuable enough to keep. A piece at $66 that you wear 50 times costs $1.32 per wear.
                A fast fashion piece at $6 worn twice costs $3.00 per wear. Intention is always
                cheaper in the end.
              </p>
            </div>

            <div className={`${s.thesisBlock} ${s.purple}`}>
              <div className={s.thesisLabel}>The energy</div>
              <p className={s.thesisText}>
                Every YOU LOOP design carries <strong>Soft Riot energy</strong> — the balance of
                feminine and masculine, soft but not passive, expressive but controlled. Rooted in
                the Buddhist concept of Majjhima Patipada (the Middle Way): balance as the source of
                real power. The woman who finds YOU LOOP recognises this energy in herself
                immediately. She doesn&apos;t need to be convinced. She already knows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <div className={s.valuesStrip} id="values">
        <div className={s.valuesHeader}>
          <div className={s.sectionEyebrow}>What we stand for</div>
          <h2 className={s.sectionTitle} style={{ textAlign: 'center' }}>
            The YOU LOOP values
          </h2>
        </div>
        <div className={s.valuesGrid}>
          {VALUES.map((value) => (
            <div key={value.title} className={s.valueItem}>
              <div className={s.valueIcon}>{value.icon}</div>
              <div className={s.valueTitle}>{value.title}</div>
              <div className={s.valueDesc}>{value.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FOUNDER */}
      <section className={s.founderSection} id="founder">
        <div className={s.container}>
          <div className={s.sectionEyebrow}>The founder</div>
          <h2 className={s.sectionTitle}>
            Born from <em>experience.</em>
            <br />
            Built with intention.
          </h2>
        </div>
        <div className={s.founderInner}>
          <div className={s.founderImg}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/about/yu_thu.jpg" alt="Yu Thu — Founder of YOU LOOP" />
          </div>
          <div>
            <div className={s.founderName}>Yu Thu</div>
            <div className={s.founderRole}>Founder &amp; CEO · YOU LOOP</div>

            <p className={s.bodyText}>
              I&apos;ve spent close to three years building a customisation business before moving
              to Chiang Mai, and I&apos;ve carried that straight into YOU LOOP — connecting skilled
              artisan women across Chiang Mai, Pai, Mae Sot, and Bangkok with customers who want
              something made specifically for them, not pulled off a rack.
            </p>

            <p className={s.bodyText}>
              If you&apos;re a conscious investor — someone who looks at scalability, the use of AI,
              efficient operations, and a business model that&apos;s contributive rather than
              extractive — <strong>I&apos;d genuinely like to talk.</strong> I&apos;m not asking you
              to take it on faith; I have the deck, the numbers, and the artisans ready to show you.
            </p>

            <p className={s.bodyText}>
              I believe in the Buddhist concept of <strong>Majjhima Patipada</strong> — the Middle
              Way. Not too soft, not too harsh. Not too feminine, not too masculine. Balance is
              where real power lives. Soft Riot is that energy, expressed through fashion.
            </p>

            <div className={s.pullQuote} style={{ margin: '2rem 0 0' }}>
              <p>&quot;Only female can save the world with Soft Riot energy.&quot;</p>
              <cite>— Yu Thu</cite>
            </div>
          </div>
        </div>
      </section>

      {/* SOFT RIOT EXPLAINED */}
      <section id="soft-riot">
        <div className={s.container}>
          <div className={s.sectionEyebrow}>What is Soft Riot</div>
          <h2 className={s.sectionTitle}>
            Soft but not passive.
            <br />
            <em>Sharp when it counts.</em>
          </h2>

          <p className={s.bodyText}>
            Soft Riot is not a collection name. It is an energy. A description of the balanced woman
            — one who understands that her power comes not from choosing between soft and fierce,
            but from <strong>holding both at once.</strong>
          </p>

          <p className={s.bodyText}>
            Neuroscientist Professor Daphna Joel studied the brain scans of over 1,400 people and
            found that only 0–8% had entirely male or entirely female brain features. The vast
            majority of us are a mosaic — a unique mix of both. We already knew this.
          </p>

          <p className={s.bodyText}>
            Some days you are soft. Nurturing. Open. Receiving. Other days you are fire. Focused.
            Decisive. Unmoving. Both are real. Both are valid. The problem happens when you get
            stuck in one for too long.
          </p>

          <p className={s.bodyText}>
            When women operate from this balanced energy —{' '}
            <strong>not performing one extreme or the other, but inhabiting both deliberately</strong>{' '}
            — something shifts. Female collectiveness strengthens. Competition quiets. Comparison
            loses its grip. Because when your look was made only for you, there is nothing to
            compare to.
          </p>

          <p className={s.bodyText}>
            Custom fashion is one vehicle for that shift. YOU LOOP is the platform that makes it
            accessible.
          </p>
        </div>
      </section>

      {/* MANIFESTO */}
      <div className={s.manifestoSection} id="manifesto">
        <div className={s.manifestoLine}>Your main character era starts here.</div>
        <div className={s.manifestoSub}>Keep it Soft Riot.</div>
      </div>

      {/* CTA */}
      <div className={s.ctaSection} id="cta">
        <h2 className={s.ctaTitle}>Ready for your moment?</h2>
        <p className={s.ctaSub}>
          Custom crochet, made to order, delivered in 10–14 days.
          <br />
          Four color palettes. Your size. Your intention.
        </p>
        <div className={s.ctaBtns}>
          <Link href="/#collection" className={s.btnPrimary}>
            Shop the collection
          </Link>
          <Link href="/journal" className={s.btnOutline}>
            Read the journal
          </Link>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
