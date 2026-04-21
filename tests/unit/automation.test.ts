import { describe, it, expect, vi } from 'vitest'
import prisma from '@/lib/prisma'
import { processAutomatedReminders } from '@/lib/automation'

describe('processAutomatedReminders', () => {
  it('skips when automation disabled', async () => {
    ;(prisma.systemSetting.findUnique as any).mockResolvedValue({ value: 'false' })
    const result = await processAutomatedReminders()
    expect(result.success).toBe(false)
    expect(result.message).toMatch(/disabled/)
  })

  it('skips when not enough time has passed', async () => {
    const recentDate = new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
    ;(prisma.systemSetting.findUnique as any)
      .mockResolvedValueOnce({ value: 'true' })           // ACTIVE
      .mockResolvedValueOnce({ value: recentDate })        // LAST_RUN
      .mockResolvedValueOnce({ value: 'EVERY_7_DAYS' })   // FREQUENCY
    const result = await processAutomatedReminders()
    expect(result.success).toBe(false)
    expect(result.message).toMatch(/Skipping/)
  })

  it('returns success with 0 sent when no unpaid invoices', async () => {
    ;(prisma.systemSetting.findUnique as any)
      .mockResolvedValueOnce({ value: 'true' })
      .mockResolvedValueOnce(null)                         // no last run
      .mockResolvedValueOnce({ value: 'EVERY_7_DAYS' })
    ;(prisma.invoice.findMany as any).mockResolvedValue([])
    ;(prisma.systemSetting.upsert as any).mockResolvedValue({})
    const result = await processAutomatedReminders()
    expect(result.success).toBe(true)
    expect(result.sentCount).toBe(0)
  })
})