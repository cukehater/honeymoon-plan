import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// 테스트에서는 서버 전용 모듈도 불러올 수 있게 한다
vi.mock('server-only', () => ({}))

afterEach(cleanup)
