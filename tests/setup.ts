import { vi } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import type { PrismaClient } from '@prisma/client'

vi.mock('@/lib/prisma', () => ({
  default: mockDeep<PrismaClient>(),
}))

import prisma from '@/lib/prisma'

beforeEach(() => {
  mockReset(prisma as any)
})