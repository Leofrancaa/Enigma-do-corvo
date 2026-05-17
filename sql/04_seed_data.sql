-- ══════════════════════════════════════════════════════
-- CIFRA URBANA — 04_seed_data.sql
-- Cole e execute no Supabase SQL Editor
-- ══════════════════════════════════════════════════════

-- ─── PERSONAGENS ──────────────────────────────────────
INSERT INTO characters (slug, name, codename, specialty, personality, description, avatar_url, portrait_url)
VALUES
  ('kaito-nakamura', 'Kaito Nakamura', 'Ghost', 'Infiltração Digital', 'Calmo, Lógico e Leal', 'Especialista em penetrar sistemas sem deixar rastro. Kaito opera nas sombras digitais com precisão cirúrgica.', '/imagens-personagens/kaito_avatar_v2.png', '/imagens-personagens/kaito_portrait_v2.png'),
  ('anya-petrova', 'Anya Petrova', 'Oracle', 'Análise de Dados', 'Intuitiva e Perspicaz', 'Ela vê padrões onde outros veem ruído. Ex-analista da Agência Névoa, processa informações com velocidade sobrenatural.', '/imagens-personagens/anya_avatar_v2.png', '/imagens-personagens/anya_portrait_v2.png'),
  ('jax-thorne', 'Jax Thorne', 'Rivet', 'Infraestrutura Física', 'Prático e Cínico', 'Enquanto os outros olham para as telas, Jax olha para os canos, cabos e paredes. Conhece cada esquina de Nova Kyros.', '/imagens-personagens/jax_avatar_v2.png', '/imagens-personagens/jax_portrait_v2.png'),
  ('lena-volkov', 'Lena Volkov', 'Echo', 'Engenharia Social', 'Carismática e Adaptável', 'Toda testemunha conta mais para Lena. Assume identidades e adapta histórias com naturalidade de quem respira.', '/imagens-personagens/lena_avatar_v2.png', '/imagens-personagens/lena_portrait_v2.png'),
  ('silas-blackwood', 'Silas Blackwood', 'Cipher', 'Criptografia', 'Brilhante e Impaciente', 'Nenhuma cifra resiste a Silas por mais de alguns minutos. O problema é que sua cabeça funciona rápido demais.', '/imagens-personagens/silas_avatar_v2.png', '/imagens-personagens/silas_portrait_v2.png'),
  ('zara-khan', 'Zara Khan', 'Spectra', 'Investigação de Campo', 'Corajosa e Sarcástica', 'Zara vai pessoalmente onde ninguém mais quer ir. Beco escuro, zona proibida — ela já esteve lá antes de você perguntar.', '/imagens-personagens/zara_avatar_v2.png', '/imagens-personagens/zara_portrait_v2.png')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, codename = EXCLUDED.codename,
  specialty = EXCLUDED.specialty, personality = EXCLUDED.personality,
  description = EXCLUDED.description, avatar_url = EXCLUDED.avatar_url,
  portrait_url = EXCLUDED.portrait_url;

