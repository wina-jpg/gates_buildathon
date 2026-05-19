import { LightningBolt } from './LightningBolt'

export function JobShockLogo() {
  return (
    <header className="app-header" aria-label="JobShock">
      <div className="jobshock-logo">
        <LightningBolt className="jobshock-logo-bolt" />
        <span className="jobshock-logo-text">
          <span className="jobshock-logo-word jobshock-logo-word-job">Job</span>
          <span className="jobshock-logo-word jobshock-logo-word-shock">Shock</span>
        </span>
      </div>
    </header>
  )
}
