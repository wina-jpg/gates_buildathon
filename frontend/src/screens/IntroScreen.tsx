import { INTRO_MESSAGE } from '../constants/introMessage'

export function IntroScreen() {
  return (
    <div className="screen intro-screen">
      <h1 className="intro-title">JobShock</h1>
      <p className="intro-opener">{INTRO_MESSAGE.opener}</p>
      <ul className="intro-bullets">
        {INTRO_MESSAGE.bullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="intro-question">{INTRO_MESSAGE.closingQuestion}</p>
    </div>
  )
}
