import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function makeContent(paragraphs: string[]) {
  return {
    type: "doc",
    content: paragraphs.map((text) => ({
      type: "paragraph",
      content: [{ type: "text", text }],
    })),
  };
}

function img(seed: number) {
  return `https://picsum.photos/seed/${seed}/800/450`;
}

const quickUpdates = [
  {
    textEn: "Lebanese government approves new economic reform package amid ongoing negotiations with the IMF",
    textAr: "الحكومة اللبنانية تُقرّ حزمة إصلاحات اقتصادية جديدة في خضمّ المفاوضات الجارية مع صندوق النقد الدولي",
    isBreaking: true,
  },
  {
    textEn: "Beirut weather: heavy rain expected through the weekend — coastal flooding warnings in effect",
    textAr: "طقس بيروت: أمطار غزيرة متوقعة حتى نهاية الأسبوع — تحذيرات من فيضانات على طول الساحل",
    isBreaking: false,
  },
  {
    textEn: "Central Bank announces emergency measures to stabilize the Lebanese pound exchange rate",
    textAr: "مصرف لبنان يُعلن إجراءات طارئة لتثبيت سعر صرف الليرة اللبنانية",
    isBreaking: true,
  },
  {
    textEn: "Parliamentary session postponed to next week following coalition disagreements",
    textAr: "تأجيل جلسة البرلمان إلى الأسبوع المقبل على خلفية خلافات داخل التحالف الحكومي",
    isBreaking: false,
  },
  {
    textEn: "Lebanese national football team qualifies for next round of World Cup qualifiers",
    textAr: "المنتخب اللبناني لكرة القدم يتأهل إلى الدور المقبل من تصفيات كأس العالم",
    isBreaking: false,
  },
];

