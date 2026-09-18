import type { ResourceArticle } from "@/lib/constants/resources";

export const TEEN_TRAVEL_PROGRAMS_SUMMER_2027_SLUG = "teen-travel-programs-summer-2027";

function list(slug: string): string {
  return `/resources/lists/${slug}`;
}

export const teenTravelProgramsSummer2027Article: ResourceArticle = {
  slug: TEEN_TRAVEL_PROGRAMS_SUMMER_2027_SLUG,
  categoryId: "choosing-a-program",
  publishedDate: "September 25, 2026",
  title: "Teen Travel Programs for Summer 2027: How to Find a Trip Your Teen Will Actually Love",
  excerpt:
    "It's only September, but if an international adventure is on your teen's wish list for Summer 2027, it may already be time to start looking.",
  blocks: [
    {
      type: "paragraph",
      text: "It's only September, but if an international adventure is on your teen's wish list for Summer 2027, it may already be time to start looking.",
    },
    {
      type: "paragraph",
      text: "Many major teen travel organizations have already published their 2027 programs, with enrollment open for trips around the world.",
    },
    {
      type: "paragraph",
      text: "But if \"teen travel program\" makes you think of sightseeing tours or traditional language immersion, it's worth taking another look. Today's options go much further.",
    },
    {
      type: "paragraph",
      text: "Teens can climb Kilimanjaro, work with sea turtles, learn to scuba dive, study wildlife conservation, explore international relations and diplomacy, explore entrepreneurship, sail, backpack, photograph another part of the world, study architecture or fashion, and much more.",
      links: [
        { text: "Kilimanjaro", href: list("kilimanjaro-programs") },
        { text: "sea turtles", href: list("sea-turtle-programs") },
        { text: "scuba dive", href: list("scuba-programs") },
        { text: "wildlife conservation", href: list("conservation-programs") },
        {
          text: "international relations and diplomacy",
          href: list("international-relations-diplomacy-programs"),
        },
        { text: "entrepreneurship", href: list("entrepreneurship-programs") },
        { text: "sail", href: list("sailing-programs") },
        { text: "backpack", href: list("backpacking-programs") },
        { text: "photograph", href: list("photography-programs") },
        { text: "architecture", href: list("architecture-programs") },
        { text: "fashion", href: list("fashion-programs") },
      ],
    },
    {
      type: "paragraph",
      text: "Which makes the most useful question less \"Where should my teen go?\" and more \"What does my teen want to do?\"",
    },
    {
      type: "paragraph",
      text: "Because programs are opening early, there can be pressure to choose quickly. But we'd argue for the opposite approach.",
    },
    {
      type: "paragraph",
      text: "Starting early shouldn't mean choosing quickly. It should mean having more choices.",
    },
    {
      type: "paragraph",
      text: "Start with the experience your teen would genuinely be excited about. Then explore where in the world they can do it, compare programs across organizations, and narrow the possibilities based on dates, age, budget and other practical constraints.",
    },
    {
      type: "paragraph",
      text: "With hundreds of programs spanning dozens of countries and interests ranging from sea turtle conservation to entrepreneurship, starting now gives you time to find something that feels remarkably specific to your teen.",
      links: [
        { text: "sea turtle", href: list("sea-turtle-programs") },
        { text: "entrepreneurship", href: list("entrepreneurship-programs") },
      ],
    },
    {
      type: "paragraph",
      text: "Here's how to explore what's out there.",
    },
    { type: "subheading", text: "Teen travel programs follow a different timeline" },
    {
      type: "paragraph",
      text: "If you've been researching academic summer programs, you may be used to a calendar that gets serious later in the fall, with many applications opening in winter and deadlines extending into January, February or beyond.",
      links: [{ text: "academic summer programs", slug: "when-should-you-start-applying" }],
    },
    {
      type: "paragraph",
      text: "Travel programs can work differently.",
    },
    {
      type: "paragraph",
      text: "Organizations including CIEE, Moondance Adventures, Apogee Adventures, Rustic Pathways and others are already publishing dates and accepting students for Summer 2027. Many travel programs use rolling enrollment rather than a single application deadline, so families can start making decisions much earlier in the year.",
    },
    {
      type: "paragraph",
      text: "If your teen knows they want to spend part of next summer traveling, now is a good time to explore.",
    },
    {
      type: "paragraph",
      text: "But that doesn't mean you need to know exactly where they should go.",
    },
    { type: "subheading", text: "Start with what your teen wants to do" },
    {
      type: "paragraph",
      text: "Traditionally, finding a teen travel program might mean hearing about an organization from another parent, going to its website and browsing the trips it happens to offer.",
    },
    {
      type: "paragraph",
      text: "That works…but it starts with the provider rather than the teenager.",
    },
    {
      type: "paragraph",
      text: "Instead, ask:",
    },
    {
      type: "paragraph",
      text: "If they could do almost anything next summer, what would make your teen genuinely excited?",
    },
    {
      type: "paragraph",
      text: "Maybe they already have a very specific answer.",
    },
    {
      type: "quote",
      text: "\"I want to work with sea turtles.\"",
      links: [{ text: "sea turtles", href: list("sea-turtle-programs") }],
    },
    {
      type: "paragraph",
      text: "Start with sea turtles.",
      links: [{ text: "sea turtles", href: list("sea-turtle-programs") }],
    },
    {
      type: "paragraph",
      text: "Instead of choosing a destination first, you can see programs centered around sea turtles and compare the different places, organizations and experiences available.",
      links: [{ text: "sea turtles", href: list("sea-turtle-programs") }],
    },
    {
      type: "paragraph",
      text: "One program might emphasize conservation. Another might combine wildlife work with cultural experiences or adventure.",
      links: [{ text: "conservation", href: list("conservation-programs") }],
    },
    {
      type: "paragraph",
      text: "Now the conversation becomes: Which of these experiences sounds most interesting?",
    },
    {
      type: "quote",
      text: "\"I want to climb Kilimanjaro.\"",
      links: [{ text: "Kilimanjaro", href: list("kilimanjaro-programs") }],
    },
    {
      type: "paragraph",
      text: "Search Kilimanjaro and compare trips across multiple organizations.",
      links: [{ text: "Kilimanjaro", href: list("kilimanjaro-programs") }],
    },
    {
      type: "paragraph",
      text: "Rather than finding one organization's Kilimanjaro trip and stopping there, you can look at different approaches to the same big goal, then compare dates, trip length, itinerary, price and the rest of the experience.",
      links: [{ text: "Kilimanjaro", href: list("kilimanjaro-programs") }],
    },
    {
      type: "paragraph",
      text: "That's very different from asking, \"Which trip should we choose from this company's catalog?\"",
    },
    {
      type: "quote",
      text: "\"I want to learn to scuba dive.\"",
      links: [{ text: "scuba dive", href: list("scuba-programs") }],
    },
    {
      type: "paragraph",
      text: "Start with scuba and see where it could take them.",
      links: [{ text: "scuba", href: list("scuba-programs") }],
    },
    {
      type: "paragraph",
      text: "Or explore sailing, safari, backpacking, photography or fashion.",
      links: [
        { text: "sailing", href: list("sailing-programs") },
        { text: "safari", href: list("safari-programs") },
        { text: "backpacking", href: list("backpacking-programs") },
        { text: "photography", href: list("photography-programs") },
        { text: "fashion", href: list("fashion-programs") },
      ],
    },
    {
      type: "paragraph",
      text: "A student interested in studying animals might start with conservation, marine science or veterinary studies. A student with a more academic or creative interest might explore entrepreneurship or architecture. Or, when thinking about traveling, they might simply want to experience another culture more deeply and enjoy a language and culture immersion program.",
      links: [
        { text: "conservation", href: list("conservation-programs") },
        { text: "marine science", href: list("marine-biology-programs") },
        { text: "veterinary studies", href: list("veterinary-studies-programs") },
        { text: "entrepreneurship", href: list("entrepreneurship-programs") },
        { text: "architecture", href: list("architecture-programs") },
        {
          text: "language and culture immersion",
          href: list("language-immersion-programs"),
        },
      ],
    },
    {
      type: "paragraph",
      text: "The point isn't to figure out which predefined category your teen belongs in.",
    },
    {
      type: "paragraph",
      text: "Start with what they want to do, and see where it could take them.",
    },
    { type: "subheading", text: "Or start with a place they can't stop talking about" },
    {
      type: "paragraph",
      text: "Sometimes the destination does come first.",
    },
    {
      type: "quote",
      text: "\"I dream of going to Japan.\"",
      links: [{ text: "Japan", href: list("japan-programs") }],
    },
    {
      type: "paragraph",
      text: "Maybe your teen pictures themselves in Costa Rica, want to explore the Galápagos, or have always wanted to visit Greece.",
      links: [
        { text: "Costa Rica", href: list("costa-rica-programs") },
        { text: "Galápagos", href: list("galapagos-programs") },
        { text: "Greece", href: list("greece-programs") },
      ],
    },
    {
      type: "paragraph",
      text: "Start there instead.",
    },
    {
      type: "paragraph",
      text: "Explore Summer lets you browse teen programs in:",
    },
    {
      type: "paragraph",
      text: "Japan · Costa Rica · France · Germany · China · Galápagos · Greece · Africa · Spain · Italy · South Korea · Iceland · Ireland · Caribbean",
      links: [
        { text: "Japan", href: list("japan-programs") },
        { text: "Costa Rica", href: list("costa-rica-programs") },
        { text: "France", href: list("france-programs") },
        { text: "Germany", href: list("germany-programs") },
        { text: "China", href: list("china-programs") },
        { text: "Galápagos", href: list("galapagos-programs") },
        { text: "Greece", href: list("greece-programs") },
        { text: "Africa", href: list("africa-programs") },
        { text: "Spain", href: list("spain-programs") },
        { text: "Italy", href: list("italy-programs") },
        { text: "South Korea", href: list("south-korea-programs") },
        { text: "Iceland", href: list("iceland-programs") },
        { text: "Ireland", href: list("ireland-programs") },
        { text: "Caribbean", href: list("caribbean-programs") },
      ],
    },
    {
      type: "paragraph",
      text: "A search across programs by destination can reveal just how different two trips to the same place can be.",
    },
    {
      type: "paragraph",
      text: "Three teenagers can all say, \"I want to go to Costa Rica,\" and have completely different summers in mind.",
      links: [{ text: "Costa Rica", href: list("costa-rica-programs") }],
    },
    {
      type: "paragraph",
      text: "One might be looking for wildlife and conservation. Another might care about language immersion. Another might simply want a challenging outdoor adventure.",
      links: [
        { text: "conservation", href: list("conservation-programs") },
        { text: "language immersion", href: list("language-immersion-programs") },
        { text: "outdoor adventure", href: list("backpacking-programs") },
      ],
    },
    {
      type: "paragraph",
      text: "Searching across organizations lets you see those possibilities before deciding what kind of experience is the right one.",
    },
    { type: "subheading", text: "Try searching both ways" },
    {
      type: "paragraph",
      text: "You don't necessarily need to decide between where and what.",
    },
    {
      type: "paragraph",
      text: "Your teen might know they want to see wildlife, but not where. Start with safari or conservation.",
      links: [
        { text: "safari", href: list("safari-programs") },
        { text: "conservation", href: list("conservation-programs") },
      ],
    },
    {
      type: "paragraph",
      text: "They might be fascinated by Japan but have no idea what kinds of teen programs exist there. Start with Japan.",
      links: [{ text: "Japan", href: list("japan-programs") }],
    },
    {
      type: "paragraph",
      text: "Or perhaps the idea is unusually specific: I want a serious backpacking trip. I want to study fashion somewhere new. I want to learn about entrepreneurship while traveling.",
      links: [
        { text: "backpacking", href: list("backpacking-programs") },
        { text: "fashion", href: list("fashion-programs") },
        { text: "entrepreneurship", href: list("entrepreneurship-programs") },
      ],
    },
    {
      type: "paragraph",
      text: "Those are useful starting points too.",
    },
    {
      type: "paragraph",
      text: "This is one of the advantages of searching programs across many organizations at once. You don't need to know which company specializes in the experience you're looking for before you start.",
    },
    {
      type: "paragraph",
      text: "You can start with the idea.",
    },
    { type: "subheading", text: "Then add the constraints that actually matter" },
    {
      type: "paragraph",
      text: "Finding an amazing program is only step one. It also has to fit your teenager—and your summer.",
    },
    {
      type: "paragraph",
      text: "Once you've found some interesting possibilities, narrow them based on practical criteria such as:",
    },
    {
      type: "list",
      items: [
        "Dates: Does it fit around school, family travel or other summer commitments?",
        "Length: Are they looking for ten days away or a month?",
        "Budget: What does the program cost, and what isn't included?",
        "Destination: How far are they comfortable traveling?",
        "Program style: Is this primarily adventure, academics, service, cultural immersion—or some combination?",
        "Physical intensity: Is your teen looking for a challenge or something less demanding?",
        "Experience level: Does the trip require previous backpacking, diving, language or other experience?",
      ],
    },
    {
      type: "paragraph",
      text: "Starting early gives you the luxury of doing this in the right order.",
    },
    {
      type: "paragraph",
      text: "Instead of beginning with \"What can we find that fits these dates?\", you can begin with:",
    },
    {
      type: "paragraph",
      text: "\"What would you really like to do?\"",
    },
    {
      type: "paragraph",
      text: "Then narrow those possibilities to the programs that actually work.",
    },
    { type: "subheading", text: "Compare programs across organizations" },
    {
      type: "paragraph",
      text: "Explore Summer currently brings together global and adventure programs from organizations including CIEE High School Abroad, Moondance Adventures, Lasting Adventures, AMIGOS de las Americas, Apogee Adventures, Bold Earth Adventure Camp, Wilderness Adventures, Broadreach High School Programs, ARCC Programs, Travel for Teens, Global Leadership Adventures (GLA), Rustic Pathways and The Road Less Traveled.",
    },
    {
      type: "paragraph",
      text: "That makes it possible to start with Japan, sea turtles or Kilimanjaro rather than starting with the name of a travel company.",
      links: [
        { text: "Japan", href: list("japan-programs") },
        { text: "sea turtles", href: list("sea-turtle-programs") },
        { text: "Kilimanjaro", href: list("kilimanjaro-programs") },
      ],
    },
    {
      type: "paragraph",
      text: "But these organizations, and the individual programs they offer, aren't interchangeable. Trips can differ substantially in group size, philosophy, accommodations, independence, physical intensity, service components, supervision and what students actually do each day.",
    },
    {
      type: "paragraph",
      text: "Once you've found experiences that interest your teen, dig into the individual programs. Read the itinerary. Understand what's included. Review the organization's safety practices and policies. Talk to the provider if you have questions.",
    },
    {
      type: "paragraph",
      text: "Discovery helps you find the possibilities. Due diligence helps you choose among them.",
    },
    { type: "subheading", text: "Don't rush. Search earlier." },
    {
      type: "paragraph",
      text: "Summer 2027 enrollment opening in September can make it feel like you need to make a decision now.",
    },
    {
      type: "paragraph",
      text: "You don't.",
    },
    {
      type: "paragraph",
      text: "What you can do now is explore while you have time to be curious.",
    },
    {
      type: "paragraph",
      text: "Search France. Search veterinary studies. Search sailing. Search China. Search entrepreneurship. Or start with whatever your teenager has been talking about lately and see where it takes you.",
      links: [
        { text: "France", href: list("france-programs") },
        { text: "veterinary studies", href: list("veterinary-studies-programs") },
        { text: "sailing", href: list("sailing-programs") },
        { text: "China", href: list("china-programs") },
        { text: "entrepreneurship", href: list("entrepreneurship-programs") },
      ],
    },
    {
      type: "paragraph",
      text: "Save the programs that stand out. Compare the experiences. Then dig into the details with the individual providers before you book.",
    },
    {
      type: "paragraph",
      text: "Starting early shouldn't mean choosing quickly. It should mean having more choices.",
    },
    {
      type: "paragraph",
      text: "Because the goal isn't simply to find a teen travel program for next summer.",
    },
    {
      type: "paragraph",
      text: "It's to find one your teen is genuinely excited to experience.",
    },
    {
      type: "paragraph",
      text: "Start your search now.",
      links: [{ text: "Start your search now", href: "/search" }],
    },
  ],
};
