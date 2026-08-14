import { useParams } from 'react-router-dom'
import { PlaceholderPage } from '../components/PlaceholderPage'

export function VerifyPage() {
  const { certificateId } = useParams()
  return <PlaceholderPage eyebrow="Certificate verification" title="Verify a certificate" description="Public certificate validation will appear here. The unique certificate reference is shown below."><div className="mt-8 rounded-xl bg-brand-light p-4 text-sm font-semibold text-brand">Certificate ID: {certificateId ?? 'Not provided'}</div></PlaceholderPage>
}
