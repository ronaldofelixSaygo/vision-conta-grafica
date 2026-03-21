const express = require('express');
const { query } = require('./db');
const router = express.Router();

// ── DASHBOARD ─────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  const r = await query(`
    SELECT
      e.id, e.nome, e.parceiro, e.certificado,
      COALESCE(SUM(CASE WHEN l.tipo_movimento='Créditos Reconhecidos e Cedidos' THEN l.valor_ajustado ELSE 0 END),0) AS creditos,
      COALESCE(SUM(CASE WHEN l.tipo_movimento='Débitos de Liquidações'          THEN l.valor_ajustado ELSE 0 END),0) AS debitos_liq,
      COALESCE(SUM(CASE WHEN l.tipo_movimento='Débitos de Transferências'       THEN l.valor_ajustado ELSE 0 END),0) AS debitos_trans,
      COUNT(l.id) AS total_lancamentos
    FROM vision_empresas e
    LEFT JOIN vision_lancamentos l ON l.empresa = e.nome
    GROUP BY e.id, e.nome, e.parceiro, e.certificado
    ORDER BY e.nome
  `);
  res.json(r.rows);
});

// ── EMPRESAS ──────────────────────────────────────────────
router.get('/empresas', async (req, res) => {
  const r = await query('SELECT * FROM vision_empresas ORDER BY nome');
  res.json(r.rows);
});

router.get('/empresas/:id', async (req, res) => {
  const r = await query('SELECT * FROM vision_empresas WHERE id = $1', [req.params.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Não encontrado' });
  res.json(r.rows[0]);
});

router.post('/empresas', async (req, res) => {
  const { nome, escritorio, parceiro, certificado,
          etapa_locacao, etapa_filial, etapa_reativacao,
          etapa_conta_grafica, observacoes } = req.body;
  if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });
  const dup = await query('SELECT COUNT(*) as c FROM vision_empresas WHERE LOWER(nome)=LOWER($1)', [nome]);
  if (parseInt(dup.rows[0].c) > 0)
    return res.status(409).json({ error: 'Empresa já cadastrada' });
  const r = await query(
    `INSERT INTO vision_empresas (nome,escritorio,parceiro,certificado,etapa_locacao,etapa_filial,etapa_reativacao,etapa_conta_grafica,observacoes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [nome, escritorio||'', parceiro||'', certificado||'',
     !!etapa_locacao, !!etapa_filial, !!etapa_reativacao, !!etapa_conta_grafica, observacoes||'']
  );
  res.json({ id: r.rows[0].id, message: 'Empresa criada' });
});

router.put('/empresas/:id', async (req, res) => {
  const { nome, escritorio, parceiro, certificado,
          etapa_locacao, etapa_filial, etapa_reativacao,
          etapa_conta_grafica, observacoes } = req.body;
  await query(
    `UPDATE vision_empresas SET nome=$1,escritorio=$2,parceiro=$3,certificado=$4,
     etapa_locacao=$5,etapa_filial=$6,etapa_reativacao=$7,etapa_conta_grafica=$8,
     observacoes=$9,atualizado_em=NOW() WHERE id=$10`,
    [nome, escritorio||'', parceiro||'', certificado||'',
     !!etapa_locacao, !!etapa_filial, !!etapa_reativacao, !!etapa_conta_grafica,
     observacoes||'', req.params.id]
  );
  res.json({ message: 'Empresa atualizada' });
});

router.delete('/empresas/:id', async (req, res) => {
  await query('DELETE FROM vision_empresas WHERE id=$1', [req.params.id]);
  res.json({ message: 'Empresa excluída' });
});

// ── LANÇAMENTOS ───────────────────────────────────────────
router.get('/lancamentos', async (req, res) => {
  const { empresa, tipo, dataInicio, dataFim } = req.query;
  let where = 'WHERE 1=1';
  const params = [];
  let i = 1;
  if (empresa)    { where += ` AND empresa=$${i++}`;    params.push(empresa); }
  if (tipo)       { where += ` AND tipo_movimento=$${i++}`; params.push(tipo); }
  if (dataInicio) { where += ` AND data_nf>=$${i++}`;  params.push(dataInicio); }
  if (dataFim)    { where += ` AND data_nf<=$${i++}`;  params.push(dataFim); }
  const r = await query(`SELECT * FROM vision_lancamentos ${where} ORDER BY data_nf DESC, id DESC`, params);
  res.json(r.rows);
});

