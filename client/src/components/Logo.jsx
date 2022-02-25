import { Text } from '@nextui-org/react'
import { Link } from 'wouter'

function Logo() {
  return (
    <Text h3>
      <Link className={css.base} to='/'>
        FaunaDex
      </Link>
    </Text>
  )
}

export default Logo
