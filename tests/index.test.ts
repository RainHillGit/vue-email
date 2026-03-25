import { describe, it, expect } from 'vitest'
import { Html, Head, Body, Container, Text, Heading } from '../src'

describe('vue-email', () => {
  it('should export components', () => {
    expect(Html).toBeDefined()
    expect(Head).toBeDefined()
    expect(Body).toBeDefined()
    expect(Container).toBeDefined()
    expect(Text).toBeDefined()
    expect(Heading).toBeDefined()
  })
})
