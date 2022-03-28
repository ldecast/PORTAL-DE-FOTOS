import { Grid, Text } from '@nextui-org/react'
import Chatbot from 'react-chatbot-kit'
import 'react-chatbot-kit/build/main.css'

import { MessageParser, ActionProvider, config } from '@/chatbot'

function ChatPage() {
  return (
    <Grid.Container gap={3} style={{ height: '100%' }}>
      <Grid xs={12}>
        <Text h1>Chatbot</Text>
      </Grid>
      <Grid xs={12} style={{ marginTop: 20 }}>
        <Chatbot
          messageParser={MessageParser}
          actionProvider={ActionProvider}
          config={config}
        />
      </Grid>
    </Grid.Container>
  )
}

export default ChatPage
