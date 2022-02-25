import { Text } from '@nextui-org/react'
import { Link } from 'wouter'

function Logo() {
  return (
    <Text h3>
      <Link to='/'>
        FaunaDex
      </Link>
    </Text>
  )
}

export default Logo
