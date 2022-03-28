import { chatbotService } from '@/services/variousServices'
import { createChatBotMessage } from 'react-chatbot-kit'

export class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider
    this.state = state
  }

  parse(message) {
    const lowerCaseMessage = message.toLowerCase()

    if (lowerCaseMessage.includes('hola')) {
      this.actionProvider.greet()
    } else {
      this.actionProvider.communicate(message)
    }
  }
}

export class ActionProvider {
  constructor(
    createChatBotMessage,
    setStateFunc,
    createClientMessage,
    stateRef,
    createCustomMessage
  ) {
    this.createChatBotMessage = createChatBotMessage
    this.setState = setStateFunc
    this.createClientMessage = createClientMessage
    this.stateRef = stateRef
    this.createCustomMessage = createCustomMessage
  }

  updateChatbotState(message) {
    this.setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, message]
    }))
  }

  greet() {
    const greetingMessage = this.createChatBotMessage('¡Hola!')
    this.updateChatbotState(greetingMessage)
  }

  communicate(message) {
    chatbotService(message).then((response) => {
      const responseMessage = this.createChatBotMessage(response)
      console.log(
        '🚀 ~ file: chatbot.js ~ line 53 ~ ActionProvider ~ chatbotService ~ responseMessage',
        responseMessage
      )
      this.updateChatbotState(responseMessage)
    })
  }
}

export const config = {
  botName: 'Amazon Chatbot',
  initialMessages: [createChatBotMessage(`¡Hola!`)]
}
