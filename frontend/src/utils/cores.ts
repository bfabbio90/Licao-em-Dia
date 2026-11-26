// Uma cor para cada matéria, escolhida pelo Id
const CORES = ['#219EBC', '#FB8500', '#E63946', '#2A9D8F', '#8338EC', '#FFB703']

export function corDaMateria(materiaId: number): string {
  return CORES[materiaId % CORES.length]
}
