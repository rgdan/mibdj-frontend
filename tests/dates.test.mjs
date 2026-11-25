import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isValidDate } from '../src/shared/dates.ts'

test('dates must exist in the calendar', () => {
  for (const value of ['2024-02-29', '2026-11-25', '2000-01-01']) {
    assert.equal(isValidDate(value), true, value)
  }
  for (const value of ['', '2026-02-29', '2026-04-31', '2026-13-01', '2026-00-01', '0000-01-01', '2026-1-1', 'texto']) {
    assert.equal(isValidDate(value), false, value)
  }
})
