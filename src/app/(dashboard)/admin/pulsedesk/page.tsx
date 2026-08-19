import { getComplaints } from '@/actions/complaintStore'
import ClientPage from './ClientPage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PulseDeskPage() {
  const complaints = await getComplaints()
  
  return (
    <ClientPage initialComplaints={complaints} />
  )
}
