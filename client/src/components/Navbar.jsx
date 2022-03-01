import css from '@/styles/Navbar.module.css'

import { Link } from 'wouter'
import { Container, Grid, Text } from '@nextui-org/react'

import Logo from '@/components/Logo'

const links = [
  {
    name: 'Home',
    to: '/'
  }
]

function Navbar() {
  return (
    <Grid className={css.base}>
      <Logo />
      <Container className={css.items}>
        {links.map(({ name, ...link }) => (
          <Text h6 key={name}>
            <Link {...link}>
              {name}
            </Link>
          </Text>
        ))}
      </Container>
    </Grid>
  )
}

export default Navbar
