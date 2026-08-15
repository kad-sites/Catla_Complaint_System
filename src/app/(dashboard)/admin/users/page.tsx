import { getComplaints } from '@/actions/complaintStore'
import { getUsers } from '@/actions/userStore'
import StaffManagement from './StaffManagement'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const [complaints, users] = await Promise.all([
    getComplaints(),
    getUsers()
  ])

  return (
    <StaffManagement initialStaffRaw={users} initialComplaints={complaints} />
  )
}
