CREATE TABLE plans(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    popular boolean default false,
    slug TEXT NOT NULL UNIQUE,
    type TEXT,
    price numeric (10,2),
    pricePrevious numeric (10,2),
    features TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)


INSERT INTO public.plans(popular, slug, type, price, pricePrevious, features)
    VALUES
-- Plano Mensal    
(
    false,
    'monthly_plan',
    'Mensal',
    58.19,
    116.58,
    ARRAY[
			'Suporte técnico incluso',
      'Interface intuitiva e fácil de usar',
      'Gestão completa de agendamentos',
      'Controle de clientes e serviços',
      'Relatórios mensais',
      'App web responsivo para clientes',
      'Notificações por WhatsApp (opcional)'
    ]::TEXT[],
),
-- Plano Anual
(
    true,
    'annual_plan',
    'Anual',
    48.19,
    96.58,
    ARRAY[
			'Suporte técnico incluso',
      'Interface intuitiva e fácil de usar',
      'Gestão completa de agendamentos',
      'Controle de clientes e serviços',
      'Relatórios mensais',
      'App web responsivo para clientes',
      'Notificações por WhatsApp (opcional)'
    ]::TEXT[],
)