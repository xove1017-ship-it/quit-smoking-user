// src/utils/apiKey.ts
import type { InjectionKey } from 'vue'
import type api from '@/utils/api'

export const apiKey: InjectionKey<typeof api> = Symbol('api')
