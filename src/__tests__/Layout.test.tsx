import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import Layout from '../components/Layout'
import { useThemeStore } from '../store/themeStore'

describe('Layout - Theme Integration', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'light' })
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it('should not have dark class in light mode', () => {
    render(<Layout />)

    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('should apply dark class in dark mode', () => {
    useThemeStore.setState({ theme: 'dark' })
    render(<Layout />)

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('should render theme toggle button', () => {
    const { container } = render(<Layout />)

    const toggle = container.querySelector('button[aria-label*="mode"]')
    expect(toggle).toBeInTheDocument()
  })
})
