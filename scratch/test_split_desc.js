const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const problems = await prisma.problem.findMany({
    where: { slug: { in: ['two-sum', 'add-two-numbers', 'palindrome-number', 'reverse-integer'] } }
  });

  for (const p of problems) {
    console.log('\n==============================');
    console.log('PROBLEM:', p.slug);
    const desc = p.description || '';
    const exampleIndex = desc.search(/(?:<p\b[^>]*>\s*)?<strong\b[^>]*>\s*Example\s*1|<p\b[^>]*>\s*Example\s*1|\bExample\s*1\s*:/i);
    console.log('Split index:', exampleIndex);
    if (exampleIndex !== -1) {
      const statement = desc.slice(0, exampleIndex).trim();
      console.log('STATEMENT:\n', statement);
      const followUpMatch = desc.match(/(?:<strong\b[^>]*>)?Follow[- ]?up:?\s*(?:<\/strong>)?([\s\S]*)$/i);
      if (followUpMatch) {
        console.log('FOLLOW-UP:\n', followUpMatch[1].trim());
      }
    } else {
      console.log('No split found!');
    }
  }
}

test().catch(console.error).finally(() => prisma.$disconnect());
