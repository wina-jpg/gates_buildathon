import { LightningField } from '../components/LightningField'

export function GeneratingScreen() {
  return (
    <div
      className="generating-screen generating-screen--shock"
      role="status"
      aria-live="polite"
    >
      <LightningField />
      <div className="lightning-flash" aria-hidden />
      <div className="lightning-flash lightning-flash--delayed" aria-hidden />
      <div className="shock-hero">
        <h1 className="shock-brand">JobShock</h1>
        <p className="shock-status">Generating your job description…</p>
      </div>
    </div>
  )
}
