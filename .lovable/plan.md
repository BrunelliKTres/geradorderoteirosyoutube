## Problema

A versão publicada em `brunelliktres.github.io/geradorderoteirosyoutube/` fica travada na tela "Carregando..." porque o app não consegue se conectar ao backend (Lovable Cloud) e o estado de autenticação nunca termina de carregar.

## Causa

O workflow `.github/workflows/deploy.yml` usado pelo GitHub Pages está com credenciais **antigas**, apontando para um projeto de backend que não existe mais neste remix:

- Workflow atual: `wkvsohitzooukthyoxnk.supabase.co` (antigo)
- Backend real do projeto (`.env`): `gjoqandfsliaaerdyjpd.supabase.co` (correto)

Como o build do GitHub Pages injeta as variáveis erradas, o cliente tenta chamar um projeto que não responde, `supabase.auth.getSession()` nunca resolve, e o `ProtectedRoute` fica eternamente em loading → "Carregando...".

A versão de preview do Lovable funciona porque usa o `.env` correto.

## O que fazer

Atualizar o passo **Build** de `.github/workflows/deploy.yml` para usar as credenciais corretas do backend atual:

- `VITE_SUPABASE_URL` → `https://gjoqandfsliaaerdyjpd.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` → chave publishable atual do `.env`
- `VITE_SUPABASE_PROJECT_ID` → `gjoqandfsliaaerdyjpd`

Nenhuma outra alteração de código é necessária.

## Como verificar depois

1. Após o commit, o GitHub Actions vai rodar o workflow `Deploy to GitHub Pages` automaticamente.
2. Quando ele terminar (verde), recarregar `brunelliktres.github.io/geradorderoteirosyoutube/` com cache limpo (Ctrl+Shift+R).
3. A tela de login (`/#/auth`) deve aparecer normalmente em vez de "Carregando...".

## Observação

Sempre que o backend do Lovable Cloud for trocado/recriado, esse mesmo workflow precisa ser atualizado — ou migrado para usar GitHub Secrets em vez de valores fixos. Posso fazer essa migração depois, se quiser.
