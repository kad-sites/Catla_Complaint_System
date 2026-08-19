import { getComplaints } from '@/actions/complaintStore'
import { getUsers } from '@/actions/userStore'
import ClientPage from './ClientPage'

export const dynamic = 'force-dynamic' // Ensure it's never statically cached

export default async function Page() {
  const [storedComplaints, users] = await Promise.all([
    getComplaints(),
    getUsers()
  ])
  
  const technicians = users.filter((u: any) => u.role === 'TECHNICIAN' && u.active)
  
  return (
    <ClientPage 
      initialComplaints={storedComplaints} 
      initialTechnicians={technicians} 
    />
  )
}
