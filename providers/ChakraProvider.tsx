'use client'

import {
  ChakraProvider as _ChakraProvider,
  createSystem,
  defaultConfig,
  SystemConfig
} from '@chakra-ui/react'
import { ColorModeProvider } from '../components/color-mode'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'

export interface ChakraProviderProps extends React.PropsWithChildren {
  nonce?: string
  systemConfig: SystemConfig
  useColorMode?: boolean
}

export function ChakraProvider({
  systemConfig,
  useColorMode = true,
  nonce,
  children
}: ChakraProviderProps): JSX.Element {
  const system = createSystem(defaultConfig, systemConfig)
  const cache = createCache({ nonce, key: 'custom' })
  return (
    <CacheProvider value={cache}>
      <_ChakraProvider value={system}>
        {useColorMode ? (
          <ColorModeProvider nonce={nonce}>{children}</ColorModeProvider>
        ) : (
          children
        )}
      </_ChakraProvider>
    </CacheProvider>
  )
}
