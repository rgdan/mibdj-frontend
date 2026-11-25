import assert from 'node:assert/strict'
import { test } from 'node:test'
import { errorMessage } from '../src/api/errors.ts'

const fallback = 'No pudimos guardar los datos.'

for (const [name, body, expected] of [
  ['message', { message: '  El juego ya existe.  ' }, 'El juego ya existe.'],
  ['detail', { detail: '  Prioridad inválida.  ' }, 'Prioridad inválida.'],
  ['message takes precedence', { message: 'Mensaje', detail: 'Detalle' }, 'Mensaje'],
  ['Spring validation', { message: 'Validation failed for argument [0]' }, fallback],
  ['empty message', { message: '  ' }, fallback],
  ['missing fields', {}, fallback],
  ['unexpected types', { message: 123, detail: [] }, fallback],
  ['null body', null, fallback],
]) {
  test(name, async () => {
    assert.equal(await errorMessage(Response.json(body), fallback), expected)
  })
}

test('non-JSON response', async () => {
  assert.equal(await errorMessage(new Response('<html>Error</html>'), fallback), fallback)
})
