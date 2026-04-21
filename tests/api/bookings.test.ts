import { GET } from '@/app/api/bookings/cargo/route'
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

it('returns 401 when no auth token', async () => {
  const req = new NextRequest('http://localhost/api/bookings/cargo')
  const res = await GET(req)
  expect(res.status).toBe(401)
})

it('returns paginated bookings for admin', async () => {
  ;(prisma.cargoBooking.findMany as any).mockResolvedValue([])
  ;(prisma.cargoBooking.count as any).mockResolvedValue(0)
  // ... set up auth header with test JWT
})