// Uma cor para cada matéria, escolhida pelo Id.
// Sem vermelho nem verde puros: vermelho é "atrasada" e verde é "feita".
const CORES = ['#2563EB', '#EA580C', '#DB2777', '#0891B2', '#7C3AED', '#CA8A04']

export function corDaMateria(materiaId: number): string {
  return CORES[materiaId % CORES.length]
}
