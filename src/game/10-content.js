/* ================= content ================= */
const ENDINGS = {
  better: { title: 'Guardian of Attention',
    text: 'The mountain was gone. Kim sat at a small desk under a single bulb, guarding the one thing nobody can make more of: twelve minutes a week of other people’s attention. The next course would be small. It would be worth it.',
    lesson: 'Content is now infinite; attention is not. L&D’s job is to guard it: start from the performance problem, use AI to understand people and build practice, and measure what people do, not what they click.' },
  more: { title: 'More, Forever',
    text: 'Kim kept going. The mountain kept growing, and the peak kept moving up, the way peaks do. Somewhere far below, a learner opened course number {n}, scrolled straight to the end and clicked Complete.',
    lesson: 'Generative AI makes content almost free. That makes content the cheapest thing L&D can offer, and the least valuable. Output was never the job.' },
  dinosaur: { title: 'The Dinosaur',
    text: 'Kim refused the tool and kept crafting by hand. Every course was beautiful. The backlog reached the ceiling, and by the time course number six shipped, the problem it solved had changed twice.',
    lesson: 'Refusing the tool is the same mistake as worshipping it. Less but better only works if you also learn what the new tools are genuinely good for.' },
  idle: { title: 'Automated Anyway',
    text: 'Kim did nothing at all. Someone else in the organisation found the tool instead. It generated a course about doing nothing, assigned it to four thousand people and sent three reminder emails. It scored 4.7 out of 5 on the happy sheet.',
    lesson: 'Doing nothing is not a strategy. If L&D does not decide what AI is for, the tool decides for you, and it optimises for volume.' }
};
const ORDER = ['better', 'more', 'dinosaur', 'idle'];
const REQUESTS = [
  ['Finance', 'Can we have a course on the new expense tool?'],
  ['Legal', 'Compliance module, mandatory, by Friday'],
  ['Sales', 'Turn this 84-slide deck into e-learning?'],
  ['HR', 'Can you make it gamified?'],
  ['Exec office', 'The CEO saw a video about microlearning'],
  ['Ops', 'Add a quiz so we can track completion'],
  ['Comms', 'Translate it into 14 languages with AI?'],
  ['HR', 'We need a podcast version too'],
  ['IT', 'Three more learning paths for the LMS'],
  ['Marketing', 'Make it “engaging”'],
  ['Onboarding', '40 more modules, the new hires are bored'],
  ['Exec office', 'Can the strategy be a 5-minute explainer?'],
  ['Sales', 'A course. On sales.'],
  ['HR', 'Learners say it’s too long. Shorter version?'],
  ['Risk', 'Please add a certificate'],
  ['Product', 'Can it be TikTok-style?'],
  ['HR', 'A chatbot that answers the course?'],
  ['Everyone', 'Quick one, could you just…']
];
const LEARNERS = ['No time', 'I’ll watch it later', 'Is this mandatory?', 'Skipped to the quiz', 'Which one do I need?', 'On mute, in a meeting', 'Saved for later (never)', 'Searching…'];
const TALKS = [
  { who: 'Finance', ask: 'We need a course on the new expense tool.', q: 'What goes wrong today?', a: 'People forget to attach their receipts. That’s really it.', k: 'So what if the tool just reminded them?', r: '…Oh. Yes. We don’t need a course.', after: 'Forty courses evaporated. Nobody noticed. That was the point.' },
  { who: 'HR', ask: 'You’ll keep all forty onboarding modules, right?', q: 'Which ones do new hires actually use?', a: 'Two. And the map to the coffee machine.', k: 'Then we keep those, and give every new hire a buddy instead.', r: 'A buddy. Why didn’t we think of that?', after: 'The mountain shrank. Kim felt lighter. The narrator checked.' },
  { who: 'Legal', ask: 'The compliance module has to stay. It’s mandatory.', q: 'Mandatory by law, or by habit?', a: 'Let me check… Habit. The law needs one page and a signature.', k: 'One page and a signature, then.', r: 'Our lawyers will love this. Our LMS will not.', after: 'Most content, it turns out, is just waiting for someone to ask why it exists.' },
  { who: 'Sales', ask: 'We need a course. On sales.', q: 'What does a great sales call sound like?', a: 'Like Priya’s. Everyone says so.', k: 'What if new people listened in on Priya for a week?', r: 'Huh. Priya would love that. Priya loves an audience.', after: 'Kim was getting good at this. It didn’t look like work. It was the hardest work Kim had done all year.' },
  { who: 'Exec office', ask: 'The CEO wants a microlearning on the strategy.', q: 'What should people decide differently because of it?', a: 'Honestly? Nobody has told us that yet.', k: 'Then let’s wait until there’s a decision to make.', r: 'That’s… annoyingly reasonable.', after: 'Almost nothing left. Which was nearly the right amount.' },
  { who: 'Team lead', ask: 'My new team leads avoid giving hard feedback.', q: 'Where exactly does it go wrong?', a: 'In one-on-ones. They talk about the weather instead.', k: 'Ten minutes of practice before their next one-on-one. We check back in six weeks.', r: 'That one I’d actually use.', after: 'And this time, Kim made something.' }
];
