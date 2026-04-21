import { describe, it, expect, vi } from 'vitest'
import prisma from '@/lib/prisma'
import { getNextInvoiceNumber } from '@/lib/invoice'

describe('getNextInvoiceNumber', () => {
  it('formats DSL-YYYY-XXXX correctly', async () => {
    ;(prisma.$queryRaw as any).mockResolvedValue([{ value: '42' }])
    const result = await getNextInvoiceNumber()
    expect(result).toMatch(/^DSL-\d{4}-0042$/)
  })

  it('falls back to timestamp on DB failure', async () => {
    ;(prisma.$queryRaw as any).mockRejectedValue(new Error('DB down'))
    const result = await getNextInvoiceNumber()
    expect(result).toMatch(/^DSL-\d{4}-\d+$/)
  })
})