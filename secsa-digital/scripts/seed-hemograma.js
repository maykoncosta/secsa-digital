/**
 * Script para criar o Schema de Hemograma Completo no Firebase
 * 
 * Para executar:
 * 1. Configure as credenciais do Firebase no .env ou diretamente no código
 * 2. Execute: node scripts/seed-hemograma.js
 */

const admin = require('firebase-admin');

// Configuração do Firebase Admin SDK
// ATENÇÃO: Substitua com suas credenciais reais ou use variáveis de ambiente
const serviceAccount = {
  type: "service_account",
  project_id: "secsa-digital",
  private_key_id: "38d48b79dc241b294848cba8a7b9cd9983d20ac5",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCrAK4OO+hI0Ry8\nZhr8YKZ8dlRpSbtXxur+LTpGSbAxR7y3GXvhaXoPJh5Hf9Pbm/khQTZBFbhu7hCr\nyWEuCXyMhrbYFux8T/C30z+riBoq1BC0sFMXX1tvMkQvyHjbTo0PwWpGxDcH3ix9\n2M528qnsixs0ubEHlBYK5CRG/VgE69uW7quSBC2aiwoPXv0H4pUTtQjVO2Co/zl8\nDDpHQ2gy7/2KeILX28pVFjGMtEy557C+n9Q0cdTSOuXpIwJXPS8/wcCNdkGh7KYB\nVB+/wS77gAEzUtiCsP0i4X8x8/0RQw2tubZ8dQ/FOQT3dU6eme2wLm75M3CjRl4F\ny34nA8TdAgMBAAECggEAQg/4rjIRqnPy1IvjuAWEvAeg064y7JXB+iEx5q6YHWm3\n68qyE6LCj3Cr+PZWu/w1UlYVpi5EesKI+TzKyNTMY6O1pqSwhtQBTJsVeWiSp2IW\n9B88coaZ1csHEaiynBLsJx6TNrSeB/GaoaGtHcHgyKvy/jsQu7tHiryZkT1VkEyF\nS0wWyddffJ8H7Qn3Zyg8WdN9YD6Vu6Zd8Ou+vHhTn5NtLuqIa65ZukPGMVsPSi/t\nT7i9Wh0FsxKXwbFyi7PhojKqoFjyE1p/JY7JVp4Eh3hfwa3ZbgJniU/t/fZcn5Lu\n+Sp9e5Y+AdGZ9rUAoQQ/JdU+ab4+3Fhz35PhQgqB9wKBgQDr9oKD1z1mF2zm3etp\nYtKiuwysQfBDp4p9J0fmO+ZsebANeVxSAZ2BmccFgyMK7639EmygZGfxHlVDhFp2\ndfQsck7/Gdv9/GOqS26lyUWIpZEwDHyKRw3PXRBoXQZzP2X5PYWrg8W9+C+G9Zw5\nkViUVrUcY8em3+9Sit/cIv3BqwKBgQC5hgdGaaXUKAFzmgW9UmMFIyfsGetOFT9k\nqMDqCBD7TMldyO3jZKbKBvs5bvHT0sHNrqLjyLwM56NWSK6t+TGe0ToQZP2/u6w8\nYtvlqb7h8PQWcrsI3dpR1k2qfx7s8gbVX7PEDQGMO5tZJhoalmOzOh18O1V3dk9S\nn0SAcTyblwKBgBFmp29TkyqRNa281dx6ti/b/W5CmpZSp6rdF7dJ2Y9MVghYV8+Q\nYO4qyfuFFTN8Q2dzUWFuph+o7f7Bpu4veqdAcsTrQkbzsuHfGDTPp/oQw6k4coK8\nBK+zHD+mBJDBLyL3P4FLgWyl/dNFD5VLO64MyuRiE1oiD4MVzLZuOiprAoGAVULy\nfvq4umr0V9N2Rc7iMQ86Hri+unDrZHBl0GiKnWNpu89G/NVaDcjtljSVsPrQFJ3o\nwHSVb/zYxSO8G7pFgq63V6eCMqamfk4Ur1S2pBHfq51otad32Vp68Rtg9BY6678C\n19v+VRtjxrHLF2L8SPcxa9G88p0N0XPewITKDNsCgYAQd4pwmc2x4fMR7KKdi8XG\nLap+Z/7lISzGZHaRuFpdFh6ZDAnjZ++kNmWi5+xhjsVYZk1xX7TRLSjJwJx5VTY8\nk5rbUeA/daIZp9XNBzh5JRvTv2iNzNgKKdKt6f6pykJXVcK+4oJ72wQ2whVMVYOV\nPu6zIt8iIbWusgw+cAWoxw==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@secsa-digital.iam.gserviceaccount.com",
  client_id: "115904401033349938726",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40secsa-digital.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

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
  criadoEm: admin.firestore.FieldValue.serverTimestamp(),
  atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
  criadoPor: "system-seed"
};

// Função para verificar permissões
async function checkPermissions() {
  try {
    console.log('🔍 Verificando conexão e permissões...\n');
    
    // Tentar ler a coleção para verificar permissões
    const testQuery = await db.collection('schemas-exames').limit(1).get();
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log(`📊 Documentos existentes na coleção: ${testQuery.size}\n`);
    
    return true;
  } catch (error) {
    console.error('\n❌ ERRO DE PERMISSÕES!\n');
    console.error('Detalhes:', error.message);
    console.error('\n📋 SOLUÇÃO:\n');
    console.error('1. Acesse o Firebase Console: https://console.firebase.google.com/');
    console.error(`2. Selecione o projeto: ${serviceAccount.project_id}`);
    console.error('3. Vá em "Firestore Database"');
    console.error('4. Clique na aba "Regras"');
    console.error('5. Configure as regras temporariamente para permitir escrita:\n');
    console.error('   rules_version = \'2\';');
    console.error('   service cloud.firestore {');
    console.error('     match /databases/{database}/documents {');
    console.error('       match /{document=**} {');
    console.error('         allow read, write: if true; // APENAS PARA DESENVOLVIMENTO');
    console.error('       }');
    console.error('     }');
    console.error('   }\n');
    console.error('6. Clique em "Publicar"');
    console.error('7. Execute o script novamente\n');
    console.error('⚠️  IMPORTANTE: Após popular o banco, configure regras de segurança adequadas!\n');
    
    return false;
  }
}

// Função principal
async function seedHemograma() {
  try {
    // Verificar permissões primeiro
    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      process.exit(1);
    }

    console.log('🔬 Criando Schema de Hemograma Completo...\n');

    // Adicionar à coleção schemas-exames
    const docRef = await db.collection('schemas-exames').add(hemogramaCompleto);

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
    console.log('\n⚠️  Lembre-se de configurar regras de segurança apropriadas no Firestore!');
    
  } catch (error) {
    console.error('\n❌ Erro ao criar schema:', error.message);
    
    if (error.code === 7 || error.message.includes('permission')) {
      console.error('\n💡 Dica: Execute o script novamente após configurar as regras do Firestore.');
    }
    
    process.exit(1);
  } finally {
    // Encerrar conexão
    await admin.app().delete();
  }
}

// Executar
seedHemograma();
