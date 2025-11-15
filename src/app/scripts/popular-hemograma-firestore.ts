/**
 * Script para popular o Hemograma Completo no Firestore
 * 
 * Execute este script no console do navegador após fazer login no Firebase:
 * 1. Abra o projeto no navegador (ng serve)
 * 2. Abra o DevTools (F12)
 * 3. Cole e execute este código no console
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// Configure suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function popularHemograma() {
  console.log('🔄 Iniciando população do Hemograma Completo...');

  try {
    // 1. Criar o Tipo de Exame: Hemograma
    const exameRef = await addDoc(collection(db, 'exames'), {
      nome: 'Hemograma Completo',
      codigo: 'HEM',
      categoria: 'hematologia',
      ativo: true,
      ordem: 1,
      dataCriacao: Timestamp.now(),
      dataAtualizacao: Timestamp.now()
    });

    console.log('✅ Tipo de Exame criado:', exameRef.id);

    // 2. Adicionar Parâmetros do ERITROGRAMA
    const parametrosEritrograma = [
      { nome: 'Hemácias', unidade: 'milhões/mm³', ordem: 1, grupo: 'eritrograma' },
      { nome: 'Hemoglobina', unidade: 'g/dL', ordem: 2, grupo: 'eritrograma' },
      { nome: 'Hematócrito', unidade: '%', ordem: 3, grupo: 'eritrograma' },
      { nome: 'VCM', unidade: 'fL', ordem: 4, grupo: 'eritrograma' },
      { nome: 'HCM', unidade: 'pg', ordem: 5, grupo: 'eritrograma' },
      { nome: 'CHCM', unidade: 'g/dL', ordem: 6, grupo: 'eritrograma' },
      { nome: 'RDW', unidade: '%', ordem: 7, grupo: 'eritrograma' }
    ];

    // 3. Adicionar Parâmetros do LEUCOGRAMA
    const parametrosLeucograma = [
      { nome: 'Leucócitos', unidade: '/mm³', ordem: 8, grupo: 'leucograma' },
      { nome: 'Neutrófilos', unidade: '%', ordem: 9, grupo: 'leucograma' },
      { nome: 'Linfócitos', unidade: '%', ordem: 10, grupo: 'leucograma' },
      { nome: 'Monócitos', unidade: '%', ordem: 11, grupo: 'leucograma' },
      { nome: 'Eosinófilos', unidade: '%', ordem: 12, grupo: 'leucograma' },
      { nome: 'Basófilos', unidade: '%', ordem: 13, grupo: 'leucograma' }
    ];

    // 4. Adicionar Parâmetros de PLAQUETAS
    const parametrosPlaquetas = [
      { nome: 'Plaquetas', unidade: '/mm³', ordem: 14, grupo: 'plaquetas' }
    ];

    const todosParametros = [
      ...parametrosEritrograma,
      ...parametrosLeucograma,
      ...parametrosPlaquetas
    ];

    console.log('🔄 Adicionando parâmetros...');

    for (const param of todosParametros) {
      const parametroRef = await addDoc(
        collection(db, `exames/${exameRef.id}/parametros`),
        {
          ...param,
          tipo: 'numerico',
          obrigatorio: true
        }
      );

      console.log(`  ✅ Parâmetro "${param.nome}" criado:`, parametroRef.id);

      // 5. Adicionar Valores de Referência para cada parâmetro
      const valoresReferencia = obterValoresReferencia(param.nome);

      for (const ref of valoresReferencia) {
        await addDoc(
          collection(db, `exames/${exameRef.id}/parametros/${parametroRef.id}/valoresReferencia`),
          ref
        );
      }

      console.log(`    ✅ Valores de referência adicionados para "${param.nome}"`);
    }

    console.log('\n🎉 Hemograma Completo populado com sucesso!');
    console.log(`📋 Exame ID: ${exameRef.id}`);
    console.log(`📊 Total de parâmetros: ${todosParametros.length}`);

  } catch (error) {
    console.error('❌ Erro ao popular hemograma:', error);
  }
}

/**
 * Retorna os valores de referência para cada parâmetro
 */
function obterValoresReferencia(parametro: string): any[] {
  const referencias: Record<string, any[]> = {
    'Hemácias': [
      { sexo: 'M', idadeMin: 18, valorMin: 4.5, valorMax: 6.0, ativo: true },
      { sexo: 'F', idadeMin: 18, valorMin: 4.0, valorMax: 5.4, ativo: true }
    ],
    'Hemoglobina': [
      { sexo: 'M', idadeMin: 18, valorMin: 13.0, valorMax: 17.0, ativo: true },
      { sexo: 'F', idadeMin: 18, valorMin: 12.0, valorMax: 16.0, ativo: true }
    ],
    'Hematócrito': [
      { sexo: 'M', idadeMin: 18, valorMin: 40, valorMax: 54, ativo: true },
      { sexo: 'F', idadeMin: 18, valorMin: 37, valorMax: 47, ativo: true }
    ],
    'VCM': [
      { sexo: 'ambos', idadeMin: 18, valorMin: 80, valorMax: 100, ativo: true }
    ],
    'HCM': [
      { sexo: 'ambos', idadeMin: 18, valorMin: 27, valorMax: 32, ativo: true }
    ],
    'CHCM': [
      { sexo: 'ambos', idadeMin: 18, valorMin: 32, valorMax: 36, ativo: true }
    ],
    'RDW': [
      { sexo: 'ambos', idadeMin: 18, valorMin: 11, valorMax: 15, ativo: true }
    ],
    'Leucócitos': [
      { sexo: 'ambos', idadeMin: 18, valorMin: 4000, valorMax: 11000, ativo: true }
    ],
    'Neutrófilos': [
      { sexo: 'ambos', idadeMin: 18, valorMin: 40, valorMax: 75, ativo: true }
    ],
    'Linfócitos': [
      { sexo: 'ambos', idadeMin: 18, valorMin: 20, valorMax: 50, ativo: true }
    ],
    'Monócitos': [
      { sexo: 'ambos', idadeMin: 18, valorMin: 2, valorMax: 10, ativo: true }
    ],
    'Eosinófilos': [
      { sexo: 'ambos', idadeMin: 18, valorMin: 1, valorMax: 6, ativo: true }
    ],
    'Basófilos': [
      { sexo: 'ambos', idadeMin: 18, valorMin: 0, valorMax: 2, ativo: true }
    ],
    'Plaquetas': [
      { sexo: 'ambos', idadeMin: 18, valorMin: 150000, valorMax: 450000, ativo: true }
    ]
  };

  return referencias[parametro] || [];
}

// Executar o script
popularHemograma();
