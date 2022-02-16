import css from '@/styles/Logo.module.css'
import { Link } from 'wouter'

function Logo() {
  return (
    <Link className={css.base} to='/'>
      FaunaDex
    </Link>
  )
}

export default Logo
