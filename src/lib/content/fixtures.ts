import type { Article, Job, Locale, TaxonomyValue } from "./types";

const localeOffset: Record<Locale, number> = { fr: 0, en: 1000, nl: 2000 };

const labels = {
  fr: {
    brussels: "Bruxelles",
    antwerp: "Anvers",
    remote: "Télétravail — Belgique",
    project: "Gestion de projet",
    engineering: "Ingénierie IT",
    data: "Data & gouvernance",
    analysis: "Analyse métier",
    permanent: "CDI",
    freelance: "Freelance",
    hybrid: "Hybride",
    onsite: "Sur site",
    remoteMode: "À distance",
  },
  en: {
    brussels: "Brussels",
    antwerp: "Antwerp",
    remote: "Remote — Belgium",
    project: "Project management",
    engineering: "IT engineering",
    data: "Data & governance",
    analysis: "Business analysis",
    permanent: "Permanent",
    freelance: "Freelance",
    hybrid: "Hybrid",
    onsite: "On-site",
    remoteMode: "Remote",
  },
  nl: {
    brussels: "Brussel",
    antwerp: "Antwerpen",
    remote: "Thuiswerk — België",
    project: "Projectmanagement",
    engineering: "IT-engineering",
    data: "Data & governance",
    analysis: "Businessanalyse",
    permanent: "Vast contract",
    freelance: "Freelance",
    hybrid: "Hybride",
    onsite: "Op locatie",
    remoteMode: "Op afstand",
  },
} as const;

function term(id: number, slug: string, label: string): TaxonomyValue {
  return { id, slug, label };
}

