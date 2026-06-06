export const metadata = {
  title: 'Platform Preview — District 1921',
  description: 'See what District 1921 looks like — search, map, business profiles, and Gold Shield verification.',
}

export default function PreviewPage() {
  return (
    <iframe
      src="/platform-preview.html"
      style={{ width: '100%', height: '100vh', border: 'none', display: 'block' }}
      title="District 1921 Platform Preview"
    />
  )
}
