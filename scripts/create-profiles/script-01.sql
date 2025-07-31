CREATE TABLE profiles(
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    phone TEXT,
    email TEXT,
    indentity TEXT,
    whats_plan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver o próprio perfil" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar o próprio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir o próprio perfil" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);