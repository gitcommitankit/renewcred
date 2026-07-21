import { PrismaClient, VersionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper: Create Tiptap JSON content

function tiptapDoc(...content: unknown[]) {
  return { type: 'doc', content };
}

function heading(level: number, text: string) {
  return {
    type: 'heading',
    attrs: { level },
    content: [{ type: 'text', text }],
  };
}

function paragraph(text: string) {
  return {
    type: 'paragraph',
    content: [{ type: 'text', text }],
  };
}

function bulletList(...items: string[]) {
  return {
    type: 'bulletList',
    content: items.map((item) => ({
      type: 'listItem',
      content: [paragraph(item)],
    })),
  };
}

function orderedList(...items: string[]) {
  return {
    type: 'orderedList',
    attrs: { start: 1 },
    content: items.map((item) => ({
      type: 'listItem',
      content: [paragraph(item)],
    })),
  };
}

// Section content builders

const sectionContents: Record<string, object> = {
  'ev-1.0': tiptapDoc(
    paragraph(
      'Electric vehicles (EVs) represent a fundamental shift in transportation, offering significant potential for reducing greenhouse gas emissions from the transport sector. This standard establishes the framework for evaluating and certifying carbon credits generated through EV adoption programs.'
    ),
    paragraph(
      'The scope of this standard covers battery electric vehicles (BEVs) and plug-in hybrid electric vehicles (PHEVs) deployed in commercial and passenger vehicle categories. It defines the methodology for calculating emission reductions relative to internal combustion engine (ICE) baseline vehicles.'
    ),
    paragraph(
      'Key considerations include the carbon intensity of the electricity grid, vehicle efficiency ratings, and the lifecycle emissions of battery production and disposal. The standard aims to provide a transparent and verifiable approach to quantifying the climate benefits of electric vehicle deployment.'
    ),
    bulletList(
      'Applies to battery electric vehicles (BEVs) and plug-in hybrid electric vehicles (PHEVs)',
      'Covers both commercial fleet and passenger vehicle categories',
      'Includes grid emission factor calculations',
      'Addresses battery lifecycle considerations'
    )
  ),
  'ev-2.0': tiptapDoc(
    paragraph(
      'Future versions of the EV standard will incorporate advancements in battery technology, including solid-state batteries and improved recycling processes. The methodology will be updated to reflect changing grid emission factors as renewable energy penetration increases globally.'
    ),
    paragraph(
      'Planned enhancements include support for vehicle-to-grid (V2G) technology credits, autonomous vehicle fleet optimization benefits, and integration with smart charging infrastructure that maximizes renewable energy utilization.'
    )
  ),
  'ev-2.1': tiptapDoc(
    paragraph(
      'Version 2.1 will introduce refined calculations for the carbon footprint of battery manufacturing, incorporating data from leading battery producers. This update will also address the growing market for second-life battery applications in stationary energy storage.'
    ),
    paragraph(
      'The revision will include standardized approaches for assessing the environmental impact of critical mineral extraction used in battery production, including lithium, cobalt, and nickel supply chains.'
    )
  ),
  'ev-3.0': tiptapDoc(
    paragraph(
      'Version 3.0 represents a major revision that will expand the standard to cover emerging electric mobility solutions including electric aviation, marine vessels, and heavy-duty trucking. This version will also introduce a comprehensive lifecycle assessment methodology.'
    ),
    orderedList(
      'Electric aviation credit methodology',
      'Marine vessel electrification standards',
      'Heavy-duty trucking and logistics frameworks',
      'Comprehensive lifecycle assessment integration'
    )
  ),

  'biochar-1.0': tiptapDoc(
    paragraph(
      'Biochar is a carbon-rich material produced through the pyrolysis of organic biomass in a low-oxygen environment. This standard provides the framework for certifying carbon removal credits from biochar production and application.'
    ),
    paragraph(
      'The permanence of carbon sequestration through biochar is a key advantage, with studies indicating stability over centuries to millennia when applied to soils. This standard establishes monitoring, reporting, and verification (MRV) requirements to ensure the integrity of biochar carbon credits.'
    ),
    bulletList(
      'Defines eligible feedstock sources and sustainability criteria',
      'Establishes pyrolysis process requirements and emission controls',
      'Sets durability and permanence verification protocols',
      'Includes soil application guidelines and monitoring requirements'
    )
  ),
  'biochar-2.0': tiptapDoc(
    paragraph(
      'Future versions will expand the scope to include novel biochar applications beyond soil amendment, such as construction materials, water filtration systems, and industrial carbon storage. Updated methodologies will incorporate improved understanding of biochar stability across different soil types and climatic conditions.'
    )
  ),

  'methane-1.0': tiptapDoc(
    paragraph(
      'Methane is a potent greenhouse gas with a global warming potential approximately 80 times that of carbon dioxide over a 20-year period. This standard establishes methodologies for quantifying emission reductions from methane capture and destruction projects across multiple sectors.'
    ),
    paragraph(
      'The standard covers methane emissions from landfills, wastewater treatment facilities, coal mines, and oil and gas operations. It provides detailed guidance on baseline emission calculations, monitoring requirements, and verification procedures.'
    ),
    bulletList(
      'Landfill gas capture and utilization projects',
      'Agricultural methane reduction (enteric fermentation, manure management)',
      'Coal mine methane drainage and oxidation',
      'Oil and gas fugitive emission detection and repair (LDAR) programs'
    )
  ),
  'methane-2.0': tiptapDoc(
    paragraph(
      'Upcoming revisions will incorporate satellite-based methane monitoring data to improve baseline accuracy and enable continuous verification of emission reductions. The standard will also address emerging technologies for methane oxidation and conversion.'
    )
  ),

  'renewable-1.0': tiptapDoc(
    paragraph(
      'Renewable energy projects play a critical role in the transition to a low-carbon economy. This standard provides methodologies for certifying carbon credits from solar, wind, hydro, geothermal, and biomass energy generation that displaces fossil fuel-based electricity.'
    ),
    paragraph(
      'The standard addresses additionality requirements, ensuring that credited projects represent genuine emission reductions beyond what would have occurred under business-as-usual scenarios. It includes provisions for grid-connected and off-grid renewable energy systems.'
    ),
    orderedList(
      'Solar photovoltaic and concentrated solar power',
      'Onshore and offshore wind energy',
      'Small and large hydroelectric installations',
      'Geothermal energy projects',
      'Sustainable biomass energy generation'
    )
  ),
  'renewable-2.0': tiptapDoc(
    paragraph(
      'Future versions will address emerging renewable energy technologies including green hydrogen production, advanced energy storage systems, and ocean energy (tidal and wave power). The standard will also incorporate updated grid emission factors reflecting the increasing share of renewables in national energy mixes.'
    )
  ),
};

// Seed function

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.section.deleteMany();
  await prisma.version.deleteMany();
  await prisma.standard.deleteMany();
  await prisma.admin.deleteMany();

  // ---- Create admin user ----
  const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'Admin@123', 12);

  const admin = await prisma.admin.create({
    data: {
      email: process.env.SEED_ADMIN_EMAIL || 'admin@renewcred.com',
      passwordHash,
      name: process.env.SEED_ADMIN_NAME || 'Admin User',
    },
  });

  console.log(`✅ Admin created: ${admin.email}`);

  // ---- Create standards ----
  const standardsData = [
    {
      title: 'EV',
      slug: 'ev',
      description:
        'Lorem ipsum dolor sit amet consectetur. Massa nec vulputate amet enim turpis elit odio fusce. Nunc cursus aliquet arcu vitae dolor ac rutrum pulvinar orci. Tristique nulla sed at nisl justo ipsum accumsan sed a. Enim amet varius ligula egestas. Integer vestibulum elementum non fermentum.',
      icon: '🔋',
      sortOrder: 0,
      isPublished: true,
    },
    {
      title: 'Biochar',
      slug: 'biochar',
      description:
        'Lorem ipsum dolor sit amet consectetur. Massa nec vulputate amet enim turpis elit odio fusce. Nunc cursus aliquet arcu vitae dolor ac rutrum pulvinar orci. Tristique nulla sed at nisl justo ipsum accumsan sed a. Enim amet varius ligula egestas. Integer vestibulum elementum non fermentum.',
      icon: '🌿',
      sortOrder: 1,
      isPublished: true,
    },
    {
      title: 'Methane',
      slug: 'methane',
      description:
        'Lorem ipsum dolor sit amet consectetur. Massa nec vulputate amet enim turpis elit odio fusce. Nunc cursus aliquet arcu vitae dolor ac rutrum pulvinar orci. Tristique nulla sed at nisl justo ipsum accumsan sed a. Enim amet varius ligula egestas. Integer vestibulum elementum non fermentum.',
      icon: '💨',
      sortOrder: 2,
      isPublished: true,
    },
    {
      title: 'Renewable Energy',
      slug: 'renewable-energy',
      description:
        'Lorem ipsum dolor sit amet consectetur. Massa nec vulputate amet enim turpis elit odio fusce. Nunc cursus aliquet arcu vitae dolor ac rutrum pulvinar orci. Tristique nulla sed at nisl justo ipsum accumsan sed a. Enim amet varius ligula egestas. Integer vestibulum elementum non fermentum.',
      icon: '⚡',
      sortOrder: 3,
      isPublished: true,
    },
  ];

  for (const standardData of standardsData) {
    const standard = await prisma.standard.create({ data: standardData });
    console.log(`✅ Standard created: ${standard.title}`);

    const prefix = standard.slug === 'renewable-energy' ? 'renewable' : standard.slug;

    // ---- Create versions ----
    // Version 1: Public consultation (Draft/Consultation)
    const publicConsultation = await prisma.version.create({
      data: {
        standardId: standard.id,
        versionLabel: 'v0.9.0',
        slug: 'v0-9-0',
        status: VersionStatus.PUBLIC_CONSULTATION,
        consultationStartDate: new Date('2025-05-12'),
        consultationEndDate: new Date('2025-07-12'),
        isLatest: false,
      },
    });

    // Version 2: Certified (latest)
    const certified = await prisma.version.create({
      data: {
        standardId: standard.id,
        versionLabel: 'v1.0.0',
        slug: 'v1-0-0-certified',
        status: VersionStatus.CERTIFIED,
        certifiedAt: new Date('2025-07-12'),
        isLatest: true,
      },
    });

    console.log(`  📋 Versions created for ${standard.title}`);

    // ---- Create sections for the certified version ----
    const sectionsToCreate = [
      {
        number: '1.0',
        title: 'Introduction',
        slug: '1-0-introduction',
        sortOrder: 0,
        parentId: null as string | null,
        contentKey: `${prefix}-1.0`,
      },
      {
        number: '2.0',
        title: 'Future Versions',
        slug: '2-0-future-versions',
        sortOrder: 1,
        parentId: null as string | null,
        contentKey: `${prefix}-2.0`,
      },
      {
        number: '2.1',
        title: 'Future Versions',
        slug: '2-1-future-versions',
        sortOrder: 2,
        parentId: null as string | null,
        contentKey: `${prefix}-2.1`,
      },
      {
        number: '2.2',
        title: 'Future Versions',
        slug: '2-2-future-versions',
        sortOrder: 5,
        parentId: null as string | null,
        contentKey: `${prefix}-2.0`,
      },
      {
        number: '3.0',
        title: 'Future Versions',
        slug: '3-0-future-versions',
        sortOrder: 6,
        parentId: null as string | null,
        contentKey: `${prefix}-3.0`,
      },
      {
        number: '3.1',
        title: 'Future Versions',
        slug: '3-1-future-versions',
        sortOrder: 7,
        parentId: null as string | null,
        contentKey: `${prefix}-2.0`,
      },
      {
        number: '3.2',
        title: 'Future Versions',
        slug: '3-2-future-versions',
        sortOrder: 10,
        parentId: null as string | null,
        contentKey: `${prefix}-2.0`,
      },
    ];

    // Create top-level sections first, then add children
    const createdSections: Record<string, string> = {};

    for (const sectionData of sectionsToCreate) {
      const content =
        sectionContents[sectionData.contentKey] ||
        sectionContents[`${prefix}-2.0`] ||
        tiptapDoc(paragraph('Content coming soon.'));

      const section = await prisma.section.create({
        data: {
          versionId: certified.id,
          number: sectionData.number,
          title: sectionData.title,
          slug: sectionData.slug,
          content: content as object,
          sortOrder: sectionData.sortOrder,
          parentId: sectionData.parentId,
        },
      });

      createdSections[sectionData.number] = section.id;
    }

    // Create child sections (2.1.1, 2.1.2, 3.1.1, 3.1.2)
    const childSections = [
      {
        number: '2.1.1',
        title: 'Future Versions',
        slug: '2-1-1-future-versions',
        sortOrder: 3,
        parentNumber: '2.1',
      },
      {
        number: '2.1.2',
        title: 'Future Versions',
        slug: '2-1-2-future-versions',
        sortOrder: 4,
        parentNumber: '2.1',
      },
      {
        number: '3.1.1',
        title: 'Future Versions',
        slug: '3-1-1-future-versions',
        sortOrder: 8,
        parentNumber: '3.1',
      },
      {
        number: '3.1.2',
        title: 'Future Versions',
        slug: '3-1-2-future-versions',
        sortOrder: 9,
        parentNumber: '3.1',
      },
    ];

    for (const child of childSections) {
      const content =
        sectionContents[`${prefix}-2.0`] || tiptapDoc(paragraph('Content coming soon.'));

      await prisma.section.create({
        data: {
          versionId: certified.id,
          number: child.number,
          title: child.title,
          slug: child.slug,
          content: content as object,
          sortOrder: child.sortOrder,
          parentId: createdSections[child.parentNumber] || null,
        },
      });
    }

    // Also create sections for the public consultation version
    const introContent =
      sectionContents[`${prefix}-1.0`] || tiptapDoc(paragraph('Content under consultation.'));

    try {
      await prisma.section.create({
        data: {
          versionId: publicConsultation.id,
          number: '1.0',
          title: 'Introduction',
          slug: '1-0-introduction',
          content: introContent as object,
          sortOrder: 0,
        },
      });
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        console.log(`Skipping existing record`);
      } else {
        throw error;
      }
    }

    console.log(`  📄 Sections created for ${standard.title}`);
  }

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📧 Admin login credentials:');
  console.log(`   Email: ${process.env.SEED_ADMIN_EMAIL || 'admin@renewcred.com'}`);
  console.log(`   Password: ${process.env.SEED_ADMIN_PASSWORD || 'Admin@123'}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
