import { expect, test } from 'vitest'
import fixture from './yaml-pipeline.fixture.yml'

// Phase 1 toolchain check. Every scenario template in content/ is loaded this
// way, so if this breaks, Phase 2 has no content pipeline.
test('yaml files import as structured data, not text', () => {
  expect(fixture).toEqual({
    id: 'fixture',
    nested: {
      list: ['one', 'two'],
      number: 7600000,
      flag: true,
    },
  })
})