router.post('/lancamentos', async (req, res) => {
  const { empresa, tipo_movimento, data_nf, duimp_processo,
          parceiro, data_exoneracao, percentual, valor, valor_ajustado } = req.body;
  if (!empresa || !tipo_movimento || !data_nf || valor == null)
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  const r = await query(
    `INSERT INTO vision_lancamentos (empresa,tipo_movimento,data_nf,duimp_processo,parceiro,data_exoneracao,percentual,valor,valor_ajustado)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [empresa, tipo_movimento, data_nf, duimp_processo||null, parceiro||null,
     data_exoneracao||null, percentual??null, valor, valor_ajustado??valor]
  );
  res.json({ id: r.rows[0].id, message: 'Lançamento criado' });
});

router.put('/lancamentos/:id', async (req, res) => {
  const { empresa, tipo_movimento, data_nf, duimp_processo,
          parceiro, data_exoneracao, percentual, valor, valor_ajustado } = req.body;
  await query(
    `UPDATE vision_lancamentos SET empresa=$1,tipo_movimento=$2,data_nf=$3,duimp_processo=$4,
     parceiro=$5,data_exoneracao=$6,percentual=$7,valor=$8,valor_ajustado=$9 WHERE id=$10`,
    [empresa, tipo_movimento, data_nf, duimp_processo||null, parceiro||null,
     data_exoneracao||null, percentual??null, valor, valor_ajustado??valor, req.params.id]
  );
  res.json({ message: 'Lançamento atualizado' });
});

router.delete('/lancamentos/:id', async (req, res) => {
  await query('DELETE FROM vision_lancamentos WHERE id=$1', [req.params.id]);
  res.json({ message: 'Lançamento excluído' });
});

// ── SALDO ─────────────────────────────────────────────────
router.get('/saldo', async (req, res) => {
  const { empresa, parceiro, situacao } = req.query;
  let where = 'WHERE 1=1';
  const params = [];
  let i = 1;
  if (empresa)  { where += ` AND e.nome=$${i++}`;     params.push(empresa); }
  if (parceiro) { where += ` AND e.parceiro=$${i++}`; params.push(parceiro); }

  const r = await query(`
    SELECT
      e.id, e.nome, e.escritorio, e.parceiro, e.certificado,
      e.etapa_locacao, e.etapa_filial, e.etapa_reativacao, e.etapa_conta_grafica,
      COALESCE(SUM(CASE WHEN l.tipo_movimento='Créditos Reconhecidos e Cedidos' THEN l.valor_ajustado ELSE 0 END),0) AS creditos,
      COALESCE(SUM(CASE WHEN l.tipo_movimento='Débitos de Liquidações'          THEN l.valor_ajustado ELSE 0 END),0) AS debitos_liq,
      COALESCE(SUM(CASE WHEN l.tipo_movimento='Débitos de Transferências'       THEN l.valor_ajustado ELSE 0 END),0) AS debitos_trans
    FROM vision_empresas e
    LEFT JOIN vision_lancamentos l ON l.empresa = e.nome
    ${where}
    GROUP BY e.id,e.nome,e.escritorio,e.parceiro,e.certificado,
             e.etapa_locacao,e.etapa_filial,e.etapa_reativacao,e.etapa_conta_grafica
    ORDER BY e.nome
  `, params);

  const rows = r.rows.map(row => {
    const saldo = parseFloat(row.creditos) - parseFloat(row.debitos_liq) - parseFloat(row.debitos_trans);
    const sit = saldo < 0 ? 'urgente' : saldo < 50000 ? 'alerta' : 'normal';
    return { ...row, saldo, situacao: sit };
  });

  const filtered = situacao ? rows.filter(r => r.situacao === situacao) : rows;
  res.json(filtered);
});

module.exports = router;