const jobCopy = {
  fr: [
    {
      slug: "chef-de-projet-senior",
      title: "Chef de projet senior",
      summary: "Pilotez un programme de transformation à fort impact au cœur d’un environnement européen exigeant.",
      responsibilities: "<p>Vous prenez la responsabilité du cadrage, de la gouvernance et de la livraison d’un programme transversal.</p><ul><li>Aligner les parties prenantes métier et IT.</li><li>Structurer la feuille de route, les risques et les arbitrages.</li><li>Accompagner les équipes jusqu’à l’adoption.</li></ul>",
      profile: "<p>Vous combinez au moins huit années d’expérience en delivery complexe avec une communication claire, calme et orientée décision.</p>",
      offer: "<p>Une mission visible, une équipe senior et un cadre de travail hybride au centre de Bruxelles.</p>",
    },
    {
      slug: "ingenieur-plateforme-cloud",
      title: "Ingénieur plateforme cloud",
      summary: "Concevez une plateforme cloud sécurisée qui accélère les équipes produit sans sacrifier la fiabilité.",
      responsibilities: "<p>Vous faites évoluer une plateforme interne utilisée par plusieurs équipes de développement.</p><ul><li>Industrialiser l’infrastructure as code.</li><li>Renforcer l’observabilité et les garde-fous.</li><li>Améliorer l’expérience développeur.</li></ul>",
      profile: "<p>Vous maîtrisez Azure ou AWS, Terraform, Kubernetes et les pratiques SRE. Vous aimez documenter et transmettre.</p>",
      offer: "<p>Une mission technique structurante avec une grande autonomie d’exécution.</p>",
    },
    {
      slug: "consultant-gouvernance-data",
      title: "Consultant en gouvernance des données",
      summary: "Transformez les ambitions data en règles, rôles et pratiques réellement adoptées par les équipes.",
      responsibilities: "<p>Vous définissez et déployez un modèle de gouvernance pragmatique.</p><ul><li>Cartographier les domaines et responsabilités.</li><li>Définir les standards de qualité.</li><li>Animer les communautés de data owners.</li></ul>",
      profile: "<p>Vous avez une expérience confirmée en gouvernance, qualité ou architecture des données dans une organisation complexe.</p>",
      offer: "<p>Une mission flexible, principalement à distance, avec des ateliers ponctuels en Belgique.</p>",
    },
    {
      slug: "business-analyst-finance",
      title: "Business analyst — Finance",
      summary: "Faites le lien entre les équipes financières et technologiques pour simplifier des processus critiques.",
      responsibilities: "<p>Vous analysez les besoins, clarifiez les processus et sécurisez leur traduction fonctionnelle.</p><ul><li>Conduire les ateliers métier.</li><li>Rédiger les exigences et critères d’acceptation.</li><li>Accompagner les tests utilisateurs.</li></ul>",
      profile: "<p>Vous connaissez les processus finance et savez transformer une problématique ambiguë en décisions actionnables.</p>",
      offer: "<p>Un rôle durable au sein d’une équipe proche du terrain.</p>",
    },
  ],
  en: [
    {
      slug: "senior-project-manager",
      title: "Senior project manager",
      summary: "Lead a high-impact transformation programme in a demanding European environment.",
      responsibilities: "<p>You will own the framing, governance and delivery of a cross-functional programme.</p><ul><li>Align business and technology stakeholders.</li><li>Structure the roadmap, risks and decisions.</li><li>Guide teams through adoption.</li></ul>",
      profile: "<p>You combine at least eight years of complex delivery experience with clear, calm and decision-oriented communication.</p>",
      offer: "<p>A visible assignment, a senior team and a hybrid working model in central Brussels.</p>",
    },
    {
      slug: "cloud-platform-engineer",
      title: "Cloud platform engineer",
      summary: "Design a secure cloud platform that helps product teams move faster without compromising reliability.",
      responsibilities: "<p>You will evolve an internal platform used by several development teams.</p><ul><li>Industrialise infrastructure as code.</li><li>Strengthen observability and guardrails.</li><li>Improve the developer experience.</li></ul>",
      profile: "<p>You are confident with Azure or AWS, Terraform, Kubernetes and SRE practices, and you enjoy documenting and teaching.</p>",
      offer: "<p>A technically significant assignment with substantial delivery autonomy.</p>",
    },
    {
      slug: "data-governance-consultant",
      title: "Data governance consultant",
      summary: "Turn data ambitions into practical rules, ownership and habits that teams actually adopt.",
      responsibilities: "<p>You will define and roll out a pragmatic governance model.</p><ul><li>Map domains and accountability.</li><li>Define quality standards.</li><li>Facilitate communities of data owners.</li></ul>",
      profile: "<p>You bring proven experience in data governance, quality or architecture within a complex organisation.</p>",
      offer: "<p>A flexible, primarily remote assignment with occasional workshops in Belgium.</p>",
    },
    {
      slug: "finance-business-analyst",
      title: "Business analyst — Finance",
      summary: "Connect finance and technology teams to simplify business-critical processes.",
      responsibilities: "<p>You will analyse needs, clarify processes and ensure they translate into strong functional requirements.</p><ul><li>Lead business workshops.</li><li>Write requirements and acceptance criteria.</li><li>Support user acceptance testing.</li></ul>",
      profile: "<p>You understand finance processes and can turn an ambiguous problem into actionable decisions.</p>",
      offer: "<p>A long-term role in a grounded, collaborative team.</p>",
    },
  ],
  nl: [
    {
      slug: "senior-projectmanager",
      title: "Senior projectmanager",
      summary: "Leid een transformatieprogramma met grote impact binnen een veeleisende Europese omgeving.",
      responsibilities: "<p>U neemt de verantwoordelijkheid voor de afbakening, governance en oplevering van een transversaal programma.</p><ul><li>Business- en IT-stakeholders op één lijn brengen.</li><li>Roadmap, risico’s en beslissingen structureren.</li><li>Teams begeleiden tot en met adoptie.</li></ul>",
      profile: "<p>U combineert minstens acht jaar ervaring in complexe delivery met heldere, rustige en beslissingsgerichte communicatie.</p>",
      offer: "<p>Een zichtbare opdracht, een senior team en hybride werken in het centrum van Brussel.</p>",
    },
    {
      slug: "cloud-platform-engineer",
      title: "Cloud platform engineer",
      summary: "Ontwerp een veilig cloudplatform dat productteams versnelt zonder betrouwbaarheid in te leveren.",
      responsibilities: "<p>U bouwt verder aan een intern platform dat door meerdere ontwikkelteams wordt gebruikt.</p><ul><li>Infrastructure as code industrialiseren.</li><li>Observability en guardrails versterken.</li><li>De developer experience verbeteren.</li></ul>",
      profile: "<p>U beheerst Azure of AWS, Terraform, Kubernetes en SRE-praktijken en deelt kennis graag met anderen.</p>",
      offer: "<p>Een technisch bepalende opdracht met veel autonomie.</p>",
    },
    {
      slug: "consultant-data-governance",
      title: "Consultant data governance",
      summary: "Vertaal data-ambities naar concrete regels, eigenaarschap en werkwijzen die teams echt toepassen.",
      responsibilities: "<p>U definieert en implementeert een pragmatisch governancemodel.</p><ul><li>Domeinen en verantwoordelijkheden in kaart brengen.</li><li>Kwaliteitsstandaarden bepalen.</li><li>Communities van data owners begeleiden.</li></ul>",
      profile: "<p>U hebt aantoonbare ervaring in data governance, datakwaliteit of architectuur binnen een complexe organisatie.</p>",
      offer: "<p>Een flexibele, hoofdzakelijk remote opdracht met af en toe workshops in België.</p>",
    },
    {
      slug: "business-analist-finance",
      title: "Businessanalist — Finance",
      summary: "Verbind finance en technologie om bedrijfskritische processen eenvoudiger te maken.",
      responsibilities: "<p>U analyseert behoeften, verduidelijkt processen en vertaalt ze naar sterke functionele vereisten.</p><ul><li>Businessworkshops leiden.</li><li>Requirements en acceptatiecriteria schrijven.</li><li>Gebruikerstesten ondersteunen.</li></ul>",
      profile: "<p>U kent financiële processen en maakt van een onduidelijk probleem concrete beslissingen.</p>",
      offer: "<p>Een duurzame rol in een betrokken en pragmatisch team.</p>",
    },
  ],
} as const;

