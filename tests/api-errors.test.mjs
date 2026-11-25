import assert from 'node:assert/strict'
import { test } from 'node:test'
import { errorMessage, userErrorMessage } from '../src/api/errors.ts'

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

test('user errors preserve backend messages and hide network errors', () => {
  assert.equal(userErrorMessage(new Error('Este juego ya existe.')), 'Este juego ya existe.')
  for (const error of [new TypeError('Failed to fetch'), new Error(' '), null, 'error']) {
    assert.equal(userErrorMessage(error), 'No pudimos conectar con el servidor. Intentá de nuevo.')
  }
  assert.equal(userErrorMessage(new TypeError('Failed to fetch'), 'Tus datos siguen en el formulario.'), 'Tus datos siguen en el formulario.')
})
