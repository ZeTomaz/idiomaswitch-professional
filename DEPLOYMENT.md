# Guia de Deployment no GitHub Pages

Este guia detalha como hospedar o IdiomaSwitch Professional gratuitamente no GitHub Pages.

## 📋 Pré-requisitos

- Conta GitHub (gratuita)
- Git instalado localmente
- Chave de API Gemini ([obter aqui](https://aistudio.google.com/app/apikey))

## 🚀 Passo 1: Criar Repositório no GitHub

1. Aceda a [github.com](https://github.com) e faça login
2. Clique em **"New repository"** (botão verde)
3. Configure o repositório:
   - **Repository name**: `idiomaswitch-professional`
   - **Visibility**: Public (obrigatório para GitHub Pages gratuito)
   - **NÃO** inicialize com README (já existe localmente)
4. Clique em **"Create repository"**

## 📤 Passo 2: Fazer Push do Código

Abra o terminal na pasta do projeto e execute:

```bash
# Inicializar repositório Git (se ainda não estiver inicializado)
git init

# Adicionar todos os ficheiros
git add .

# Criar commit inicial
git commit -m "Initial commit: IdiomaSwitch Professional"

# Adicionar remote do GitHub (substitua SEU-USUARIO pelo seu username)
git remote add origin https://github.com/SEU-USUARIO/idiomaswitch-professional.git

# Fazer push para GitHub
git branch -M main
git push -u origin main
```

## 🔑 Passo 3: Configurar GitHub Secret (API Key)

> **⚠️ IMPORTANTE**: Nunca faça commit da sua API key no código!

1. No GitHub, vá ao seu repositório
2. Clique em **Settings** (tab superior)
3. No menu lateral esquerdo, clique em **Secrets and variables** → **Actions**
4. Clique em **"New repository secret"**
5. Configure:
   - **Name**: `GEMINI_API_KEY`
   - **Secret**: Cole a sua chave de API Gemini
6. Clique em **"Add secret"**

## 📄 Passo 4: Ativar GitHub Pages

1. Ainda em **Settings**, no menu lateral clique em **Pages**
2. Em **"Source"**, selecione:
   - **Source**: GitHub Actions
3. Guarde as alterações

## 🎯 Passo 5: Verificar Deployment

1. Vá à tab **Actions** no repositório
2. Deverá ver um workflow **"Deploy to GitHub Pages"** a executar
3. Aguarde até ficar verde (✓)
4. Volte a **Settings** → **Pages**
5. Verá o URL do site: `https://SEU-USUARIO.github.io/idiomaswitch-professional/`

## ✅ Passo 6: Testar a Aplicação

1. Aceda ao URL do GitHub Pages
2. Teste as funcionalidades principais:
   - Inserir texto
   - Selecionar operações
   - Processar com a API Gemini
3. Verifique a consola do navegador (F12) para erros

## 🔄 Atualizações Futuras

Sempre que fizer alterações ao código:

```bash
# Adicionar alterações
git add .

# Criar commit
git commit -m "Descrição das alterações"

# Fazer push
git push
```

O GitHub Actions fará automaticamente o build e deploy!

## 🛠️ Deploy Manual Alternativo

Se preferir fazer deploy manualmente via CLI:

```bash
# Instalar dependências (se ainda não instalou)
npm install

# Deploy direto
npm run deploy
```

Este comando faz build e push para o branch `gh-pages`.

## ⚠️ Limitações e Avisos

### Segurança da API Key

- **GitHub Pages serve apenas conteúdo estático**
- A API key ficará **visível no código JavaScript compilado**
- Qualquer pessoa pode inspecionar e extrair a chave
- **Solução recomendada**: Implementar backend intermediário (Firebase Functions, Vercel, etc.)

### Quotas da API Gemini

- Tier gratuito tem limites de requisições
- Monitorize o uso em [Google AI Studio](https://aistudio.google.com/)
- Considere implementar rate limiting

### Base Path

O `vite.config.ts` está configurado com:

```typescript
base: '/idiomaswitch-professional/'
```

Se alterar o nome do repositório, **deve atualizar esta linha** com o novo nome.

## 🐛 Troubleshooting

### Workflow falha no build

- Verifique se o secret `GEMINI_API_KEY` está configurado
- Veja os logs detalhados na tab **Actions**

### Site não carrega (404)

- Confirme que GitHub Pages está ativado
- Verifique se o workflow completou com sucesso
- Aguarde 2-3 minutos após o primeiro deploy

### API não funciona

- Abra a consola do navegador (F12)
- Verifique se há erros de API key inválida
- Confirme que a chave está correta no GitHub Secrets

### Recursos não carregam (CSS/JS)

- Verifique o `base` path no `vite.config.ts`
- Deve corresponder ao nome do repositório

## 📞 Suporte

Para problemas com:

- **GitHub Pages**: [Documentação oficial](https://docs.github.com/pages)
- **Gemini API**: [Google AI Studio](https://aistudio.google.com/)
- **Vite**: [Documentação Vite](https://vitejs.dev/)

---

**Boa sorte com o deployment! 🚀**
