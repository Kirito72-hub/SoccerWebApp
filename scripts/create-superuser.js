const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function generateSuperuserSQL() {
    console.log('\n🚀 Rakla Football Manager - Superuser Setup\n');
    console.log('This script will generate SQL to create your initial Superuser.\n');

    const email = await question('Enter your email: ');
    const password = await question('Enter your password: ');
    const username = await question('Enter your username (nickname): ');
    const firstName = await question('Enter your first name: ');
    const lastName = await question('Enter your last name: ');
    const dateOfBirth = await question('Enter your date of birth (YYYY-MM-DD): ');

    console.log('\n⏳ Hashing password...\n');
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
-- Insert your Superuser account
INSERT INTO users (email, password, username, first_name, last_name, date_of_birth, role, avatar)
VALUES (
  '${email}',
  '${hashedPassword}',
  '${username}',
  '${firstName}',
  '${lastName}',
  '${dateOfBirth}',
  'superuser',
  'https://picsum.photos/seed/${username}/200'
);
`;

    console.log('✅ SQL Generated! Copy and paste this into Supabase SQL Editor:\n');
    console.log('═'.repeat(80));
    console.log(sql);
    console.log('═'.repeat(80));
    console.log('\n📝 Instructions:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Paste the SQL above');
    console.log('4. Click "Run"');
    console.log('5. Your Superuser account will be created!\n');

    rl.close();
}

generateSuperuserSQL().catch(console.error);