-- ─── LOCAIS (MAPA FIXO) ───────────────────────────────
INSERT INTO locations (slug, name, subtitle, description, image_url, icon_url, map_x, map_y, is_start_hub)
VALUES
  ('torre-dados', 'Torre de Dados', 'Data Spire', 'O centro nevrálgico da rede digital de Nova Kyros.', '/imagens-locais/torre_dados_detalhe.png', '/imagens-locais/torre_dados_icone.png', 0.2000, 0.2800, false),
  ('mercado-neon', 'Mercado de Néon', 'Neon Bazaar', 'Onde informações, hardware e segredos são trocados.', '/imagens-locais/mercado_neon_detalhe.png', '/imagens-locais/mercado_neon_icone.png', 0.1500, 0.6500, false),
  ('docas-silicio', 'Docas de Silício', 'Silicon Docks', 'Ponto de entrada de contrabando digital.', '/imagens-locais/docas_silicio_detalhe.png', '/imagens-locais/docas_silicio_icone.png', 0.8500, 0.6500, false),
  ('terminal-subterraneo', 'Terminal Subterrâneo', 'The Undergrid', 'A rede de túneis de serviço esquecida.', '/imagens-locais/terminal_subterraneo_detalhe.png', '/imagens-locais/terminal_subterraneo_icone.png', 0.5000, 0.5000, false),
  ('catedral-codigo', 'Catedral do Código', 'Code Cathedral', 'Um antigo centro de processamento convertido em arquivo sagrado.', '/imagens-locais/catedral_codigo_detalhe.png', '/imagens-locais/catedral_codigo_icone.png', 0.8000, 0.2800, false),
  ('observatorio-zenite', 'Observatório Zenite', 'Zenith Observatory', 'O ponto mais alto de Nova Kyros. Usado para interceptação de sinais.', '/imagens-locais/observatorio_zenite_detalhe.png', '/imagens-locais/observatorio_zenite_icone.png', 0.5000, 0.0800, false),
  ('beco-cifras', 'Beco das Cifras', 'Cipher Alley', 'O local onde o crime começou. Todo caso nasce neste beco.', '/imagens-locais/beco_cifras_detalhe.png', '/imagens-locais/beco_cifras_icone.png', 0.5000, 0.8800, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description,
  image_url = EXCLUDED.image_url, icon_url = EXCLUDED.icon_url,
  map_x = EXCLUDED.map_x, map_y = EXCLUDED.map_y, is_start_hub = EXCLUDED.is_start_hub;

-- ─── CONEXÕES ─────────────────────────────────────────
-- Limpar e reinserir conexões
DELETE FROM location_connections;
INSERT INTO location_connections (from_id, to_id, transport_type)
SELECT f.id, t.id, conn.transport::transport_type
FROM (VALUES
  ('beco-cifras', 'terminal-subterraneo', 'magrail'),
  ('beco-cifras', 'mercado-neon', 'drone'),
  ('beco-cifras', 'docas-silicio', 'drone'),
  ('terminal-subterraneo', 'torre-dados', 'hyperloop'),
  ('terminal-subterraneo', 'catedral-codigo', 'hyperloop'),
  ('terminal-subterraneo', 'observatorio-zenite', 'hyperloop'),
  ('torre-dados', 'mercado-neon', 'drone'),
  ('torre-dados', 'observatorio-zenite', 'drone'),
  ('catedral-codigo', 'docas-silicio', 'drone'),
  ('catedral-codigo', 'observatorio-zenite', 'drone'),
  ('mercado-neon', 'docas-silicio', 'magrail')
) AS conn(from_slug, to_slug, transport)
JOIN locations f ON f.slug = conn.from_slug
JOIN locations t ON t.slug = conn.to_slug;

-- ─── CASOS ────────────────────────────────────────────
-- Caso: A Frequência do Silêncio
INSERT INTO cases (slug, title, narrative_intro, difficulty, max_turns, max_errors, recommended_players_min, recommended_players_max, solution_who, solution_where_id, solution_how, solution_why, solution_explanation)
SELECT
  'a-frequencia-do-silencio', 'A Frequência do Silêncio', 'Nova Kyros nunca dorme — mas Ryo Tanaka sim. Para sempre.

O engenheiro de som foi encontrado morto no Beco das Cifras às 05h12 de uma terça-feira chuvosa. O laudo inicial indicou falência cardíaca súbita. Caso encerrado em 40 minutos. Mas o detetive de plantão percebeu algo que não estava no relatório: os fones de ouvido de Ryo ainda estavam conectados, e o espectro de frequência num terminal próximo mostrava um pulso anômalo em 7Hz — uma frequência que a ciência conhece há décadas como potencialmente letal em exposição prolongada.

Ryo não era descuidado. Era obcecado com precisão acústica. Nas semanas anteriores, ele trabalhava até tarde analisando transmissões saídas da Torre de Dados — a espinha dorsal do sinal de rádio de Nova Kyros. Uma semana antes de morrer, deixou uma mensagem para um amigo: ''Descobri algo que vai mudar tudo. Mas preciso ter certeza antes de falar.''

Ele não teve tempo de ter certeza.

Agora cabe a vocês: o que Ryo descobriu, e quem não queria que ele contasse?',
  'facil'::difficulty, 22, 4, 2, 6,
  'Kreuz Vann', l.id, 'Frequência sônica letal de 7Hz emitida remotamente pelo fone de ouvido hackeado da vítima', 'Ryo descobriu que Kreuz transmitia propaganda subliminar paga por políticos corruptos através das torres de rádio, e planejava expor o esquema à imprensa', 'Kreuz Vann, Diretor de Operações da Torre de Dados, montou ao longo de anos um esquema criminoso: embutia sinais subliminares em 7Hz nas transmissões de rádio de Nova Kyros, vendendo esse serviço a políticos corruptos. Ryo Tanaka detectou a anomalia enquanto analisava espectros no Beco das Cifras e planejava ir à imprensa. Kreuz acessou remotamente os fones de ouvido de Ryo — adulterados com um módulo transmissor — e ativou o sinal letal. O acesso ficou registrado nos logs da Torre de Dados como TowerCorp/Admin/KVann, e a empresa fantasma nos arquivos da Catedral do Código (RAZUK Enterprises) era um anagrama perfeito de KREUZ.'
FROM locations l WHERE l.slug = 'torre-dados'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, solution_who = EXCLUDED.solution_who,
  solution_how = EXCLUDED.solution_how, solution_why = EXCLUDED.solution_why;

-- Pistas: A Frequência do Silêncio
DELETE FROM clues WHERE case_id = (SELECT id FROM cases WHERE slug = 'a-frequencia-do-silencio');
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'evidencia'::clue_type, 'Terminal portátil de Ryo, ainda ligado no beco. O monitor exibe um espectro de frequência com anomalia marcada em vermelho: 7Hz pulsando a cada 3 segundos. Um post-it colado na tela: ''Quem opera a Torre de Dados às 03h? Verificar licença empresa RAZUK na Catedral do Código.''', NULL, 'context'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'a-frequencia-do-silencio' AND l.slug = 'beco-cifras';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'cifra'::clue_type, 'Placa no elevador de acesso restrito da Torre: ''Autorizado: OVIYD ZERR — DIRETOR''. Cada letra do nome está 4 posições à frente no alfabeto. Volte 4 posições para revelar quem é o Diretor.', 'Deslocamento César -4: O→K, V→R, I→E, Y→U, D→Z = KREUZ. Z→V, E→A, R→N, R→N = VANN. Nome: KREUZ VANN.', 'who'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'a-frequencia-do-silencio' AND l.slug = 'torre-dados';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'depoimento'::clue_type, 'Log de mensagens interceptado no servidor interno: ''Diretor — o Conselheiro Aldris confirmou mais 2 milhões para o próximo ciclo eleitoral. O sinal estará ativo nas noites de quarta. Ninguém perceberá... a não ser alguém com ouvido treinado e muito tempo livre. — Op. Y''', NULL, 'why'::reveals_field, 2
FROM cases cs, locations l
WHERE cs.slug = 'a-frequencia-do-silencio' AND l.slug = 'torre-dados';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'evidencia'::clue_type, 'Log de acesso remoto a dispositivos externos: ''TowerCorp/Admin/KVann — sessão ativa 14 min — dispositivo: Fone-ID-RYO-7742 — frequência emitida: 7Hz''. Timestamp coincide com a hora da morte de Ryo.', 'KVann = iniciais de Kreuz Vann. Ele acessou remotamente o fone de ouvido de Ryo.', 'how'::reveals_field, 3
FROM cases cs, locations l
WHERE cs.slug = 'a-frequencia-do-silencio' AND l.slug = 'torre-dados';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'anagrama'::clue_type, 'Ficha de concessão da frequência 7Hz, assinada por empresa fantasma: ''RAZUK ENTERPRISES''. Sem endereço físico ou registro válido. Rearranjar as letras de RAZUK revela o sobrenome do verdadeiro titular da licença.', 'RAZUK → rearranjar → KREUZ. Anagrama perfeito. Empresa de fachada de Kreuz Vann.', 'who'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'a-frequencia-do-silencio' AND l.slug = 'catedral-codigo';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'referencia'::clue_type, 'Relatório financeiro da TowerCorp em arquivo público de licitações — linha destacada a caneta: ''Receita especial não identificada: 47.200.000 créditos''. Data coincide com o início da campanha eleitoral de Nova Kyros.', NULL, 'why'::reveals_field, 2
FROM cases cs, locations l
WHERE cs.slug = 'a-frequencia-do-silencio' AND l.slug = 'catedral-codigo';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'depoimento'::clue_type, 'Informante no Mercado: ''Vi Ryo aqui três noites antes de ele morrer. Estava nervoso. Disse que descobriu que alguém usa as torres de rádio pra influenciar decisões das pessoas sem elas perceberem. Ia à imprensa de manhã. Nunca mais o vi.''', NULL, 'why'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'a-frequencia-do-silencio' AND l.slug = 'mercado-neon';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'analogia'::clue_type, 'Diário de Ryo, encontrado numa mochila escondida no terminal: ''Como uma cobra que mata com seu sussurro sem ser vista, eles usaram meu próprio instrumento contra mim. Meu fone — minha extensão — virou a arma. O infrassom mata silenciosamente. Se você está lendo isso: vá à Torre de Dados. O acesso remoto está nos logs.''', 'Ryo sabia que seria alvo. Apontou diretamente para a Torre de Dados e para a arma: o fone hackeado.', 'how'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'a-frequencia-do-silencio' AND l.slug = 'terminal-subterraneo';

-- Caso: Sangue Holográfico
INSERT INTO cases (slug, title, narrative_intro, difficulty, max_turns, max_errors, recommended_players_min, recommended_players_max, solution_who, solution_where_id, solution_how, solution_why, solution_explanation)
SELECT
  'sangue-holografico', 'Sangue Holográfico', 'A Dra. Oona Shen era considerada a maior artista-cientista de Nova Kyros. Seu algoritmo AURORA — capaz de gerar hologramas indistinguíveis da realidade — estava prestes a ser apresentado ao mundo. Uma revolução. Uma fortuna. Um alvo.

Foi encontrada morta na Catedral do Código, onde mantinha seu laboratório particular nos andares inferiores do arquivo. O laudo indica colapso neural múltiplo — ''como se todos os arquivos cerebrais tivessem sido formatados simultaneamente''. O algoritmo AURORA havia desaparecido. Os backups: apagados.

O mundo da arte digital de Nova Kyros é pequeno e violento. Rivais disputam contratos em créditos que alimentam exércitos. A morte de Oona deixou um vácuo que muitos queriam preencher — mas apenas um tinha motivo, acesso e desespero suficientes.

Um rascunho de e-mail no servidor da Catedral dizia: ''Viktor — você era o único que podia se conectar diretamente ao meu sistema.'' O e-mail nunca foi enviado.',
  'medio'::difficulty, 18, 3, 2, 6,
  'Viktor Nars', l.id, 'Nanobots NeuroKill-X injetados via conexão direta de interface neural artística, destruindo os arquivos cerebrais e parando o coração da vítima', 'O algoritmo AURORA tornaria o trabalho artístico de Viktor obsoleto e o levaria à falência; ele planejava roubar e lançar o algoritmo como seu', 'Viktor Nars (PRISM) estava à beira da falência. Uma análise de mercado em seu apartamento revelava que o AURORA de Oona destruiria qualquer artista holográfico concorrente. Ele comprou nanobots NeuroKill-X nas Docas de Silício sob o anagrama MRSIV NAR. Usando passe especial à Catedral, conectou-se diretamente ao terminal de Oona, injetou os nanobots e copiou o algoritmo. A testemunha o viu sair. Seu diário selou a confissão.'
FROM locations l WHERE l.slug = 'catedral-codigo'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, solution_who = EXCLUDED.solution_who,
  solution_how = EXCLUDED.solution_how, solution_why = EXCLUDED.solution_why;

-- Pistas: Sangue Holográfico
DELETE FROM clues WHERE case_id = (SELECT id FROM cases WHERE slug = 'sangue-holografico');
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'depoimento'::clue_type, 'Assistente da Catedral, interrogada no Beco: ''Na noite anterior à morte da Dra. Shen, vi o artista PRISM entrar com passe especial após o expediente. Disse que era colaboração surpresa. Às 23h14 ele saiu sozinho, apressado. Oona não apareceu mais.''', NULL, 'who'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'sangue-holografico' AND l.slug = 'beco-cifras';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'evidencia'::clue_type, 'Interface de conexão artística no laboratório de Oona: marcas de uso forçado na porta USB. Análise identifica traços de nanobots NeuroKill-X desativados. Terminal mostra: último projeto acessado ''AURORA_v9'' — dados copiados para dispositivo externo, originais deletados. Usuário: conexão externa não autorizada.', NULL, 'how'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'sangue-holografico' AND l.slug = 'catedral-codigo';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'analogia'::clue_type, 'Anotação de Oona sob a bancada: ''A arte pode ser uma faca de dois gumes — bela e letal. Quem usa a interface como ponte pode transformá-la em guilhotina. Nunca confie em conexão direta com alguém que tem mais a ganhar com sua ausência do que com sua presença.''', 'Interface neural direta como arma. Quem tinha mais a ganhar com a ausência de Oona?', 'how'::reveals_field, 2
FROM cases cs, locations l
WHERE cs.slug = 'sangue-holografico' AND l.slug = 'catedral-codigo';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'anagrama'::clue_type, 'Registro de compra de nanobots NeuroKill-X nas docas, há 6 dias. Comprador registrado como ''MRSIV NAR''. A lei exige registro mesmo em compras ilegais de contrabando. Descubra quem comprou rearrajando as letras de MRSIV NAR.', 'MRSIV NAR → rearranjar → VIKTOR NARS. As letras M,R,S,I,V,N,A,R são as mesmas de V,I,K,T,O,R,N,A,R,S... O comprador era Viktor Nars.', 'who'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'sangue-holografico' AND l.slug = 'docas-silicio';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'evidencia'::clue_type, 'Extrato bancário de Viktor encontrado com o contrabandista: saldo de -847.000 créditos. Pasta anexa ''AURORA — ANÁLISE DE MERCADO'' mostra projeções: em 18 meses após lançamento de Oona, a arte de Viktor valeria zero. Anotação à caneta: ''NÃO PODE ACONTECER.''', NULL, 'why'::reveals_field, 2
FROM cases cs, locations l
WHERE cs.slug = 'sangue-holografico' AND l.slug = 'docas-silicio';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'cifra'::clue_type, 'Anúncio em código no fórum NeoBlack do Mercado: ''YHQGR: QHXURNLOO-B, XVR HVSHFLDO, QmR GHLD UDVWUR''. Cada letra está 3 posições à frente no original. Volte 3 posições para decifrar.', 'Deslocamento -3: Y→V, H→E, Q→N, G→D, R→O = VENDO. Q→N,H→E,X→U,U→R,N→K,L→I,O→L,O→L,B→Y = NEUROKILL-Y... modelo: NEUROKILL-X. Mensagem: ''VENDO: NEUROKILL-X, USO ESPECIAL, NÃO DEIXA RASTRO.''', 'how'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'sangue-holografico' AND l.slug = 'mercado-neon';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'plot_twist'::clue_type, 'Diário de Viktor encontrado com um receptador do Mercado, escondido numa encomenda: ''Fiz o que era necessário. AURORA não pode existir além de mim. Meu legado não pode morrer por causa de uma equação. Em seis meses, ninguém saberá de onde veio o algoritmo. Tudo que Oona criou agora é meu.''', NULL, 'why'::reveals_field, 2
FROM cases cs, locations l
WHERE cs.slug = 'sangue-holografico' AND l.slug = 'mercado-neon';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'depoimento'::clue_type, 'E-mail impresso recuperado da estação de comunicações do Observatório, enviado pelo agente de arte de Viktor 3 semanas atrás: ''Viktor — se o algoritmo de Oona chegar ao mercado, você não terá contratos por 5 anos. Sua arte ficará tecnicamente obsoleta. É questão de sobrevivência. Você precisa de uma solução urgente — legal ou não.''', NULL, 'why'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'sangue-holografico' AND l.slug = 'observatorio-zenite';

-- Caso: O Protocolo Cinza
INSERT INTO cases (slug, title, narrative_intro, difficulty, max_turns, max_errors, recommended_players_min, recommended_players_max, solution_who, solution_where_id, solution_how, solution_why, solution_explanation)
SELECT
  'o-protocolo-cinza', 'O Protocolo Cinza', '18 horas. Foi o tempo que metade de Nova Kyros ficou no escuro.

A explosão no Beco das Cifras — onde ficava o transformador de distribuição do Setor 7 — matou três técnicos e desativou a rede elétrica de seis distritos. Hospitais operaram na reserva. Câmeras de segurança falharam. 14 pessoas morreram indiretamente.

A EnergyCorp divulgou comunicado culpando ''ativistas extremistas externos''. Mas a investigação que eles tentaram suprimir dizia outra coisa: o firmware dos transformadores havia sido sobrescrito por um vírus chamado CINZA-9, via acesso remoto pelo Terminal Subterrâneo — e as credenciais usadas eram de um Engenheiro Sênior com 12 anos de casa.

O protocolo era sofisticado demais para ser de um amador. Alguém com anos de experiência, acesso irrestrito e um motivo pessoal profundo o construiu. Alguém que esperou pacientemente pela posição certa.

O Conselho quer respostas. A EnergyCorp quer silêncio. Em algum lugar desta cidade parcialmente escura, o autor do Protocolo Cinza assiste ao resultado de uma vingança planejada por uma década.',
  'dificil'::difficulty, 16, 2, 3, 6,
  'Dr. Vex Nolan', l.id, 'Vírus quântico CINZA-9 inserido remotamente nos transformadores via credencial VN-7733 a partir de um terminal no Undergrid', 'Sua filha Mira Nolan, 8 anos, morreu no Incidente Gamma 10 anos antes — acidente de energia que a EnergyCorp encobriu alterando o laudo oficial. Vex esperou uma década para se vingar', 'Dr. Vex Nolan, Engenheiro Sênior da EnergyCorp há 12 anos, construiu pacientemente sua posição com um único objetivo: vingar a morte de sua filha Mira no Incidente Gamma, encoberto pela empresa. Ele desenvolveu o vírus CINZA-9, encomendado nas Docas de Silício, e usou sua credencial VN-7733 para acessar o Terminal Subterrâneo remotamente às 02h17, sobrescrevendo o firmware dos transformadores do Beco das Cifras. Os logs do terminal, o arquivo Gamma na Catedral do Código (acessado 47 vezes pela sua credencial), o anagrama NOVAL NEX e o código cifrado no arquivo forense constroem a prova de uma vingança meticulosa.'
FROM locations l WHERE l.slug = 'terminal-subterraneo'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, solution_who = EXCLUDED.solution_who,
  solution_how = EXCLUDED.solution_how, solution_why = EXCLUDED.solution_why;

-- Pistas: O Protocolo Cinza
DELETE FROM clues WHERE case_id = (SELECT id FROM cases WHERE slug = 'o-protocolo-cinza');
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'evidencia'::clue_type, 'Relatório técnico pós-explosão, encontrado no beco: ''Os transformadores não falharam por desgaste. O firmware foi sobrescrito pelo código CINZA-9. O acesso foi remoto via rede interna da EnergyCorp. Credenciais utilizadas: nível Engenheiro Sênior. Apenas seis funcionários têm esse acesso.''', NULL, 'how'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'o-protocolo-cinza' AND l.slug = 'beco-cifras';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'evidencia'::clue_type, 'Log de acesso do Undergrid: credencial VN-7733 (nível Engenheiro Sênior) autenticada às 02h17 do dia do acidente. Modificação de firmware executada em 4 minutos e 11 segundos. Nenhum alerta disparado — credenciais legítimas. VN-7733: Dr. Vex Nolan.', 'VN = iniciais de Vex Nolan. Ele acessou o terminal remotamente.', 'who'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'o-protocolo-cinza' AND l.slug = 'terminal-subterraneo';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'referencia'::clue_type, 'Pasta classificada ''INCIDENTE SUBESTAÇÃO GAMMA — RESTRITO''. O relatório omitiu falha de isolamento por decisão do conselho. Lista de vítimas: ''Mira Nolan, 8 anos, filha de funcionário''. A pasta foi acessada 47 vezes nos últimos 2 anos — sempre pela credencial VN-7733.', 'Mira Nolan era filha de Vex. Ele descobriu o encobrimento e acessou esse arquivo obsessivamente por 2 anos.', 'why'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'o-protocolo-cinza' AND l.slug = 'catedral-codigo';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'anagrama'::clue_type, 'Cartão de acesso encontrado no chão entre os arquivadores — não pertence ao sistema atual. Escrito à mão: ''NOVAL NEX esteve aqui''. O cartão está sob o arquivo do Incidente Gamma. Rearranjar as letras de NOVAL NEX revela o nome do visitante.', 'NOVAL NEX → rearranjar → VEX NOLAN. Ele deixou um rastro — ou uma confissão velada.', 'who'::reveals_field, 2
FROM cases cs, locations l
WHERE cs.slug = 'o-protocolo-cinza' AND l.slug = 'catedral-codigo';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'depoimento'::clue_type, 'Conversa criptografada recuperada do servidor das Docas: ''Cliente solicitou vírus de sobrescrita de firmware para transformadores industriais. Pagamento: 800.000 créditos em XCoin. Nome do vírus escolhido pelo cliente: CINZA-9. Cliente identificado como [VN]. Entrega confirmada há 14 meses.''', '[VN] são as iniciais de Vex Nolan.', 'how'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'o-protocolo-cinza' AND l.slug = 'docas-silicio';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'cifra'::clue_type, 'Fragmento de código recuperado do firmware destruído, enviado para análise da Torre. Uma linha de comentário deixada intencionalmente: ''FLQCD-9: SDUD D PLUD QRODQ''. Decifre com deslocamento César de -3.', 'Deslocamento -3: F→C, L→I, Q→N, C→Z, D→A = CINZA. S→P, D→A, U→R, D→A = PARA. D→A. P→M, L→I, U→R, D→A = MIRA. Q→N, R→O, O→L, D→A, Q→N = NOLAN. Resultado: ''CINZA-9: PARA A MIRA NOLAN''. O criador dedicou o vírus à filha.', 'why'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'o-protocolo-cinza' AND l.slug = 'torre-dados';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'analogia'::clue_type, 'Uma flor física — orquídea branca, murchando — deixada no ponto mais alto do Observatório com vista para o Beco das Cifras. Placa manuscrita: ''Como uma vela que queima em silêncio por anos antes de incendiar tudo ao redor, a dor verdadeira não grita — ela espera. Gamma foi o começo. O Beco foi a resposta. Cumpri minha promessa, Mira.''', 'Alguém veio até aqui para ver a destruição que causou. Quem prometeria vingar Mira Nolan?', 'why'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'o-protocolo-cinza' AND l.slug = 'observatorio-zenite';

-- Caso: Nome em Código: POLVOS
INSERT INTO cases (slug, title, narrative_intro, difficulty, max_turns, max_errors, recommended_players_min, recommended_players_max, solution_who, solution_where_id, solution_how, solution_why, solution_explanation)
SELECT
  'nome-em-codigo-polvos', 'Nome em Código: POLVOS', 'Fenix Rua não era um jornalista comum. Em três anos, coletou provas sobre a Linha 9 da MegaCorp Axiom: implantes neurais defeituosos vendidos a preço de desconto para populações do Setor 14, causando sequelas permanentes em 400 pessoas. Seu depoimento ao Conselho de Justiça estava marcado para amanhã às 09h.

Fenix não apareceu no Conselho.

Seu terminal foi encontrado no Beco das Cifras — sem sinais de luta, sem mensagens de despedida. Apenas um registro de entrega de comida por drone, com metade consumida, e Fenix desaparecido. A CorpSec, empresa de segurança privada contratada pela MegaCorp Axiom para ''proteger o depoente'', diz que perdeu contato com ele às 02h30.

O agente designado para sua proteção pessoal — um profissional de confiança há três anos — foi o último a vê-lo com vida.

O depoimento é amanhã. Se Fenix não aparecer, as provas prescrevem. O Conselho fecha o caso. E 400 pessoas ficam sem reparação.

Vocês têm até o amanhecer.',
  'medio'::difficulty, 18, 3, 2, 6,
  'Soren Lex', l.id, 'Sedativo Sono-V dissolvido na refeição entregue por drone, tornando Fenix inconsciente para transporte', 'Pagamento de 50 milhões de créditos da MegaCorp Axiom para impedir o depoimento que exporia os implantes defeituosos da Linha 9', 'Soren Lex, agente de segurança pessoal de Fenix e funcionário secreto da CorpSec, adulterou a entrega de comida com Sono-V usando seu ID corporativo S_LEX_7. Após Fenix adormecer, transportou-o pelas Docas de Silício até a clínica clandestina da CorpSec instalada nos contêineres do cais. O anagrama ROSNE XEL na ordem da Torre de Dados, a cifra no Observatório e as câmeras do Terminal Subterrâneo capturam toda a trilha.'
FROM locations l WHERE l.slug = 'docas-silicio'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, solution_who = EXCLUDED.solution_who,
  solution_how = EXCLUDED.solution_how, solution_why = EXCLUDED.solution_why;

-- Pistas: Nome em Código: POLVOS
DELETE FROM clues WHERE case_id = (SELECT id FROM cases WHERE slug = 'nome-em-codigo-polvos');
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'evidencia'::clue_type, 'Terminal de Fenix no Beco. Análise da embalagem de comida entregue: traços do sedativo Sono-V. Age em 2-3 horas, sem sabor ou cheiro. Rastreamento do pedido no app PrimeDelivery: conta corporativa ''S_LEX_7''. A conta está vinculada à rede interna da CorpSec.', 'S_LEX_7 é o identificador de Soren Lex na CorpSec. Ele fez o pedido adulterado.', 'how'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'nome-em-codigo-polvos' AND l.slug = 'beco-cifras';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'anagrama'::clue_type, 'Ordem interna encontrada num terminal desbloqueado da Torre: ''Operação POLVOS: agente ROSNE XEL designado para neutralização do alvo Fenix Rua antes das 09h. Pagamento: 50.000.000 créditos via conta DeltaShield. Autorização: Conselho Axiom.'' O nome do agente está embaralhado por protocolo. Rearranjar ROSNE XEL revela o nome real.', 'ROSNE XEL → rearranjar → SOREN LEX. As letras R,O,S,N,E,X,E,L são as mesmas de S,O,R,E,N,L,E,X.', 'who'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'nome-em-codigo-polvos' AND l.slug = 'torre-dados';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'referencia'::clue_type, 'Relatório da MegaCorp Axiom para a CorpSec, encontrado na Torre: ''Depoimento de Fenix Rua expõe Linha 9: implantes neurais defeituosos vendidos como genéricos. Estimativa de dano: 400 bilhões de créditos + dissolução da divisão. Prioridade: MÁXIMA. Janela: 18 horas.''', NULL, 'why'::reveals_field, 2
FROM cases cs, locations l
WHERE cs.slug = 'nome-em-codigo-polvos' AND l.slug = 'torre-dados';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'analogia'::clue_type, 'Câmera de segurança do Terminal às 03h07 — relatório automático da IA de vigilância: ''Indivíduo identificado: Soren Lex, credencial CorpSec nível 4, transportou segundo indivíduo inconsciente pela plataforma C. Como um pastor que conduz a ovelha pelo caminho que ela conhece e confia, ele agiu como se tivesse todo o direito do mundo. Destino: Cais Norte.''', 'A câmera identificou Soren Lex. Destino indicado: Cais Norte = Docas de Silício.', 'who'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'nome-em-codigo-polvos' AND l.slug = 'terminal-subterraneo';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'cifra'::clue_type, 'Mensagem recebida na estação de interceptação do Observatório, remetente anônimo: ''VRUQH OHA WUDLX''. Parece ser um aviso codificado. Cada letra está 3 posições à frente no original. Volte 3 para decifrar.', 'Deslocamento -3: V→S, R→O, U→R, Q→N, H→E = SOREN. O→L, H→E, A→X = LEX. W→T, U→R, D→A, L→I, X→U = TRAIU. Mensagem: SOREN LEX TRAIU.', 'who'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'nome-em-codigo-polvos' AND l.slug = 'observatorio-zenite';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'depoimento'::clue_type, 'Estivador do turno da madrugada nas Docas: ''Às 03h vi um homem carregando outra pessoa inconsciente pelo pier 7. Tinha distintivo CorpSec dourado nível 4. Foram para uma instalação médica nos contêineres do cais norte — vi a luz azul de um monitor cardíaco.''', NULL, 'where'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'nome-em-codigo-polvos' AND l.slug = 'docas-silicio';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'plot_twist'::clue_type, 'Contêiner C-47 no cais norte: porta com placa ''CorpSec — Custódia Temporária — Não Notificar''. Dentro: Fenix Rua numa maca, inconsciente, conectado a um monitor cardíaco. Pulsos com marcas suaves de contenção. Respiração estável. Ele está vivo. O depoimento é em 6 horas.', 'Fenix está aqui. Vivo. Ainda há tempo.', 'where'::reveals_field, 2
FROM cases cs, locations l
WHERE cs.slug = 'nome-em-codigo-polvos' AND l.slug = 'docas-silicio';

-- Caso: A Última Transação
INSERT INTO cases (slug, title, narrative_intro, difficulty, max_turns, max_errors, recommended_players_min, recommended_players_max, solution_who, solution_where_id, solution_how, solution_why, solution_explanation)
SELECT
  'a-ultima-transacao', 'A Última Transação', 'Mauro Veld era o rosto do Banco Quantum — sorridente nos hologramas publicitários, confiável em 20 anos de carreira. Foi encontrado morto no Observatório Zenite, onde mantinha uma sala privativa para ''sessões criativas noturnas''. Causa aparente: overdose acidental de interface neural.

Ao mesmo tempo, a diretoria descobriu que 2.317.444.000 créditos haviam sumido em 847 microtransações ao longo de 36 meses. O dinheiro foi para o nada. Mas ''o nada'' tem endereço em Nova Kyros.

A auditoria interna, encerrada abruptamente por ordem da diretoria, encontrou algo: todas as transações foram autorizadas pela credencial RS-SENIOR-77. E Mauro, nas semanas antes de morrer, havia solicitado audiência urgente com o Conselho Regulatório de Finanças.

Audiência cancelada na manhã seguinte à sua morte.

Alguém tinha muito a perder com o que Mauro estava prestes a dizer. E esse alguém sabia exatamente como silenciá-lo.',
  'medio'::difficulty, 18, 3, 2, 6,
  'Renata Sombra', l.id, 'Sobrecarga forçada de interface neural via acesso remoto ao implante de Mauro, simulando overdose acidental', 'Mauro descobriu que Renata criou o esquema de lavagem de 2,3 bilhões e ia confessar ao Conselho Regulatório, ameaçando destruir tudo que ela construiu em 36 anos', 'Renata Sombra, sócia sênior do Banco Quantum, construiu ao longo de 36 anos um esquema de lavagem de 2,3 bilhões via o Mercado de Néon como fachada. Quando Mauro decidiu confessar, ela usou seu acesso de administradora sênior de implantes (ID NARATE_77, anagrama de RENATA) para forçar sobrecarga letal no implante de Mauro às 22h41 no Observatório. As câmeras da Torre de Dados a capturaram saindo da Torre 3 minutos antes. A nota cifrada de Mauro, o anagrama nos servidores das Docas e os e-mails deletados constroem a prova irrefutável.'
FROM locations l WHERE l.slug = 'observatorio-zenite'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, solution_who = EXCLUDED.solution_who,
  solution_how = EXCLUDED.solution_how, solution_why = EXCLUDED.solution_why;

-- Pistas: A Última Transação
DELETE FROM clues WHERE case_id = (SELECT id FROM cases WHERE slug = 'a-ultima-transacao');
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'evidencia'::clue_type, 'Relatório de auditoria vazado no Beco: ''2.317.444.000 créditos transferidos em 847 transações a contas offshore ao longo de 36 meses. Valor médio: 2.728.000 créditos. Todas autorizadas pela credencial RS-SENIOR-77.'' RS-SENIOR-77 pertence à sócia sênior Renata Sombra.', 'RS = iniciais de Renata Sombra.', 'why'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'a-ultima-transacao' AND l.slug = 'beco-cifras';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'evidencia'::clue_type, 'O log do implante de Mauro: ''sessão iniciada externamente às 22h41 por usuário remoto ID: NARATE_77''. O acesso foi remoto. Mauro estava acordado quando começou — marcas de tensão nas mãos. Alguém forçou a sobrecarga de fora.', 'NARATE_77 é um ID de usuário. Rearranjar NARATE revela o prenome de quem matou Mauro.', 'how'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'a-ultima-transacao' AND l.slug = 'observatorio-zenite';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'cifra'::clue_type, 'Nota manuscrita dobrada debaixo da poltrona neural — Mauro a escondeu às pressas: ''Se acontecer algo comigo — UHQDWD VRPEUD. Ela criou tudo. Eu apenas obedeci por anos. Perdão.'' Cada letra foi avançada 3 posições no alfabeto. Volte 3 para ler o nome.', 'Deslocamento -3: U→R, H→E, Q→N, D→A, W→T, D→A = RENATA. V→S, R→O, P→M, E→B, U→R, D→A = SOMBRA. Nome: RENATA SOMBRA.', 'who'::reveals_field, 2
FROM cases cs, locations l
WHERE cs.slug = 'a-ultima-transacao' AND l.slug = 'observatorio-zenite';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'depoimento'::clue_type, 'E-mail rascunho recuperado do lixo do servidor da Torre: ''Mauro — você me prometeu silêncio eterno. Construí esse sistema por 36 anos. Agora diz que vai confessar ao Conselho? Você esqueceu que sou administradora sênior de todos os implantes desta empresa. Eu sei exatamente o que há dentro da sua cabeça. E sei como acessar.'' — RS', NULL, 'why'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'a-ultima-transacao' AND l.slug = 'torre-dados';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'analogia'::clue_type, 'Câmera de segurança da Torre às 22h38 — 3 minutos antes da morte de Mauro: figura saindo da sala de administradores em direção ao terminal de controle de implantes. Sistema de reconhecimento: ''Renata Sombra — saída registrada''. Como uma sombra que caminha entre duas vidas — sócia de dia, executora de noite —, ela saiu antes de o corpo ser encontrado.', 'Ela estava na Torre minutos antes da morte. Terminal de controle de implantes fica aqui.', 'who'::reveals_field, 2
FROM cases cs, locations l
WHERE cs.slug = 'a-ultima-transacao' AND l.slug = 'torre-dados';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'referencia'::clue_type, 'Registros do Mercado de Néon dos últimos 3 anos: 847 ''depósitos de bônus corporativos'' com origem no Banco Quantum, cada um de exatamente 2.728.000 créditos. Total: 2.317.416.000 créditos. O Mercado nunca movimentou esse volume em apostas reais — era fachada para passagem de recursos.', NULL, 'why'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'a-ultima-transacao' AND l.slug = 'mercado-neon';
INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")
SELECT cs.id, l.id, 'anagrama'::clue_type, 'Conta mestra do esquema nas Docas, registro de proprietário: ''BATA RENAS ROM''. A legislação offshore permite anagramas por ''privacidade corporativa''. Rearranjar as letras de BATA RENAS ROM revela a proprietária real.', 'BATA RENAS ROM = B,A,T,A,R,E,N,A,S,R,O,M (12 letras). As mesmas letras de RENATA SOMBRA = R,E,N,A,T,A,S,O,M,B,R,A ✓.', 'who'::reveals_field, 1
FROM cases cs, locations l
WHERE cs.slug = 'a-ultima-transacao' AND l.slug = 'docas-silicio';
