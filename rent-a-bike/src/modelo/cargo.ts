export const Cargo = {
  GERENTE: 'GERENTE',
  ATENDENTE: 'ATENDENTE',
  MECANICO: 'MECANICO'
} as const;

export type Cargo = typeof Cargo[keyof typeof Cargo];