const { PrismaClient } = require('./apps/api/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const problems = await prisma.problem.findMany({ take: 25 });
  console.log(`Loaded ${problems.length} problems for inspection.`);
  for (const p of problems) {
    console.log('\n==============================');
    console.log('ID:', p.id, 'SLUG:', p.slug, 'TITLE:', p.title, 'DIFF:', p.difficulty);
    console.log('TAGS:', p.tags);
    console.log('DESC (first 300 chars):', (p.description || '').slice(0, 300));
    console.log('EXAMPLES:', p.examples);
    console.log('CONSTRAINTS:', p.constraints);
    console.log('STARTER CODE KEYS:', Object.keys(JSON.parse(p.starterCode || '{}')));
  }

  // Check how many have null/empty descriptions or weird chars
  const emptyDesc = await prisma.problem.count({ where: { description: '' } });
  console.log('\nEmpty descriptions count:', emptyDesc);

  // Check some random problems further down the list
  const randomProblems = await prisma.problem.findMany({ skip: 500, take: 5 });
  for (const p of randomProblems) {
    console.log('\n--- SAMPLE AT 500+ ---');
    console.log('SLUG:', p.slug, 'TITLE:', p.title);
    console.log('DESC:', (p.description || '').slice(0, 300));
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
