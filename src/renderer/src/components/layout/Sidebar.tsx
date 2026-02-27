import React from 'react'
import { NavLink } from 'react-router-dom'
import { Ship, History, FlaskConical, Wallet, Settings } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import logo from '@renderer/assets/logo.png'

interface NavItemConfig {
  to: string
  icon: React.ElementType
  label: string
  accent: string
  iconActive: string
  bg: string
}

const navItems: NavItemConfig[] = [
  {
    to: '/fleet',
    icon: Ship,
    label: 'FLEET',
    accent: '#4080ff',
    iconActive: 'text-hud-blue',
    bg: 'hover:bg-hud-blue/5'
  },
  {
    to: '/trades',
    icon: History,
    label: 'TRADES',
    accent: '#e8a020',
    iconActive: 'text-hud-amber',
    bg: 'hover:bg-hud-amber/5'
  },
  {
    to: '/refinery',
    icon: FlaskConical,
    label: 'REFINERY',
    accent: '#a060ff',
    iconActive: 'text-hud-purple',
    bg: 'hover:bg-hud-purple/5'
  },
  {
    to: '/wallet',
    icon: Wallet,
    label: 'WALLET',
    accent: '#00e87a',
    iconActive: 'text-hud-green',
    bg: 'hover:bg-hud-green/5'
  }
]

const settingsItem: NavItemConfig = {
  to: '/settings',
  icon: Settings,
  label: 'CONFIG',
  accent: '#a060ff',
  iconActive: 'text-hud-purple',
  bg: 'hover:bg-hud-purple/5'
}

function NavItem({ to, icon: Icon, label, accent, iconActive, bg }: NavItemConfig) {
  return (
    <NavLink
      to={to}
      title={label}
      className={({ isActive }) =>
        cn(
          'group relative flex h-12 w-full items-center justify-center transition-all duration-150',
          isActive ? `${bg} bg-opacity-100` : `text-hud-muted ${bg} hover:text-hud-text`
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Indicatore sinistra colorato per sezione */}
          {isActive && (
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6"
              style={{
                background: accent,
                boxShadow: `0 0 8px ${accent}, 0 0 16px ${accent}60`
              }}
            />
          )}

          {/* Icona */}
          <Icon
            className={cn(
              'h-5 w-5 transition-all duration-150',
              isActive ? `${iconActive} drop-shadow-[0_0_6px_currentColor]` : ''
            )}
            style={isActive ? { color: accent } : undefined}
          />

          {/* Tooltip */}
          <span
            className="
            pointer-events-none absolute left-full ml-3 z-50
            px-2 py-1 bg-hud-panel border border-hud-border
            hud-label text-hud-text whitespace-nowrap
            opacity-0 group-hover:opacity-100
            transition-opacity duration-100
          "
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <aside className="relative flex w-14 flex-col bg-hud-panel border-r border-hud-border shrink-0">
      {/* Logo VERSE */}
      <div className="flex h-12 items-center justify-center border-b border-hud-border shrink-0">
        <img src={logo} alt="Prysma Studio" className="h-10 w-10" />
      </div>

      {/* Nav principale */}
      <nav className="flex flex-col flex-1 pt-1">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Divisore */}
      <div className="mx-3 h-px bg-hud-border" />

      {/* Settings in fondo */}
      <div className="pb-2 pt-1">
        <NavItem {...settingsItem} />
      </div>
    </aside>
  )
}
