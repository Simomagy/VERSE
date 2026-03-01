import { useState, useEffect, useRef } from 'react'
import { useEquipmentImage } from '../../hooks/useEquipmentImage'
import type { EquipmentCategory } from '../../api/types'
import logo from '../../assets/logo.png'

interface EquipmentImageProps {
  itemName: string
  category: EquipmentCategory
  size?: number
  className?: string
  /** Se true, non aspetta IntersectionObserver — usato nel dialog dove è sempre visibile */
  eager?: boolean
}

function Placeholder({ size, className }: { size: number; className: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-hud-blue/5 border border-hud-border shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={logo}
        alt="placeholder"
        className="opacity-20 object-contain"
        style={{ width: size * 0.6, height: size * 0.6 }}
      />
    </div>
  )
}

function ImageContent({
  itemName,
  size,
  className,
  enabled
}: {
  itemName: string
  size: number
  className: string
  enabled: boolean
}) {
  const { data: imageUrl, isLoading } = useEquipmentImage(itemName, enabled)
  const [imgError, setImgError] = useState(false)

  if (!enabled || isLoading || !imageUrl || imgError) {
    return <Placeholder size={size} className={className} />
  }

  return (
    <div
      className={`overflow-hidden border border-hud-border shrink-0 bg-black/40 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={imageUrl}
        alt={itemName}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  )
}

export function EquipmentImage({
  itemName,
  size = 120,
  className = '',
  eager = false
}: EquipmentImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(eager)

  useEffect(() => {
    if (eager) return

    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [eager])

  return (
    <div ref={containerRef} style={{ width: size, height: size }} className="shrink-0">
      <ImageContent
        itemName={itemName}
        size={size}
        className={className}
        enabled={isVisible}
      />
    </div>
  )
}
