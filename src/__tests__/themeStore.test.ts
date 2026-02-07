import { describe, it, expect, beforeEach } from 'vitest'
import { useThemeStore } from '../store/themeStore'

describe('themeStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useThemeStore.setState({ theme: 'light' })
  })

  it('should initialize with light theme', () => {
    const { theme } = useThemeStore.getState()
    expect(theme).toBe('light')
  })

  it('should toggle theme from light to dark', () => {
    const { toggleTheme } = useThemeStore.getState()

    toggleTheme()

    expect(useThemeStore.getState().theme).toBe('dark')
  })

  it('should toggle theme from dark to light', () => {
    const { setTheme, toggleTheme } = useThemeStore.getState()

    setTheme('dark')
    toggleTheme()

    expect(useThemeStore.getState().theme).toBe('light')
  })

  it('should set theme directly', () => {
    const { setTheme } = useThemeStore.getState()

    setTheme('dark')
    expect(useThemeStore.getState().theme).toBe('dark')

    setTheme('light')
    expect(useThemeStore.getState().theme).toBe('light')
  })

  it('should persist theme to localStorage', () => {
    const { setTheme } = useThemeStore.getState()

    setTheme('dark')

    const stored = localStorage.getItem('theme-storage')
    expect(stored).toBeTruthy()
    expect(stored).toContain('dark')
  })
})
