interface Plan {
  id: number;
  popular: boolean;
  type: string;
  price: number;
  pricePrevious: number;
  features: string[];
}

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
};

export const plans: Plan[] = [
  {
    id: 1,
    popular: false,
    type: "Mensal",
    price: 58.19,
    pricePrevious: 116.58,
    features: [
      "Suporte técnico incluso",
      "Interface intuitiva e fácil de usar",
      "Gestão completa de agendamentos",
      "Controle de clientes e serviços",
      "Relatórios mensais",
      "App web responsivo para clientes",
      "Notificações por WhatsApp (opcional)",
    ],
  },
  {
    id: 2,
    popular: true,
    type: "Anual",
    price: 48.19,
    pricePrevious: 96.58,
    features: [
      "Suporte técnico incluso",
      "Interface intuitiva e fácil de usar",
      "Gestão completa de agendamentos",
      "Controle de clientes e serviços",
      "Relatórios mensais",
      "App web responsivo para clientes",
      "Notificações por WhatsApp (opcional)",
    ],
  },
];
