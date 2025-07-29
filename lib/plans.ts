interface Plan {
  id: number;
  popular: boolean;
  type: string;
  price: number;
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
    price: 150,
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
    price: 128.51,
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
