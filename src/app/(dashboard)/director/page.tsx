import { getComplaints } from '@/actions/complaintStore'
import { getUsers } from '@/actions/userStore'
import ClientPage from './ClientPage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DirectorDashboardPage() {
  const [complaints, users] = await Promise.all([
    getComplaints(),
    getUsers()
  ])
  
  const technicians = users.filter((u: any) => u.role === 'TECHNICIAN' && u.active !== false)

  return (
    <ClientPage 
      initialComplaints={complaints} 
      initialTechnicians={technicians} 
    />
  )
}
