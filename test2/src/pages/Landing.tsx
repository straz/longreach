import { Link } from 'react-router-dom'
import styles from './Landing.module.css'

export function Landing() {
  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <p className={styles.intro}>
          Give us one consequential commitment and a handful of facts you already know. We'll make
          one relationship computationally explicit that you didn't realize was there.
        </p>
        <div className={styles.cards}>
          <Link to="/inherited-authority" className={styles.cardLink}>
            <div className={styles.cardEyebrow}>Trick 1</div>
            <div className={styles.cardTitle}>Inherited Authority</div>
            <div className={styles.cardBody}>
              How much future capital is still operating under a decision whose own
              reconsideration condition has been met?
            </div>
          </Link>
          <Link to="/beat-the-calendar" className={styles.cardLink}>
            <div className={styles.cardEyebrow}>Trick 2</div>
            <div className={styles.cardTitle}>Beat the Calendar</div>
            <div className={styles.cardBody}>
              How much ability to change this commitment disappears before the people with
              authority are scheduled to look at it again?
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