const translatedSlugs = jobCopy.fr.map((_, index) => ({
  fr: jobCopy.fr[index].slug,
  en: jobCopy.en[index].slug,
  nl: jobCopy.nl[index].slug,
}));

export function getFixtureJobs(locale: Locale): Job[] {
  const l = labels[locale];
  const copy = jobCopy[locale];

  const locations = [
    { ...term(1, "brussels", l.brussels), city: l.brussels, region: "Brussels-Capital", countryCode: "BE", postalCode: "1000" },
    { ...term(1, "brussels", l.brussels), city: l.brussels, region: "Brussels-Capital", countryCode: "BE", postalCode: "1000" },
    { ...term(2, "remote-belgium", l.remote), countryCode: "BE" },
    { ...term(3, "antwerp", l.antwerp), city: l.antwerp, region: "Flanders", countryCode: "BE", postalCode: "2000" },
  ];
  const expertises = [
    term(10, "project-management", l.project),
    term(11, "it-engineering", l.engineering),
    term(12, "data-governance", l.data),
    term(13, "business-analysis", l.analysis),
  ];
  const contracts = [
    term(20, "permanent", l.permanent),
    term(21, "freelance", l.freelance),
    term(21, "freelance", l.freelance),
    term(20, "permanent", l.permanent),
  ];
  const modes = [
    term(30, "hybrid", l.hybrid),
    term(30, "hybrid", l.hybrid),
    term(31, "remote", l.remoteMode),
    term(32, "onsite", l.onsite),
  ];
  const skillSets = [
    ["programme-governance", "stakeholder-management", "agile-delivery"],
    ["azure", "terraform", "kubernetes", "sre"],
    ["data-governance", "data-quality", "facilitation"],
    ["business-analysis", "finance", "process-design"],
  ];

  return copy.map((job, index) => ({
    id: 101 + index + localeOffset[locale],
    reference: `CGIC-2026-${String(index + 14).padStart(3, "0")}`,
    locale,
    slug: job.slug,
    title: job.title,
    summary: job.summary,
    responsibilitiesHtml: job.responsibilities,
    candidateProfileHtml: job.profile,
    offerHtml: job.offer,
    location: locations[index],
    expertise: expertises[index],
    contractType: contracts[index],
    workMode: modes[index],
    skills: skillSets[index].map((slug, skillIndex) => term(40 + index * 10 + skillIndex, slug, slug.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" "))),
    publishedAt: `2026-0${index + 4}-12T08:00:00.000Z`,
    startDate: index === 2 ? undefined : "2026-09-01",
    closingDate: `2027-0${index + 2}-28`,
    state: "open",
    featured: index === 0,
    applicationUrl: `/${locale}/contact?job=CGIC-2026-${String(index + 14).padStart(3, "0")}`,
    applicantCountries: index === 2 ? ["BE"] : undefined,
    contactName: "CGIC Talent Team",
    featuredImage: index === 0 ? {
      url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=85",
      alt: locale === "fr" ? "Équipe en atelier de travail" : locale === "nl" ? "Team tijdens een werksessie" : "Team in a working session",
      width: 1200,
      height: 800,
    } : undefined,
    seo: { title: job.title, description: job.summary },
    alternates: translatedSlugs[index],
  }));
}

