/**
 * Serviços oferecidos pela profissional, usados como catálogo padrão no site
 * público quando nenhum serviço foi cadastrado no painel e como sugestões de
 * criação rápida no painel administrativo. Sem preços ou descrições inventados
 * — apenas os nomes dos serviços e os valores informados pela profissional,
 * que pode editar tudo livremente no painel.
 */
export type DefaultService = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  image: string;
};

export const DEFAULT_SERVICES: DefaultService[] = [
  { id: 'default-fibra', name: 'Alongamento com fibra de vidro', description: 'Manutenção: R$ 100,00', price: 150, image: '' },
  { id: 'default-gel', name: 'Banho de gel', description: 'Manutenção: R$ 100,00', price: 100, image: '' },
  { id: 'default-esmaltacao', name: 'Esmaltação em gel nos pés e mãos', description: '', price: 75, image: '' },
];
