# IdiomaSwitch Professional

**Assistente de IA profissional de nível 5 para governança linguística** em Português Europeu (AO45/AO90) e Inglês (UK/US).

## 🌟 Funcionalidades

- **Conversão entre variantes linguísticas** (PT-EU, PT-AO45, PT-AO90, EN-UK, EN-US)
- **Múltiplas operações**: Reescrita, Correção, Enriquecimento, Simplificação, Expansão
- **Estilos de escrita**: Jornalístico, Académico, Técnico, Criativo, Corporativo
- **Modos de operação**: Profissional, Especialista (com auditoria detalhada)
- **Suporte multimédia**: Texto, URLs, imagens
- **Motor de humanização** com avaliação de traço de IA
- **Enriquecimento com referências** via Google Search

## 🚀 Executar Localmente

### Pré-requisitos

- **Node.js** 20 ou superior
- **Chave de API Gemini** ([obter aqui](https://aistudio.google.com/app/apikey))

### Instalação

1. **Clone o repositório**:

   ```bash
   git clone https://github.com/seu-usuario/idiomaswitch-professional.git
   cd idiomaswitch-professional
   ```

2. **Instale as dependências**:

   ```bash
   npm install
   ```

3. **Configure a API key**:

   ```bash
   # Copie o ficheiro de exemplo
   cp .env.example .env.local
   
   # Edite .env.local e adicione a sua chave
   # GEMINI_API_KEY=sua_chave_aqui
   ```

4. **Execute em modo de desenvolvimento**:

   ```bash
   npm run dev
   ```

5. **Abra o navegador** em `http://localhost:3000`

## 📦 Build para Produção

```bash
# Criar build otimizado
npm run build

# Pré-visualizar build localmente
npm run preview
```

Os ficheiros compilados estarão na pasta `dist/`.

## 🌐 Deploy no GitHub Pages

Consulte o guia detalhado em [DEPLOYMENT.md](./DEPLOYMENT.md) para instruções passo-a-passo.

### Deploy Rápido

```bash
# Deploy manual (após configurar o repositório)
npm run deploy
```

## 🛠️ Tecnologias

- **React 19** - Framework UI
- **TypeScript** - Type safety
- **Vite 6** - Build tool
- **Tailwind CSS** - Styling (via CDN)
- **Google Gemini API** - Motor de IA

## ⚠️ Notas Importantes

- **Português Brasileiro**: Não é suportado (política do projeto)
- **API Key**: Nunca faça commit da sua chave de API
- **GitHub Pages**: A API key ficará visível no código compilado (limitação de sites estáticos)

## 📄 Licença

© 2024 IdiomaSwitch — Professional Language Governance

## 🔗 Links Úteis

- [Documentação Gemini API](https://ai.google.dev/docs)
- [Guia de Deployment](./DEPLOYMENT.md)
- [Vite Documentation](https://vitejs.dev/)