const articles = [
  {
    categorySlug: "politics",
    title: "Lebanon's New Government Forms After Months of Deadlock",
    coverSeed: 10,
    isFeatured: true,
    paragraphs: [
      "Lebanon's political factions reached a landmark agreement late Thursday, ending months of governmental paralysis that had left the country without an operational cabinet.",
      "The new coalition, led by Prime Minister-designate Sami Azar, includes representatives from across the sectarian spectrum in a deal brokered with significant international pressure from France and Saudi Arabia.",
      "Markets responded positively to the news, with the unofficial exchange rate strengthening slightly against the dollar for the first time in weeks.",
    ],
  },
  {
    categorySlug: "economy",
    title: "IMF Delegation Arrives in Beirut to Resume Stalled Reform Talks",
    coverSeed: 20,
    isFeatured: false,
    paragraphs: [
      "A senior delegation from the International Monetary Fund arrived in Beirut on Wednesday, resuming negotiations over a long-delayed rescue package that could unlock billions in international aid.",
      "The talks, which broke down earlier this year over disagreements on banking sector restructuring, are expected to focus on fiscal consolidation and central bank governance reforms.",
      "Civil society groups staged a protest outside the Grand Serail, demanding that any deal include protections for small depositors who lost access to their savings.",
    ],
  },
  {
    categorySlug: "security",
    title: "Army Deploys Additional Units Along Southern Border After Incidents",
    coverSeed: 30,
    isFeatured: false,
    paragraphs: [
      "The Lebanese Armed Forces announced the deployment of additional infantry battalions to the southern border region following a series of incidents in recent days.",
      "A military spokesperson said the deployments were part of routine security operations and in coordination with UNIFIL peacekeeping forces stationed in the area.",
      "The move comes amid broader regional tensions, with the army urging residents to remain calm and report any suspicious activity to local security posts.",
    ],
  },
  {
    categorySlug: "world",
    title: "UN Security Council Renews UNIFIL Mandate for Another Year",
    coverSeed: 40,
    isFeatured: false,
    paragraphs: [
      "The United Nations Security Council voted unanimously to extend the mandate of UNIFIL — the UN Interim Force in Lebanon — for an additional twelve months.",
      "The resolution, introduced by France and Italy, maintains the force at its current strength of approximately 10,000 troops and reaffirms its role in supporting the Lebanese Army.",
      "Lebanon's Foreign Minister welcomed the vote, calling it a reaffirmation of the international community's commitment to stability in the country.",
    ],
  },
  {
    categorySlug: "sport",
    title: "Beirut Marathon Returns with Record 35,000 Registered Runners",
    coverSeed: 50,
    isFeatured: false,
    paragraphs: [
      "Organizers of the Beirut Marathon announced a record 35,000 registered participants for this year's edition, set to take place along the iconic seafront corniche next month.",
      "The event, which draws runners from over 60 countries, is themed 'Running for Hope' — a nod to the resilience of Beirut since the port explosion of 2020.",
      "Elite athletes from Kenya, Ethiopia, and Lebanon are expected to compete in the full marathon, with prize money doubling compared to last year.",
    ],
  },
  {
    categorySlug: "exclusive",
    title: "Exclusive: Secret Negotiations Behind Lebanon's Banking Deal Revealed",
    coverSeed: 60,
    isFeatured: false,
    paragraphs: [
      "Tollab Nation has obtained documents and spoken with three sources close to the negotiations revealing the behind-the-scenes deliberations that shaped Lebanon's proposed banking restructuring plan.",
      "According to the sources, who requested anonymity due to the sensitivity of the talks, a key sticking point was the allocation of losses between large depositors and bank shareholders.",
      "A final agreement is expected before the end of the month, though several major banks have privately signaled continued opposition to the proposed haircuts.",
    ],
  },
  {
    categorySlug: "general",
    title: "Beirut's Gemmayze District Revives With New Cultural Initiatives",
    coverSeed: 70,
    isFeatured: false,
    paragraphs: [
      "Four years after the port explosion leveled much of the historic Gemmayze neighborhood, a wave of cultural initiatives is breathing new life into the area's streets and storefronts.",
      "Art galleries, independent bookshops, and music venues have opened alongside rebuilt residential buildings, drawing both returning expats and young Lebanese entrepreneurs.",
      "The Gemmayze Cultural Fund, backed by a Lebanese diaspora collective in Paris, has distributed over $2 million in micro-grants to small businesses in the district.",
    ],
  },
  {
    categorySlug: "economy",
    title: "Dollar Flows Into Lebanon Rise 12% as Diaspora Remittances Surge",
    coverSeed: 80,
    isFeatured: false,
    paragraphs: [
      "Dollar inflows to Lebanon rose 12% year-on-year in the first quarter, driven largely by diaspora remittances and seasonal tourism spending, according to central bank figures.",
      "The data offers a rare bright spot in an otherwise bleak economic picture, suggesting that informal currency flows remain a critical lifeline for Lebanese households.",
      "Economists caution that structural problems — including the paralysis of the formal banking sector — continue to limit the impact of these inflows on the broader economy.",
    ],
  },
];

async function main() {
  console.log("Seeding demo data...\n");

  console.log("Creating quick updates...");
  for (const u of quickUpdates) {
    await prisma.quickUpdate.create({ data: u });
    console.log(`  ✓ [${u.isBreaking ? "BREAKING" : "NORMAL"}] ${u.textEn.slice(0, 60)}...`);
  }

  const categories = await prisma.category.findMany();
  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  console.log("\nCreating articles...");
  for (const a of articles) {
    const categoryId = catMap[a.categorySlug];
    if (!categoryId) {
      console.warn(`  ⚠ Category "${a.categorySlug}" not found — skipping`);
      continue;
    }

    const slug = a.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);

    await prisma.article.upsert({
      where: { slug },
      update: {},
      create: { title: a.title, slug, content: makeContent(a.paragraphs), coverImage: img(a.coverSeed), isFeatured: a.isFeatured, categoryId },
    });

    console.log(`  ✓ ${a.isFeatured ? "[FEATURED] " : ""}${a.title}`);
  }

  console.log("\nDemo seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
