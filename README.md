# Daily Diet API

API REST para controle de dieta diária, desenvolvida como desafio do módulo de Node.js da [Rocketseat](https://www.rocketseat.com.br/). Permite que usuários registrem suas refeições e acompanhem métricas sobre sua aderência à dieta.

## Sobre o projeto

A Daily Diet API permite que um usuário crie sua conta, registre refeições ao longo do dia e acompanhe estatísticas de quão bem está seguindo sua dieta e incluindo a melhor sequência consecutiva de refeições dentro da dieta.

### Regras de negócio

- ✅ Deve ser possível criar um usuário
- ✅ Deve ser possível identificar o usuário entre as requisições (via cookie de sessão)
- ✅ Deve ser possível registrar uma refeição feita, com as informações:
  - Nome
  - Descrição
  - Data e hora
  - Se está ou não dentro da dieta
- ✅ Deve ser possível editar uma refeição (todos os campos)
- ✅ Deve ser possível apagar uma refeição
- ✅ Deve ser possível listar todas as refeições de um usuário
- ✅ Deve ser possível visualizar uma única refeição
- ✅ Deve ser possível recuperar as métricas de um usuário:
  - Quantidade total de refeições registradas
  - Quantidade total de refeições dentro da dieta
  - Quantidade total de refeições fora da dieta
  - Melhor sequência de refeições dentro da dieta
- ✅ O usuário só pode visualizar, editar e apagar as refeições que ele mesmo criou

## Tecnologias

- [Node.js](https://nodejs.org)
- [TypeScript](https://www.typescriptlang.org/)
- [Fastify](https://fastify.dev/) — framework HTTP
- [Knex.js](https://knexjs.org/) — query builder
- [SQLite3](https://www.sqlite.org/) — banco de dados
- [Zod](https://zod.dev/) — validação de schemas
- [Vitest](https://vitest.dev/) — testes automatizados
- [Supertest](https://github.com/ladjs/supertest) — testes de integração HTTP
- [tsx](https://github.com/privatenumber/tsx) — execução TypeScript sem build

## Instalação

```bash
git clone <url-do-seu-repositorio>
cd daily-diet-api
npm install
```

## Configuração de ambiente

Copie o arquivo de exemplo e ajuste se necessário:

```bash
cp .env.example .env
```

Variáveis disponíveis:

| Variável          | Descrição                              | Padrão        |
| ----------------- | --------------------------------------- | ------------- |
| `DATABASE_CLIENT`  | Client do banco de dados usado pelo Knex | `sqlite`      |
| `DATABASE_URL`     | Caminho/URL de conexão com o banco       | `./db/app.db` |
| `PORT`             | Porta em que o servidor sobe             | `3333`        |

## Rodando as migrations

```bash
npm run knex migrate:latest
```

## Executando o projeto

```bash
npm run dev
```

O servidor sobe em `http://localhost:3333` (ou na porta definida em `PORT`).

## Rodando os testes

```bash
npm test
```

Os testes usam um banco SQLite isolado (`.env.test`), recriando o schema a cada teste para garantir isolamento entre os casos.

## Rotas da API

### Usuários

| Método | Rota      | Descrição                    | Autenticação |
| ------ | --------- | ----------------------------- | ------------ |
| POST   | `/users`  | Cria um novo usuário          | Não          |
| GET    | `/users`  | Lista todos os usuários       | Não          |

**Criar usuário**

```http
POST /users
Content-Type: application/json

{
  "name": "João Victor"
}
```

Ao criar um usuário, um cookie `sessionId` é retornado e deve ser reenviado em todas as requisições subsequentes às rotas de refeições.

### Refeições

Todas as rotas abaixo exigem o cookie `sessionId` (obtido ao criar um usuário) e retornam `401 Unauthorized` caso ele esteja ausente ou inválido.

| Método | Rota            | Descrição                                    |
| ------ | --------------- | ---------------------------------------------- |
| POST   | `/meals`        | Registra uma nova refeição                      |
| GET    | `/meals`        | Lista todas as refeições do usuário autenticado |
| GET    | `/meals/:id`    | Detalha uma refeição específica                 |
| PUT    | `/meals/:id`    | Atualiza uma refeição                           |
| DELETE | `/meals/:id`    | Remove uma refeição                             |
| GET    | `/meals/metrics`| Retorna as métricas do usuário                  |

**Criar refeição**

```http
POST /meals
Content-Type: application/json
Cookie: sessionId=<seu-session-id>

{
  "name": "Café da manhã",
  "description": "2 pães com manteiga",
  "date_time": "2026-08-21T09:00:00",
  "is_on_diet": true
}
```

> O campo `date_time` deve ser enviado no formato **ISO 8601**.

**Atualizar refeição**

```http
PUT /meals/:id
Content-Type: application/json
Cookie: sessionId=<seu-session-id>

{
  "name": "Café da manhã reforçado",
  "description": "2 pães com manteiga e ovo",
  "date_time": "2026-08-21T09:00:00",
  "is_on_diet": false
}
```

> Todos os campos são obrigatórios ao atualizar uma refeição.

**Métricas**

```http
GET /meals/metrics
Cookie: sessionId=<seu-session-id>
```

Resposta:

```json
{
  "totalMeals": 7,
  "totalMealsOnDiet": 5,
  "totalMealsOffDiet": 2,
  "bestOnDietSequence": 3
}
```

Caso o usuário tente visualizar, editar ou apagar uma refeição que não é dele, a API retorna `404 Not Found`.

## Estrutura do projeto

```
daily-diet-api/
├── db/
│   └── migrations/       # Migrations do Knex
├── src/
│   ├── @types/           # Tipagens de augmentation (Knex, Fastify)
│   ├── env/              # Validação de variáveis de ambiente
│   ├── middleware/        # Middlewares (ex: checagem de sessão)
│   ├── routes/            # Rotas da aplicação
│   ├── app.ts             # Instância do Fastify (usada nos testes)
│   ├── database.ts        # Configuração do Knex
│   └── server.ts           # Bootstrap do servidor
├── test/                  # Testes automatizados
├── knexfile.ts
└── package.json
```

## Licença

Este projeto foi desenvolvido para fins de estudo.