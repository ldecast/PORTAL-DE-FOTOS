import { Link } from 'wouter'

import Logo from '@/components/Logo'
import css from '@/styles/Navbar.module.css'

const links = [
  {
    name: 'Home',
    to: '/'
  }
]

function Navbar() {
  return (
    <div className={css.base}>
      <Logo />
      {links.map(({ name, ...link }) => (
        <Link key={name} {...link}>
          {name}
        </Link>
      ))}
    </div>
  )
}

export default Navbar
