import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema, createUserSchema } from '@/lib/auth'

describe('loginSchema', () => {
  it('accepts valid agent login', () => {
    const r = loginSchema.safeParse({ loginType: 'agent', mobileNumber: '2425551234', password: 'secret123' })
    expect(r.success).toBe(true)
  })
  it('rejects invalid loginType', () => {
    const r = loginSchema.safeParse({ loginType: 'superadmin' })
    expect(r.success).toBe(false)
  })
})

describe('createUserSchema', () => {
  it('accepts valid user', () => {
    const r = createUserSchema.safeParse({
      firstName: 'John', lastName: 'Doe',
      email: 'john@example.com', mobileNumber: '2425551234',
    })
    expect(r.success).toBe(true)
  })
  it('rejects missing name fields', () => {
    const r = createUserSchema.safeParse({ email: 'x@x.com', mobileNumber: '123' })
    expect(r.success).toBe(false)
  })
  it('rejects invalid email', () => {
    const r = createUserSchema.safeParse({ firstName: 'X', email: 'notanemail', mobileNumber: '123' })
    expect(r.success).toBe(false)
  })
  it('rejects mobile with invalid chars', () => {
    const r = createUserSchema.safeParse({ firstName: 'X', email: 'x@x.com', mobileNumber: 'abc123' })
    expect(r.success).toBe(false)
  })
})