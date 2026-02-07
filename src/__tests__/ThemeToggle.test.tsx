import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThemeToggle from '../components/ThemeToggle'
import { useThemeStore } from '../store/themeStore'

describe('ThemeToggle', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'light' })
  })

  it('should render Moon icon in light mode', () => {
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /switch to dark mode/i })
    expect(button).toBeInTheDocument()
  })

  it('should render Sun icon in dark mode', () => {
    useThemeStore.setState({ theme: 'dark' })
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /switch to light mode/i })
    expect(button).toBeInTheDocument()
  })

  it('should toggle theme when clicked', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(useThemeStore.getState().theme).toBe('dark')
  })

  it('should have minimum touch target size', () => {
    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    expect(button.className).toContain('h-11')
    expect(button.className).toContain('w-11')
  })
})
