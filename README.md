# Vision - Módulo Conta Gráfica (Web + SQL Server)

## Requisitos
- **Node.js 18+** — https://nodejs.org (versão LTS)
- **SQL Server** — qualquer versão (2014+)
- **Windows Server** na rede (ou qualquer PC que fique ligado)

---

## Instalação rápida

### 1. Configure o banco de dados
Edite o arquivo `.env` com as informações do seu SQL Server:

```env
DB_SERVER=localhost          # IP ou nome do servidor SQL
DB_DATABASE=VisionContaGrafica
DB_USER=sa
DB_PASSWORD=SuaSenha
DB_PORT=1433
DB_WINDOWS_AUTH=false        # true = autenticação Windows
```

**O sistema cria o banco e as tabelas automaticamente na primeira execução.**

### 2. Inicie o servidor
Dê duplo clique em `INICIAR.bat`

### 3. Acesse pelo navegador
- **Local:** http://localhost:3000
- **Rede:** http://IP_DO_SERVIDOR:3000

Todos os usuários na rede acessam pela URL — **sem instalar nada**.

---

## Estrutura do banco de dados

### Tabela: `empresas`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | INT IDENTITY | Chave primária |
| nome | NVARCHAR(500) | Razão social |
| escritorio | NVARCHAR(100) | Pitágora / Pedro |
| parceiro | NVARCHAR(100) | Pitágora / Pedro |
| certificado | NVARCHAR(10) | Sim / Não |
| etapa_locacao | BIT | Locação de Sala |
| etapa_filial | BIT | Abertura de Filial |
| etapa_reativacao | BIT | Reativação IE |
| etapa_conta_grafica | BIT | Conta Gráfica ativa |
| observacoes | NVARCHAR(MAX) | Notas |
| criado_em | DATETIME | Data de criação |
| atualizado_em | DATETIME | Última atualização |

### Tabela: `lancamentos`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | INT IDENTITY | Chave primária |
| empresa | NVARCHAR(500) | Nome da empresa |
| tipo_movimento | NVARCHAR(100) | Tipo do lançamento |
| data_nf | DATE | Data da NF |
| duimp_processo | NVARCHAR(100) | DUIMP/DI/Processo |
| parceiro | NVARCHAR(100) | Pitágora / Pedro |
| data_exoneracao | DATE | Data exoneração |
| percentual | DECIMAL(10,4) | Percentual |
| valor | DECIMAL(18,2) | Valor bruto |
| valor_ajustado | DECIMAL(18,2) | Valor ajustado |
| criado_em | DATETIME | Data de criação |

---

## Lógica de saldo

```
Saldo = Créditos Reconhecidos e Cedidos
      − Débitos de Liquidações
      − Débitos de Transferências
```

| Situação | Critério |
|----------|----------|
| 🟢 Normal | Saldo ≥ R$ 50.000 |
| 🟡 Alerta | Saldo entre R$ 0 e R$ 50.000 |
| 🔴 Urgente | Saldo negativo |

---

## API REST

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/dashboard | Posição consolidada |
| GET | /api/empresas | Lista empresas |
| POST | /api/empresas | Criar empresa |
| PUT | /api/empresas/:id | Atualizar empresa |
| DELETE | /api/empresas/:id | Excluir empresa |
| GET | /api/lancamentos | Lista lançamentos (filtros: empresa, tipo, dataInicio, dataFim) |
| POST | /api/lancamentos | Criar lançamento |
| PUT | /api/lancamentos/:id | Atualizar lançamento |
| DELETE | /api/lancamentos/:id | Excluir lançamento |
| GET | /api/saldo | Saldo por empresa (filtros: empresa, parceiro, situacao) |

---

## Iniciar como serviço Windows (recomendado para servidor)

Para que o sistema inicie automaticamente com o Windows, use o **PM2**:

```cmd
npm install -g pm2
pm2 start server/index.js --name vision
pm2 startup
pm2 save
```

---

*Vision Conta Gráfica v1.0.0 · Node.js + SQL Server*
