const { Pool } = require('pg');
require('dotenv').config();

const connStr = process.env.URL_DO_BANCO_DE_DADOS || process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connStr,
  ssl: connStr ? { rejectUnauthorized: false } : false
});

async function getPool() {
  return pool;
}

async function query(text, params) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

async function initDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS vision_empresas (
      id                   SERIAL PRIMARY KEY,
      nome                 VARCHAR(500) NOT NULL,
      escritorio           VARCHAR(100),
      parceiro             VARCHAR(100),
      certificado          VARCHAR(10),
      etapa_locacao        BOOLEAN DEFAULT FALSE,
      etapa_filial         BOOLEAN DEFAULT FALSE,
      etapa_reativacao     BOOLEAN DEFAULT FALSE,
      etapa_conta_grafica  BOOLEAN DEFAULT TRUE,
      observacoes          TEXT,
      criado_em            TIMESTAMP DEFAULT NOW(),
      atualizado_em        TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS vision_lancamentos (
      id               SERIAL PRIMARY KEY,
      empresa          VARCHAR(500) NOT NULL,
      tipo_movimento   VARCHAR(100) NOT NULL,
      data_nf          DATE,
      duimp_processo   VARCHAR(100),
      parceiro         VARCHAR(100),
      data_exoneracao  DATE,
      percentual       DECIMAL(10,4),
      valor            DECIMAL(18,2),
      valor_ajustado   DECIMAL(18,2),
      criado_em        TIMESTAMP DEFAULT NOW()
    )
  `);

  const countEmp = await query('SELECT COUNT(*) as total FROM vision_empresas');
  if (parseInt(countEmp.rows[0].total) === 0) await seedEmpresas();

  const countLanc = await query('SELECT COUNT(*) as total FROM vision_lancamentos');
  if (parseInt(countLanc.rows[0].total) === 0) await seedLancamentos();

  console.log('✅ Banco PostgreSQL pronto');
}

async function seedEmpresas() {
  const empresas = [
    ['ADEL COCO BRASIL INDUSTRIA E COMERCIO LTDA','Pitágora','Pitágora','',false,false,false,true],
    ['ARTHRO IMPORTADORA DE MEDICAMENTOS E EQUIPAMENTOS MEDICOS LTDA','Pedro','Pedro','',false,false,false,true],
    ['BLACK BELT NEGOCIOS INTERNACIONAIS LTDA','Pitágora','Pitágora','',false,false,false,true],
    ['BUCKLER GROUP LTDA','Pedro','Pedro','',false,false,false,true],
    ['CLOUD9 IMPORTAÇÃO E DISTRIBUIÇÃO LTDA','Pedro','Pedro','',false,false,false,true],
    ['COLAI HOME LTDA','Pitágora','Pitágora','',false,false,false,true],
    ['ESTRELA DO SUL COMERCIO DE BEBIDAS LTDA','Pedro','Pedro','Sim',false,false,false,true],
    ['FERAMAQ IMPORTAÇÃO E COMÉRCIO LTDA','Pedro','Pedro','',false,false,false,true],
    ['FIXFER DISTRIBUIDORA LTDA','Pedro','Pedro','',false,false,false,true],
    ['GLOBAL ENTERPRISE COMERCIAL ATACADISTA LTDA','Pedro','Pedro','',false,false,false,true],
    ['IRONSIDE GLOBAL TRADING LTDA','Pitágora','Pitágora','',false,false,false,true],
    ['K B F COMÉRCIO DE EQUIPAMENTOS DE INFORMÁTICA LTDA','Pedro','Pedro','',false,false,false,true],
    ['LCG COMERCIO ELETRO LTDA','Pitágora','Pitágora','',false,false,false,true],
    ['MOA COMEX E CONSULTORIA LTDA','Pitágora','Pitágora','',false,false,false,true],
    ['OK CORPORATION BRASIL LTDA','Pitágora','Pitágora','',false,false,false,true],
    ['ONE SOLUCOES EM NEGOCIOS INTERNACIONAIS LTDA','Pedro','Pedro','',false,false,false,true],
    ['PR LIGHT LOCACAO E IMPORT & EXPORT DE ILUMINACAO PROFISSIONAL LTDA','Pedro','Pedro','',false,false,false,true],
    ['PROLIGHT BRASIL LOCACAO E IMPORT & EXPORT DE ILUMINACAO PROFISSIONAL LTDA','Pedro','Pedro','',false,false,false,true],
    ['PROLIGHT LOCACAO E IMPORT & EXPORT DE ILUMINACAO PROFISSIONAL LTDA','Pedro','Pedro','',false,false,false,true],
    ['SEKEL BRASIL TRADING LTDA','Pitágora','Pitágora','',false,false,false,true],
    ['SM COMERCIO, IMPORTACAO E EXPORTACAO LTDA','Pedro','Pedro','',false,false,false,true],
    ['TEMPERALHO TRADING, COMERCIO, IMPORTACAO E EXPORTACAO','Pitágora','Pitágora','',false,false,false,true],
    ['UPPER TRADE IMPORTACAO E EXPORTACAO LTDA','Pitágora','Pitágora','',false,false,false,true],
    ['ZZ2 INDUSTRIA E COMERCIO DE PECAS E ACESSORIOS AUTOMOTIVOS LTDA','Pedro','Pedro','',false,false,false,true],
    ['FPI INDUSTRIAL LTDA','Pedro','Pedro','',false,false,false,true],
    ['GEORGE DO NASCIMENTO SANTOS LTDA','Pedro','Pedro','',false,false,false,true],
    ['EVERTON ALEXANDRE DE A SILVA','Pitágora','Pitágora','Não',false,false,false,true],
    ['KALENA IMPORTACAO, EXPORTACAO E COMERCIO LTDA','Pedro','Pedro','',false,false,false,true],
    ['PARMABRAS COMERCIO DE PRODUTOS ALIMENTICIOS LTDA','Pitágora','Pitágora','',true,true,true,false],
    ['ALTECNA PRODUTOS AUTOMOTORES LTDA','Pedro','Pedro','',false,false,false,true],
  ];
  for (const e of empresas) {
    await query(`INSERT INTO vision_empresas (nome,escritorio,parceiro,certificado,etapa_locacao,etapa_filial,etapa_reativacao,etapa_conta_grafica) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, e);
  }
  console.log('✅ Empresas inseridas');
}

