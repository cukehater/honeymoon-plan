import { describe, expect, it } from 'vitest'

import { toBullets } from './to-bullets'

describe('toBullets', () => {
  it('줄마다 항목 하나, 앞뒤 공백과 빈 줄은 버린다', () => {
    expect(toBullets(' 도보 7분 \n\n착장: 코트\n')).toEqual(['도보 7분', '착장: 코트'])
  })

  it('줄바꿈 없는 문단은 항목 하나', () => {
    expect(toBullets('한 문단. 두 문장.')).toEqual(['한 문단. 두 문장.'])
  })
})
