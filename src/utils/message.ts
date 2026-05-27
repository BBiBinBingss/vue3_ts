import { useMessage } from 'naive-ui'

type MessageApiInjection = ReturnType<typeof useMessage>

let messageApi: MessageApiInjection | null = null

export const setMessageApi = (api: MessageApiInjection | null): void => {
  messageApi = api
}

export const getMessageApi = (): MessageApiInjection | null => {
  return messageApi
}

export const notifyError = (message: string): void => {
  const api = getMessageApi()
  if (api) {
    api.error(message)
    return
  }

  console.error(message)
}