async function seedLancamentos() {
  const L = [
    ['ADEL COCO BRASIL INDUSTRIA E COMERCIO LTDA','Créditos Reconhecidos e Cedidos','2017-02-16','1500005664','Pitágora',30000,30000],
    ['ADEL COCO BRASIL INDUSTRIA E COMERCIO LTDA','Créditos Reconhecidos e Cedidos','2017-03-13','1500008825','Pitágora',30000,30000],
    ['ADEL COCO BRASIL INDUSTRIA E COMERCIO LTDA','Créditos Reconhecidos e Cedidos','2017-04-17','1500013020','Pitágora',25300,25300],
    ['ADEL COCO BRASIL INDUSTRIA E COMERCIO LTDA','Créditos Reconhecidos e Cedidos','2017-07-18','1500024305','Pitágora',85000,85000],
    ['ADEL COCO BRASIL INDUSTRIA E COMERCIO LTDA','Créditos Reconhecidos e Cedidos','2017-09-22','1500034045','Pitágora',162000,162000],
    ['ADEL COCO BRASIL INDUSTRIA E COMERCIO LTDA','Créditos Reconhecidos e Cedidos','2017-11-08','1500040001','Pitágora',131000,131000],
    ['ADEL COCO BRASIL INDUSTRIA E COMERCIO LTDA','Créditos Reconhecidos e Cedidos','2018-02-14','1500052000','Pitágora',100000,100000],
    ['ADEL COCO BRASIL INDUSTRIA E COMERCIO LTDA','Débitos de Liquidações','2023-01-10','DI-2023-001','Pitágora',400000,400000],
    ['ADEL COCO BRASIL INDUSTRIA E COMERCIO LTDA','Débitos de Liquidações','2023-06-15','DI-2023-045','Pitágora',522291.75,522291.75],
    ['ARTHRO IMPORTADORA DE MEDICAMENTOS E EQUIPAMENTOS MEDICOS LTDA','Créditos Reconhecidos e Cedidos','2020-03-10','1700030001','Pedro',400000,400000],
    ['ARTHRO IMPORTADORA DE MEDICAMENTOS E EQUIPAMENTOS MEDICOS LTDA','Créditos Reconhecidos e Cedidos','2021-05-20','1800050022','Pedro',545333.31,545333.31],
    ['ARTHRO IMPORTADORA DE MEDICAMENTOS E EQUIPAMENTOS MEDICOS LTDA','Débitos de Liquidações','2023-02-28','DI-2023-020','Pedro',150712.15,150712.15],
    ['ARTHRO IMPORTADORA DE MEDICAMENTOS E EQUIPAMENTOS MEDICOS LTDA','Débitos de Transferências','2023-07-01','TRANS-001','Pedro',572000,572000],
    ['BLACK BELT NEGOCIOS INTERNACIONAIS LTDA','Créditos Reconhecidos e Cedidos','2022-03-01','1900030001','Pitágora',400000,400000],
    ['BLACK BELT NEGOCIOS INTERNACIONAIS LTDA','Débitos de Liquidações','2023-10-05','DI-2023-400','Pitágora',411763.68,411763.68],
    ['BUCKLER GROUP LTDA','Créditos Reconhecidos e Cedidos','2018-05-10','1500050001','Pedro',1500000,1500000],
    ['BUCKLER GROUP LTDA','Créditos Reconhecidos e Cedidos','2019-02-20','1500070022','Pedro',2000000,2000000],
    ['BUCKLER GROUP LTDA','Créditos Reconhecidos e Cedidos','2020-08-15','1600080015','Pedro',3303331.90,3303331.90],
    ['BUCKLER GROUP LTDA','Débitos de Liquidações','2023-06-01','DI-2023-100','Pedro',6768780.09,6768780.09],
    ['CLOUD9 IMPORTAÇÃO E DISTRIBUIÇÃO LTDA','Créditos Reconhecidos e Cedidos','2022-09-10','2100090001','Pedro',500000,500000],
    ['CLOUD9 IMPORTAÇÃO E DISTRIBUIÇÃO LTDA','Débitos de Liquidações','2023-08-20','DI-2023-200','Pedro',160368.60,160368.60],
    ['COLAI HOME LTDA','Créditos Reconhecidos e Cedidos','2022-01-15','2000010001','Pitágora',400000,400000],
    ['COLAI HOME LTDA','Débitos de Liquidações','2023-05-30','DI-2023-150','Pitágora',285361.66,285361.66],
    ['ESTRELA DO SUL COMERCIO DE BEBIDAS LTDA','Créditos Reconhecidos e Cedidos','2023-01-05','2300010001','Pedro',42000,42000],
    ['ESTRELA DO SUL COMERCIO DE BEBIDAS LTDA','Débitos de Liquidações','2023-09-15','DI-2023-350','Pedro',33795.60,33795.60],
    ['FERAMAQ IMPORTAÇÃO E COMÉRCIO LTDA','Créditos Reconhecidos e Cedidos','2021-06-20','1900060020','Pedro',300000,300000],
    ['FERAMAQ IMPORTAÇÃO E COMÉRCIO LTDA','Débitos de Liquidações','2023-09-01','DI-2023-300','Pedro',291473.31,291473.31],
    ['FIXFER DISTRIBUIDORA LTDA','Créditos Reconhecidos e Cedidos','2020-01-10','1700010001','Pedro',1000000,1000000],
    ['FIXFER DISTRIBUIDORA LTDA','Créditos Reconhecidos e Cedidos','2021-03-15','1800030015','Pedro',594442.46,594442.46],
    ['FIXFER DISTRIBUIDORA LTDA','Débitos de Liquidações','2023-04-10','DI-2023-080','Pedro',1482112.60,1482112.60],
    ['GLOBAL ENTERPRISE COMERCIAL ATACADISTA LTDA','Créditos Reconhecidos e Cedidos','2022-04-01','2100040001','Pedro',676666.66,676666.66],
    ['GLOBAL ENTERPRISE COMERCIAL ATACADISTA LTDA','Débitos de Liquidações','2023-03-20','DI-2023-060','Pedro',65257.11,65257.11],
    ['GLOBAL ENTERPRISE COMERCIAL ATACADISTA LTDA','Débitos de Transferências','2023-10-01','TRANS-002','Pedro',600000,600000],
    ['IRONSIDE GLOBAL TRADING LTDA','Créditos Reconhecidos e Cedidos','2021-06-15','1800060001','Pitágora',1225000,1225000],
    ['IRONSIDE GLOBAL TRADING LTDA','Débitos de Liquidações','2023-09-10','DI-2023-310','Pitágora',915599.02,915599.02],
    ['K B F COMÉRCIO DE EQUIPAMENTOS DE INFORMÁTICA LTDA','Créditos Reconhecidos e Cedidos','2021-11-01','1900110001','Pedro',149999.99,149999.99],
    ['K B F COMÉRCIO DE EQUIPAMENTOS DE INFORMÁTICA LTDA','Débitos de Liquidações','2023-07-25','DI-2023-250','Pedro',123170.32,123170.32],
    ['LCG COMERCIO ELETRO LTDA','Créditos Reconhecidos e Cedidos','2022-06-01','2100060001','Pitágora',160000,160000],
    ['LCG COMERCIO ELETRO LTDA','Débitos de Liquidações','2023-08-15','DI-2023-270','Pitágora',119437.61,119437.61],
    ['MOA COMEX E CONSULTORIA LTDA','Créditos Reconhecidos e Cedidos','2023-02-10','2300020001','Pitágora',90000,90000],
    ['MOA COMEX E CONSULTORIA LTDA','Débitos de Liquidações','2023-09-20','DI-2023-360','Pitágora',17353.29,17353.29],
    ['OK CORPORATION BRASIL LTDA','Créditos Reconhecidos e Cedidos','2022-07-10','2200070001','Pitágora',113500,113500],
    ['OK CORPORATION BRASIL LTDA','Débitos de Liquidações','2023-11-05','DI-2023-450','Pitágora',175749.38,175749.38],
    ['ONE SOLUCOES EM NEGOCIOS INTERNACIONAIS LTDA','Créditos Reconhecidos e Cedidos','2022-01-20','2200010020','Pedro',273000,273000],
    ['ONE SOLUCOES EM NEGOCIOS INTERNACIONAIS LTDA','Débitos de Liquidações','2023-08-01','DI-2023-260','Pedro',132499.38,132499.38],
    ['PR LIGHT LOCACAO E IMPORT & EXPORT DE ILUMINACAO PROFISSIONAL LTDA','Créditos Reconhecidos e Cedidos','2021-09-01','1900090001','Pedro',161333.32,161333.32],
    ['PR LIGHT LOCACAO E IMPORT & EXPORT DE ILUMINACAO PROFISSIONAL LTDA','Débitos de Liquidações','2023-07-15','DI-2023-230','Pedro',135504.68,135504.68],
    ['PROLIGHT BRASIL LOCACAO E IMPORT & EXPORT DE ILUMINACAO PROFISSIONAL LTDA','Créditos Reconhecidos e Cedidos','2021-10-01','1900100001','Pedro',294666.66,294666.66],
    ['PROLIGHT BRASIL LOCACAO E IMPORT & EXPORT DE ILUMINACAO PROFISSIONAL LTDA','Débitos de Liquidações','2023-07-20','DI-2023-240','Pedro',172756.31,172756.31],
    ['PROLIGHT LOCACAO E IMPORT & EXPORT DE ILUMINACAO PROFISSIONAL LTDA','Créditos Reconhecidos e Cedidos','2021-08-15','1900080015','Pedro',187333.33,187333.33],
    ['PROLIGHT LOCACAO E IMPORT & EXPORT DE ILUMINACAO PROFISSIONAL LTDA','Débitos de Liquidações','2023-06-25','DI-2023-180','Pedro',153807.66,153807.66],
    ['PROLIGHT LOCACAO E IMPORT & EXPORT DE ILUMINACAO PROFISSIONAL LTDA','Débitos de Transferências','2023-09-30','TRANS-003','Pedro',100000,100000],
    ['SEKEL BRASIL TRADING LTDA','Créditos Reconhecidos e Cedidos','2019-01-15','1600010001','Pitágora',1500000,1500000],
    ['SEKEL BRASIL TRADING LTDA','Créditos Reconhecidos e Cedidos','2020-03-20','1700030020','Pitágora',2000000,2000000],
    ['SEKEL BRASIL TRADING LTDA','Créditos Reconhecidos e Cedidos','2021-07-10','1800070010','Pitágora',1183071,1183071],
    ['SEKEL BRASIL TRADING LTDA','Débitos de Liquidações','2023-05-10','DI-2023-120','Pitágora',3366408.22,3366408.22],
    ['SEKEL BRASIL TRADING LTDA','Débitos de Transferências','2023-10-15','TRANS-004','Pitágora',1290311.29,1290311.29],
    ['SM COMERCIO, IMPORTACAO E EXPORTACAO LTDA','Créditos Reconhecidos e Cedidos','2021-04-01','1900040001','Pedro',520000,520000],
    ['SM COMERCIO, IMPORTACAO E EXPORTACAO LTDA','Débitos de Liquidações','2023-08-10','DI-2023-265','Pedro',402720.57,402720.57],
    ['TEMPERALHO TRADING, COMERCIO, IMPORTACAO E EXPORTACAO','Créditos Reconhecidos e Cedidos','2018-11-05','1500110001','Pitágora',3000000,3000000],
    ['TEMPERALHO TRADING, COMERCIO, IMPORTACAO E EXPORTACAO','Créditos Reconhecidos e Cedidos','2020-06-10','1700060010','Pitágora',2500000,2500000],
    ['TEMPERALHO TRADING, COMERCIO, IMPORTACAO E EXPORTACAO','Créditos Reconhecidos e Cedidos','2021-09-15','1800090015','Pitágora',2966770.91,2966770.91],
    ['TEMPERALHO TRADING, COMERCIO, IMPORTACAO E EXPORTACAO','Débitos de Liquidações','2023-04-15','DI-2023-100','Pitágora',8184976.64,8184976.64],
    ['UPPER TRADE IMPORTACAO E EXPORTACAO LTDA','Créditos Reconhecidos e Cedidos','2017-09-01','1500090001','Pitágora',8000000,8000000],
    ['UPPER TRADE IMPORTACAO E EXPORTACAO LTDA','Créditos Reconhecidos e Cedidos','2019-04-15','1600040015','Pitágora',7000000,7000000],
    ['UPPER TRADE IMPORTACAO E EXPORTACAO LTDA','Créditos Reconhecidos e Cedidos','2021-01-20','1800010020','Pitágora',7293215.14,7293215.14],
    ['UPPER TRADE IMPORTACAO E EXPORTACAO LTDA','Débitos de Liquidações','2023-03-10','DI-2023-050','Pitágora',22434961.87,22434961.87],
    ['ZZ2 INDUSTRIA E COMERCIO DE PECAS E ACESSORIOS AUTOMOTIVOS LTDA','Créditos Reconhecidos e Cedidos','2023-03-01','2300030001','Pedro',26666.66,26666.66],
    ['ZZ2 INDUSTRIA E COMERCIO DE PECAS E ACESSORIOS AUTOMOTIVOS LTDA','Débitos de Liquidações','2023-10-10','DI-2023-410','Pedro',94283.16,94283.16],
    ['FPI INDUSTRIAL LTDA','Créditos Reconhecidos e Cedidos','2023-06-01','2300060001','Pedro',50000,50000],
    ['FPI INDUSTRIAL LTDA','Débitos de Liquidações','2023-11-01','DI-2023-460','Pedro',5226.72,5226.72],
    ['GEORGE DO NASCIMENTO SANTOS LTDA','Débitos de Liquidações','2023-08-15','DI-2023-275','Pedro',19083.86,19083.86],
    ['EVERTON ALEXANDRE DE A SILVA','Créditos Reconhecidos e Cedidos','2023-04-01','2300040001','Pitágora',40000,40000],
  ];
  for (const l of L) {
    await query(`INSERT INTO vision_lancamentos (empresa,tipo_movimento,data_nf,duimp_processo,parceiro,valor,valor_ajustado) VALUES ($1,$2,$3,$4,$5,$6,$7)`, l);
  }
  console.log('✅ Lançamentos inseridos');
}

module.exports = { getPool, query, initDatabase };
