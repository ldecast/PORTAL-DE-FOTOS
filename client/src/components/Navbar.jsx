import { Container, Grid, Text } from '@nextui-org/react'
import { Link } from 'wouter'

import Logo from '@/components/Logo'
import css from '@/styles/Navbar.module.css'

const links = [
  {
    name: 'Editar perfil',
    to: '/profile'
  },
  {
    name: 'Subir foto',
    to: '/upload'
  },
  {
    name: 'Fotos',
    to: '/photos'
  },
  {
    name: 'Extraer texto',
    to: '/extract'
  },
  {
    name: 'Chat',
    to: '/chat'
  }
]

function Navbar() {
  return (
    <Grid className={css.base}>
      <Logo />
      <Container className={css.items}>
        {links.map(({ name, ...link }) => (
          <Text h6 key={name}>
            <Link {...link}>{name}</Link>
          </Text>
        ))}
      </Container>
    </Grid>
  )
}

export default Navbar
