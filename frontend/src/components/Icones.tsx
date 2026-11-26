// Ícones em SVG, no estilo de traço (como os do Lucide), desenhados aqui
// para não depender de biblioteca. Usam currentColor: herdam a cor do texto.
import type { SVGProps } from 'react'

type IconeProps = SVGProps<SVGSVGElement> & { tamanho?: number }

function Icone({ tamanho = 16, children, ...props }: IconeProps) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function IconeMais(props: IconeProps) {
  return (
    <Icone {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icone>
  )
}

export function IconeSetaEsquerda(props: IconeProps) {
  return (
    <Icone {...props}>
      <path d="m15 18-6-6 6-6" />
    </Icone>
  )
}

export function IconeSetaDireita(props: IconeProps) {
  return (
    <Icone {...props}>
      <path d="m9 18 6-6-6-6" />
    </Icone>
  )
}

export function IconeCalendario(props: IconeProps) {
  return (
    <Icone {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </Icone>
  )
}

export function IconeCheck(props: IconeProps) {
  return (
    <Icone {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Icone>
  )
}

export function IconeLapis(props: IconeProps) {
  return (
    <Icone {...props}>
      <path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </Icone>
  )
}

export function IconeLixeira(props: IconeProps) {
  return (
    <Icone {...props}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </Icone>
  )
}

export function IconeSair(props: IconeProps) {
  return (
    <Icone {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </Icone>
  )
}
