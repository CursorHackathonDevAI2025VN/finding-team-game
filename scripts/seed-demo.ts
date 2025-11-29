import axios from 'axios'

const API_URL = process.env.API_URL || 'http://localhost:3001/api'

interface DemoAccount {
  name: string
  email: string
  password: string
  role: 'leader' | 'member'
  position: 'frontend' | 'backend' | 'design' | 'business'
  skills: string[]
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: 'Demo Leader',
    email: 'leader@demo.com',
    password: 'demo123',
    role: 'leader',
    position: 'business',
    skills: ['Leadership', 'Project Management', 'Agile']
  },
  {
    name: 'Alice Frontend',
    email: 'alice@demo.com',
    password: 'demo123',
    role: 'member',
    position: 'frontend',
    skills: ['React', 'TypeScript', 'Tailwind', 'Redux']
  },
  {
    name: 'Bob Backend',
    email: 'bob@demo.com',
    password: 'demo123',
    role: 'member',
    position: 'backend',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'GraphQL']
  },
  {
    name: 'Carol Designer',
    email: 'carol@demo.com',
    password: 'demo123',
    role: 'member',
    position: 'design',
    skills: ['UI/UX', 'Figma', 'Sketch']
  }
]

async function seedDemoAccounts() {
  console.log('🌱 Seeding demo accounts...\n')

  for (const account of DEMO_ACCOUNTS) {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, account)
      if (response.data.success) {
        console.log(`✅ Created: ${account.name} (${account.email}) - ${account.role}`)
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.error?.includes('already exists')) {
        console.log(`⏭️  Skipped: ${account.name} (${account.email}) - already exists`)
      } else {
        const message = axios.isAxiosError(error) 
          ? error.response?.data?.error || error.message 
          : 'Unknown error'
        console.log(`❌ Failed: ${account.name} - ${message}`)
      }
    }
  }

  console.log('\n✨ Demo accounts seeding complete!')
  console.log('\nTest credentials:')
  console.log('  Email: leader@demo.com | Password: demo123 (Leader)')
  console.log('  Email: alice@demo.com  | Password: demo123 (Frontend Member)')
  console.log('  Email: bob@demo.com    | Password: demo123 (Backend Member)')
  console.log('  Email: carol@demo.com  | Password: demo123 (Design Member)')
}

seedDemoAccounts().catch(console.error)

