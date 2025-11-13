/**
 * Script para popular valores de referência no Firestore
 * Execute este arquivo uma vez para cadastrar os valores iniciais
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { environment } from '../../environments/environment';

const app = initializeApp(environment.firebase);
const db = getFirestore(app);

const valoresReferencia = [
  // HEMOGRAMA - Valores Adultos
  {
    tipoExame: 'hemograma',
    parametro: 'Hemácias',
    unidade: 'milhões/mm³',
    valorMinimo: 4.5,
    valorMaximo: 6.5,
    sexo: 'M',
    ativo: true
  },
  {
    tipoExame: 'hemograma',
    parametro: 'Hemácias',
    unidade: 'milhões/mm³',
    valorMinimo: 4.0,
    valorMaximo: 5.5,
    sexo: 'F',
    ativo: true
  },
  {
    tipoExame: 'hemograma',
    parametro: 'Hemoglobina',
    unidade: 'g/dL',
    valorMinimo: 13.5,
    valorMaximo: 17.5,
    sexo: 'M',
    ativo: true
  },
  {
    tipoExame: 'hemograma',
    parametro: 'Hemoglobina',
    unidade: 'g/dL',
    valorMinimo: 12.0,
    valorMaximo: 16.0,
    sexo: 'F',
    ativo: true
  },
  {
    tipoExame: 'hemograma',
    parametro: 'Hematócrito',
    unidade: '%',
    valorMinimo: 40,
    valorMaximo: 54,
    sexo: 'M',
    ativo: true
  },
  {
    tipoExame: 'hemograma',
    parametro: 'Hematócrito',
    unidade: '%',
    valorMinimo: 35,
    valorMaximo: 47,
    sexo: 'F',
    ativo: true
  },
  {
    tipoExame: 'hemograma',
    parametro: 'VCM',
    unidade: 'fL',
    valorMinimo: 80,
    valorMaximo: 100,
    sexo: 'ambos',
    ativo: true
  },
  {
    tipoExame: 'hemograma',
    parametro: 'HCM',
    unidade: 'pg',
    valorMinimo: 27,
    valorMaximo: 32,
    sexo: 'ambos',
    ativo: true
  },
  {
    tipoExame: 'hemograma',
    parametro: 'CHCM',
    unidade: 'g/dL',
    valorMinimo: 32,
    valorMaximo: 36,
    sexo: 'ambos',
    ativo: true
  },
  {
    tipoExame: 'hemograma',
    parametro: 'RDW',
    unidade: '%',
    valorMinimo: 11.5,
    valorMaximo: 14.5,
    sexo: 'ambos',
    ativo: true
  },
  {
    tipoExame: 'hemograma',
    parametro: 'Leucócitos',
    unidade: '/mm³',
    valorMinimo: 4000,
    valorMaximo: 11000,
    sexo: 'ambos',
    ativo: true
  },
  {
    tipoExame: 'hemograma',
    parametro: 'Neutrófilos',
    unidade: '%',
    valorMinimo: 40,
    valorMaximo: 75,
    sexo: 'ambos',
    ativo: true
  },
  {
    tipoExame: 'hemograma',
    parametro: 'Linfócitos',
    unidade: '%',
    valorMinimo: 20,
    valorMaximo: 50,
    sexo: 'ambos',
    ativo: true
  },
  {
    tipoExame: 'hemograma',
    parametro: 'Monócitos',
    unidade: '%',
    valorMinimo: 2,
    valorMaximo: 10,
    sexo: 'ambos',
    ativo: true
  },
  {
    tipoExame: 'hemograma',
    parametro: 'Eosinófilos',
    unidade: '%',
    valorMinimo: 1,
    valorMaximo: 6,
    sexo: 'ambos',
    ativo: true
  },
  {
    tipoExame: 'hemograma',
    parametro: 'Basófilos',
    unidade: '%',
    valorMinimo: 0,
    valorMaximo: 2,
    sexo: 'ambos',
    ativo: true
  },
  {
    tipoExame: 'hemograma',
    parametro: 'Plaquetas',
    unidade: '/mm³',
    valorMinimo: 150000,
    valorMaximo: 450000,
    sexo: 'ambos',
    ativo: true
  },

  // URINA - Valores qualitativos (negativos são normais)
  {
    tipoExame: 'urina',
    parametro: 'pH',
    unidade: '',
    valorMinimo: 4.5,
    valorMaximo: 8.0,
    sexo: 'ambos',
    ativo: true
  },
  {
    tipoExame: 'urina',
    parametro: 'Densidade',
    unidade: '',
    valorMinimo: 1.005,
    valorMaximo: 1.030,
    sexo: 'ambos',
    ativo: true
  },
  {
    tipoExame: 'urina',
    parametro: 'Leucócitos',
    unidade: 'p/campo',
    valorMinimo: 0,
    valorMaximo: 5,
    sexo: 'ambos',
    ativo: true
  },
  {
    tipoExame: 'urina',
    parametro: 'Hemácias',
    unidade: 'p/campo',
    valorMinimo: 0,
    valorMaximo: 3,
    sexo: 'ambos',
    ativo: true
  },

  // FEZES - Valores qualitativos
  {
    tipoExame: 'fezes',
    parametro: 'pH',
    unidade: '',
    valorMinimo: 6.0,
    valorMaximo: 7.5,
    sexo: 'ambos',
    ativo: true
  },
  {
    tipoExame: 'fezes',
    parametro: 'Leucócitos',
    unidade: 'p/campo',
    valorMinimo: 0,
    valorMaximo: 2,
    sexo: 'ambos',
    ativo: true
  },
  {
    tipoExame: 'fezes',
    parametro: 'Hemácias',
    unidade: 'p/campo',
    valorMinimo: 0,
    valorMaximo: 2,
    sexo: 'ambos',
    ativo: true
  }
];

async function popularValores() {
  console.log('Iniciando população de valores de referência...');
  
  try {
    const colRef = collection(db, 'valoresReferencia');
    
    for (const valor of valoresReferencia) {
      const docRef = await addDoc(colRef, {
        ...valor,
        criadoEm: new Date(),
        atualizadoEm: new Date()
      });
      console.log(`✓ Valor adicionado: ${valor.parametro} - ${valor.tipoExame} - ID: ${docRef.id}`);
    }
    
    console.log('\n✅ Todos os valores de referência foram cadastrados com sucesso!');
    console.log(`Total: ${valoresReferencia.length} registros`);
  } catch (error) {
    console.error('❌ Erro ao popular valores:', error);
  }
}

// Executar o script
popularValores();
