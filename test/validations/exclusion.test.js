/* eslint-env jest */
import { exclusion } from 'validations'

describe('exclusion(list)', () => {
  let rule

  beforeEach(() => {
    rule = exclusion([1, 2, 3])
  })

  describe('.name', () => {
    test('is "exclusion"', () => {
      expect(rule.name).toBe('exclusion')
    })
  })

  describe('.rule', () => {
    test('returns true when value isnt included', () => {
      expect(rule.test(4)).toBe(true)
    })

    test('returns false when value is included', () => {
      expect(rule.test(1)).toBe(false)
    })
  })
})
