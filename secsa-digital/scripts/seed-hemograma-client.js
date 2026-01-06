/**
 * Script para criar o Schema de Hemograma Completo no Firebase
 * Usando Firebase Client SDK (mesmas credenciais do app web)
 * 
 * Para executar:
 * 1. npm install firebase
 * 2. node scripts/seed-hemograma-client.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, limit, serverTimestamp } = require('firebase/firestore');
const { getAuth, signInAnonymously } = require('firebase/auth');

// Configuração do Firebase (mesmas credenciais do app Angular)
const firebaseConfig = {
  apiKey: "AIzaSyCNvR4GrOPajeMYM6GQSir8hpd0HCSSJ84",
  authDomain: "secsa-digital.firebaseapp.com",
  projectId: "secsa-digital",
  storageBucket: "secsa-digital.firebasestorage.app",
  messagingSenderId: "760024363855",
  appId: "1:760024363855:web:bd3f91f4411202ff450b3a",
  measurementId: "G-DGS9B2365V"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Schema do Hemograma Completo
const hemogramaCompleto = {
  nome: "Hemograma Completo",
  categoria: "Hematologia",
  ativo: true,
  observacoes: "Exame de sangue que avalia a quantidade e qualidade das células sanguíneas (hemácias, leucócitos e plaquetas)",
  parametros: [
    // ===== SÉRIE VERMELHA (ERITROGRAMA) =====
    {
      id: "hemacias",
      label: "Hemácias",
      unidade: "milhões/mm³",
      tipo: "number",
      obrigatorio: true,
      grupo: "Série Vermelha",
      isCalculado: false,
      min: 3.5,
      max: 6.5
    },
    {
      id: "hemoglobina",
      label: "Hemoglobina",
      unidade: "g/dL",
      tipo: "number",
      obrigatorio: true,
      grupo: "Série Vermelha",
      isCalculado: false,
      min: 11.0,
      max: 18.0
    },
    {
      id: "hematocrito",
      label: "Hematócrito",
      unidade: "%",
      tipo: "number",
      obrigatorio: true,
      grupo: "Série Vermelha",
      isCalculado: false,
      min: 35.0,
      max: 54.0
    },
    {
      id: "vcm",
      label: "VCM (Volume Corpuscular Médio)",
      unidade: "fL",
      tipo: "number",
      obrigatorio: true,
      grupo: "Série Vermelha",
      isCalculado: true,
      formula: "(hematocrito / hemacias) * 10",
      min: 80.0,
      max: 100.0
    },
    {
      id: "hcm",
      label: "HCM (Hemoglobina Corpuscular Média)",
      unidade: "pg",
      tipo: "number",
      obrigatorio: true,
      grupo: "Série Vermelha",
      isCalculado: true,
      formula: "(hemoglobina / hemacias) * 10",
      min: 27.0,
      max: 33.0
    },
    {
      id: "chcm",
      label: "CHCM (Concentração de Hemoglobina Corpuscular Média)",
      unidade: "g/dL",
      tipo: "number",
      obrigatorio: true,
      grupo: "Série Vermelha",
      isCalculado: true,
      formula: "(hemoglobina / hematocrito) * 100",
      min: 32.0,
      max: 36.0
    },
    {
      id: "rdw",
      label: "RDW (Amplitude de Distribuição dos Eritrócitos)",
      unidade: "%",
      tipo: "number",
      obrigatorio: true,
      grupo: "Série Vermelha",
      isCalculado: false,
      min: 11.0,
      max: 15.0
    },

    // ===== SÉRIE BRANCA (LEUCOGRAMA) =====
    {
      id: "leucocitos",
      label: "Leucócitos Totais",
      unidade: "/mm³",
      tipo: "number",
      obrigatorio: true,
      grupo: "Série Branca",
      isCalculado: false,
      min: 4000,
      max: 11000
    },
    {
      id: "neutrofilos_segmentados",
      label: "Neutrófilos Segmentados",
      unidade: "%",
      tipo: "number",
      obrigatorio: true,
      grupo: "Série Branca",
      isCalculado: false,
      min: 40.0,
      max: 75.0
    },
    {
      id: "neutrofilos_segmentados_abs",
      label: "Neutrófilos Segmentados (Absoluto)",
      unidade: "/mm³",
      tipo: "number",
      obrigatorio: true,
      grupo: "Série Branca",
      isCalculado: true,
      formula: "(leucocitos * neutrofilos_segmentados) / 100"
    },
    {
      id: "neutrofilos_bastonetes",
      label: "Neutrófilos Bastonetes",
      unidade: "%",
      tipo: "number",
      obrigatorio: true,
      grupo: "Série Branca",
      isCalculado: false,
      min: 0.0,
      max: 5.0
    },
    {
      id: "neutrofilos_bastonetes_abs",
      label: "Neutrófilos Bastonetes (Absoluto)",
      unidade: "/mm³",
      tipo: "number",
      obrigatorio: true,
      grupo: "Série Branca",
      isCalculado: true,
      formula: "(leucocitos * neutrofilos_bastonetes) / 100"
    },
    {
      id: "eosinofilos",
      label: "Eosinófilos",
      unidade: "%",
      tipo: "number",
      obrigatorio: true,
      grupo: "Série Branca",
      isCalculado: false,
      min: 1.0,
      max: 4.0
    },
    {
      id: "eosinofilos_abs",
      label: "Eosinófilos (Absoluto)",
      unidade: "/mm³",
      tipo: "number",
      obrigatorio: true,
      grupo: "Série Branca",
      isCalculado: true,
      formula: "(leucocitos * eosinofilos) / 100"
    },
    {
      id: "basofilos",
      label: "Basófilos",
      unidade: "%",
      tipo: "number",
      obrigatorio: true,
      grupo: "Série Branca",
      isCalculado: false,
      min: 0.0,
      max: 1.0
    },
    {
      id: "basofilos_abs",
      label: "Basófilos (Absoluto)",
      unidade: "/mm³",
      tipo: "number",
      obrigatorio: true,
      grupo: "Série Branca",
      isCalculado: true,
      formula: "(leucocitos * basofilos) / 100"
    },
    {
      id: "linfocitos",
      label: "Linfócitos",
      unidade: "%",
      tipo: "number",
      obrigatorio: true,
      grupo: "Série Branca",
      isCalculado: false,
      min: 20.0,
      max: 45.0
    },
    {
      id: "linfocitos_abs",
      label: "Linfócitos (Absoluto)",
      unidade: "/mm³",
      tipo: "number",
      obrigatorio: true,
      grupo: "Série Branca",
      isCalculado: true,
      formula: "(leucocitos * linfocitos) / 100"
    },
    {
      id: "monocitos",
      label: "Monócitos",
      unidade: "%",
      tipo: "number",
      obrigatorio: true,
      grupo: "Série Branca",
      isCalculado: false,
      min: 2.0,
      max: 10.0
    },
    {
      id: "monocitos_abs",
      label: "Monócitos (Absoluto)",
      unidade: "/mm³",
      tipo: "number",
      obrigatorio: true,
      grupo: "Série Branca",
      isCalculado: true,
      formula: "(leucocitos * monocitos) / 100"
    },

    // ===== PLAQUETAS =====
    {
      id: "plaquetas",
      label: "Plaquetas",
      unidade: "/mm³",
      tipo: "number",
      obrigatorio: true,
      grupo: "Plaquetas",
      isCalculado: false,
      min: 150000,
      max: 450000
    },
    {
      id: "mpv",
      label: "MPV (Volume Plaquetário Médio)",
      unidade: "fL",
      tipo: "number",
      obrigatorio: false,
      grupo: "Plaquetas",
      isCalculado: false,
      min: 7.0,
      max: 11.0
    }
  ],
  criadoEm: serverTimestamp(),
  atualizadoEm: serverTimestamp(),
  criadoPor: "system-seed"
};

// Função para verificar conexão
async function checkConnection() {
  try {
    console.log('🔍 Verificando conexão com Firebase...\n');
    
    const testQuery = query(collection(db, 'schemas-exames'), limit(1));
    const snapshot = await getDocs(testQuery);
    
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log(`📊 Documentos existentes na coleção: ${snapshot.size}\n`);
    
    return true;
  } catch (error) {
    console.error('\n❌ ERRO DE CONEXÃO!\n');
    console.error('Detalhes:', error.message);
    console.error('\n💡 Dica: Verifique se as credenciais do Firebase estão corretas.\n');
    
    return false;
  }
}

// Função principal
async function seedHemograma() {
  try {
    console.log('🔐 Autenticando anonimamente...\n');
    
    // Fazer login anônimo (permitido pelas regras do Firebase)
    await signInAnonymously(auth);
    console.log('✅ Autenticado com sucesso!\n');

    // Verificar conexão
    const isConnected = await checkConnection();
    if (!isConnected) {
      process.exit(1);
    }

    console.log('🔬 Criando Schema de Hemograma Completo...\n');

    // Adicionar à coleção schemas-exames
    const docRef = await addDoc(collection(db, 'schemas-exames'), hemogramaCompleto);

    console.log('✅ Schema criado com sucesso!');
    console.log(`📄 ID do documento: ${docRef.id}`);
    console.log(`📊 Parâmetros criados: ${hemogramaCompleto.parametros.length}`);
    console.log('\nDetalhes dos grupos:');
    
    const grupos = {};
    hemogramaCompleto.parametros.forEach(param => {
      const grupo = param.grupo || 'Sem grupo';
      grupos[grupo] = (grupos[grupo] || 0) + 1;
    });

    Object.entries(grupos).forEach(([grupo, count]) => {
      console.log(`  - ${grupo}: ${count} parâmetros`);
    });

    console.log('\n🎉 Seed concluído com sucesso!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Erro ao criar schema:', error.message);
    console.error('\nErro completo:', error);
    
    if (error.code === 'permission-denied') {
      console.error('\n💡 Dica: Verifique as regras do Firestore.');
      console.error('As regras devem permitir autenticação anônima ou autenticação de usuários.');
    }
    
    process.exit(1);
  }
}

// Executar
seedHemograma();
