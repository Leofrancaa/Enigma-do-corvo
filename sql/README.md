# SQLs — Cifra Urbana: O Enigma do Corvo

Execute os arquivos **na ordem numerada** pelo SQL Editor do Supabase.

| Arquivo | O que faz | Quando rodar |
|---|---|---|
| `01_schema.sql` | Cria todas as tabelas, enums e índices | **Primeira vez** (banco zerado) |
| `02_rls_realtime.sql` | Configura RLS e habilita Realtime | Após `01_schema.sql` |
| `03_reset.sql` | **APAGA TUDO** e recria do zero | Só se precisar resetar |

Depois dos SQLs, rode no terminal:
```bash
pnpm db:seed        # personagens + mapa fixo (7 locais)
pnpm db:seed-cases  # 5 casos com pistas
```
