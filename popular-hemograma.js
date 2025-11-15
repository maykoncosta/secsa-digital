/**
 * Script para popular o Hemograma Completo no Firestore
 * Execute: node popular-hemograma.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

// Importe suas credenciais do environment
const firebaseConfig = {
  apiKey: "AIzaSyDApkai6bnVvP47uNgkN86m_EQqgOhHqLE",
  authDomain: "secsa-digital.firebaseapp.com",
  projectId: "secsa-digital",
  storageBucket: "secsa-digital.firebasestorage.app",
  messagingSenderId: "598840806856",
  appId: "1:598840806856:web:fe0aebe3de2e87dceeba67"
};

async function popularHemograma() {
  console.log('🔄 Iniciando população do Hemograma Completo...\n');

  try {
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

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

    // 2. Definir todos os parâmetros
    const parametros = [
      // ERITROGRAMA
      { nome: 'Hemácias', unidade: 'milhões/mm³', ordem: 1, grupo: 'eritrograma' },
      { nome: 'Hemoglobina', unidade: 'g/dL', ordem: 2, grupo: 'eritrograma' },
      { nome: 'Hematócrito', unidade: '%', ordem: 3, grupo: 'eritrograma' },
      { nome: 'VCM', unidade: 'fL', ordem: 4, grupo: 'eritrograma' },
      { nome: 'HCM', unidade: 'pg', ordem: 5, grupo: 'eritrograma' },
      { nome: 'CHCM', unidade: 'g/dL', ordem: 6, grupo: 'eritrograma' },
      { nome: 'RDW', unidade: '%', ordem: 7, grupo: 'eritrograma' },
      // LEUCOGRAMA
      { nome: 'Leucócitos', unidade: '/mm³', ordem: 8, grupo: 'leucograma' },
      { nome: 'Neutrófilos', unidade: '%', ordem: 9, grupo: 'leucograma' },
      { nome: 'Linfócitos', unidade: '%', ordem: 10, grupo: 'leucograma' },
      { nome: 'Monócitos', unidade: '%', ordem: 11, grupo: 'leucograma' },
      { nome: 'Eosinófilos', unidade: '%', ordem: 12, grupo: 'leucograma' },
      { nome: 'Basófilos', unidade: '%', ordem: 13, grupo: 'leucograma' },
      // PLAQUETAS
      { nome: 'Plaquetas', unidade: '/mm³', ordem: 14, grupo: 'plaquetas' }
    ];

    // 3. Valores de referência por parâmetro
    const valoresReferencia = {
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

    console.log(`\n🔄 Adicionando ${parametros.length} parâmetros...\n`);

    // 4. Adicionar cada parâmetro com seus valores de referência
    for (const param of parametros) {
      const parametroRef = await addDoc(
        collection(db, `exames/${exameRef.id}/parametros`),
        {
          ...param,
          tipo: 'numerico',
          obrigatorio: true
        }
      );

      console.log(`  ✅ ${param.grupo.toUpperCase()}: ${param.nome}`);

      // Adicionar valores de referência
      const refs = valoresReferencia[param.nome] || [];
      for (const ref of refs) {
        await addDoc(
          collection(db, `exames/${exameRef.id}/parametros/${parametroRef.id}/valoresReferencia`),
          ref
        );
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 HEMOGRAMA COMPLETO POPULADO COM SUCESSO!');
    console.log('='.repeat(60));
    console.log(`\n📋 Exame ID: ${exameRef.id}`);
    console.log(`📊 Total de parâmetros: ${parametros.length}`);
    console.log(`🔬 Eritrograma: 7 parâmetros`);
    console.log(`🩸 Leucograma: 6 parâmetros`);
    console.log(`💉 Plaquetas: 1 parâmetro`);
    console.log(`\n✅ Você pode agora usar o hemograma no sistema!\n`);

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erro ao popular hemograma:', error);
    console.error('\nDetalhes do erro:', error.message);
    process.exit(1);
  }
}

// Executar
popularHemograma();