const articleCopy = {
  fr: [
    {
      slug: "equipes-delivery-resilientes",
      title: "Construire des équipes delivery qui tiennent dans la durée",
      excerpt: "La performance ne vient pas d’une accumulation de profils seniors, mais d’un système de responsabilités, de décisions et de confiance.",
      category: "Leadership",
      content: "<p>Les programmes complexes échouent rarement par manque d’intelligence individuelle. Ils s’enlisent lorsque personne ne sait clairement qui décide, comment les risques remontent et ce que signifie réellement « terminé ».</p><h2>Commencer par le système, pas par l’organigramme</h2><p>Une équipe résiliente dispose de frontières explicites. Chacun comprend ce qu’il possède, ce qu’il influence et quand il doit demander un arbitrage.</p><blockquote>La clarté opérationnelle est une forme de respect : elle évite aux équipes de deviner en permanence ce que l’organisation attend.</blockquote><h2>Trois habitudes qui changent la trajectoire</h2><ul><li>Rendre les décisions visibles et datées.</li><li>Traiter les dépendances comme du travail à part entière.</li><li>Mesurer les résultats plutôt que l’activité.</li></ul><p>Le rôle du leadership est alors moins de contrôler chaque mouvement que de maintenir un environnement où les bons arbitrages peuvent être pris rapidement.</p>",
    },
    {
      slug: "transformation-cote-humain",
      title: "La transformation se joue du côté humain",
      excerpt: "Les outils accélèrent le changement, mais l’adoption dépend toujours de la manière dont les personnes comprennent leur nouveau rôle.",
      category: "Transformation",
      content: "<p>Une nouvelle plateforme peut être livrée à temps et rester pourtant inutilisée. L’écart entre déploiement et adoption se crée bien avant la mise en production.</p><h2>Rendre le changement concret</h2><p>Les équipes ont besoin de comprendre ce qui change dans leur quotidien, quelles décisions leur appartiennent et où trouver de l’aide.</p><h2>Observer avant d’optimiser</h2><p>Les meilleurs programmes consacrent du temps à regarder le travail réel. Cette observation fait apparaître les contournements, les dépendances informelles et les connaissances invisibles.</p>",
    },
    {
      slug: "gouvernance-projet-utile",
      title: "Une gouvernance de projet qui aide vraiment à décider",
      excerpt: "Une gouvernance utile réduit le temps entre un signal et une décision, au lieu de multiplier les comités.",
      category: "Delivery",
      content: "<p>La gouvernance devient lourde lorsqu’elle sert à documenter le passé plutôt qu’à orienter le prochain mouvement.</p><h2>Concevoir autour des décisions</h2><p>Chaque rituel doit avoir une question précise, des données fiables et une personne capable de trancher.</p><ul><li>Supprimer les rapports qui ne changent aucune décision.</li><li>Nommer un propriétaire pour chaque risque majeur.</li><li>Limiter les indicateurs aux signaux actionnables.</li></ul>",
    },
  ],
  en: [
    {
      slug: "building-resilient-delivery-teams",
      title: "Building delivery teams that last",
      excerpt: "Performance does not come from collecting senior profiles. It comes from a system of ownership, decisions and trust.",
      category: "Leadership",
      content: "<p>Complex programmes rarely fail because individuals lack intelligence. They stall when nobody knows who decides, how risks escalate or what “done” truly means.</p><h2>Start with the system, not the org chart</h2><p>A resilient team has explicit boundaries. People understand what they own, what they influence and when they need an escalation.</p><blockquote>Operational clarity is a form of respect: it keeps teams from constantly guessing what the organisation expects.</blockquote><h2>Three habits that change the trajectory</h2><ul><li>Make decisions visible and dated.</li><li>Treat dependencies as real work.</li><li>Measure outcomes rather than activity.</li></ul><p>Leadership becomes less about controlling every movement and more about maintaining an environment where sound decisions happen quickly.</p>",
    },
    {
      slug: "the-human-side-of-transformation",
      title: "Transformation happens on the human side",
      excerpt: "Tools accelerate change, but adoption still depends on whether people understand their new role.",
      category: "Transformation",
      content: "<p>A new platform can ship on time and still remain unused. The gap between deployment and adoption begins long before go-live.</p><h2>Make change concrete</h2><p>Teams need to understand what changes in their daily work, which decisions become theirs and where they can find help.</p><h2>Observe before optimising</h2><p>The strongest programmes spend time watching real work. This reveals workarounds, informal dependencies and invisible knowledge.</p>",
    },
    {
      slug: "project-governance-for-decisions",
      title: "Project governance that actually helps decisions",
      excerpt: "Useful governance reduces the time between a signal and a decision instead of multiplying committees.",
      category: "Delivery",
      content: "<p>Governance becomes heavy when it documents the past instead of shaping the next move.</p><h2>Design around decisions</h2><p>Every ritual should have a precise question, reliable evidence and someone empowered to decide.</p><ul><li>Remove reports that never change a decision.</li><li>Name an owner for every material risk.</li><li>Limit metrics to actionable signals.</li></ul>",
    },
  ],
  nl: [
    {
      slug: "duurzame-delivery-teams-bouwen",
      title: "Deliveryteams bouwen die standhouden",
      excerpt: "Prestaties komen niet van een verzameling senior profielen, maar van een systeem van eigenaarschap, beslissingen en vertrouwen.",
      category: "Leiderschap",
      content: "<p>Complexe programma’s mislukken zelden door een gebrek aan individuele intelligentie. Ze lopen vast wanneer niemand weet wie beslist, hoe risico’s escaleren of wat ‘klaar’ werkelijk betekent.</p><h2>Begin bij het systeem, niet bij het organigram</h2><p>Een veerkrachtig team heeft duidelijke grenzen. Mensen begrijpen wat ze bezitten, wat ze beïnvloeden en wanneer escalatie nodig is.</p><blockquote>Operationele duidelijkheid is een vorm van respect: teams hoeven niet voortdurend te raden wat de organisatie verwacht.</blockquote><h2>Drie gewoonten die het traject veranderen</h2><ul><li>Maak beslissingen zichtbaar en gedateerd.</li><li>Behandel afhankelijkheden als echt werk.</li><li>Meet resultaten in plaats van activiteit.</li></ul>",
    },
    {
      slug: "de-menselijke-kant-van-transformatie",
      title: "Transformatie gebeurt aan de menselijke kant",
      excerpt: "Tools versnellen verandering, maar adoptie hangt nog altijd af van hoe mensen hun nieuwe rol begrijpen.",
      category: "Transformatie",
      content: "<p>Een nieuw platform kan op tijd worden opgeleverd en toch ongebruikt blijven. De kloof tussen uitrol en adoptie ontstaat lang voor de lancering.</p><h2>Maak verandering concreet</h2><p>Teams moeten begrijpen wat er in hun dagelijkse werk verandert, welke beslissingen van hen worden en waar hulp beschikbaar is.</p><h2>Observeer vóór u optimaliseert</h2><p>De sterkste programma’s kijken eerst naar het echte werk. Zo worden omwegen, informele afhankelijkheden en onzichtbare kennis zichtbaar.</p>",
    },
    {
      slug: "projectgovernance-voor-beslissingen",
      title: "Projectgovernance die beslissingen echt helpt",
      excerpt: "Goede governance verkort de tijd tussen een signaal en een beslissing in plaats van meer comités te creëren.",
      category: "Delivery",
      content: "<p>Governance wordt zwaar wanneer ze het verleden documenteert in plaats van de volgende stap te sturen.</p><h2>Ontwerp rond beslissingen</h2><p>Elk ritueel heeft een precieze vraag, betrouwbare informatie en iemand met beslissingsrecht nodig.</p><ul><li>Verwijder rapporten die geen enkele beslissing veranderen.</li><li>Wijs voor elk belangrijk risico een eigenaar aan.</li><li>Beperk indicatoren tot signalen waarop actie mogelijk is.</li></ul>",
    },
  ],
} as const;

const articleSlugs = articleCopy.fr.map((_, index) => ({
  fr: articleCopy.fr[index].slug,
  en: articleCopy.en[index].slug,
  nl: articleCopy.nl[index].slug,
}));

const articleImages = [
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&q=85",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=85",
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1400&q=85",
];

const articlePublishedDates = [
  "2026-06-08T09:00:00.000Z",
  "2026-05-09T09:00:00.000Z",
  "2026-04-10T09:00:00.000Z",
];

const articleUpdatedDates = [
  "2026-06-12T09:00:00.000Z",
  "2026-05-13T09:00:00.000Z",
  "2026-04-14T09:00:00.000Z",
];

export function getFixtureArticles(locale: Locale): Article[] {
  return articleCopy[locale].map((article, index) => ({
    id: 201 + index + localeOffset[locale],
    locale,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    contentHtml: article.content,
    category: term(100 + index, article.category.toLowerCase().replaceAll(" ", "-"), article.category),
    publishedAt: articlePublishedDates[index],
    updatedAt: articleUpdatedDates[index],
    byline: "CGIC Editorial Team",
    featured: index === 0,
    featuredImage: {
      url: articleImages[index],
      alt: article.title,
      width: 1400,
      height: 933,
    },
    seo: { title: article.title, description: article.excerpt },
    alternates: articleSlugs[index],
  }));
}
