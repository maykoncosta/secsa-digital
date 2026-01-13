import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Inicializar Firebase Admin
admin.initializeApp();
const db = admin.firestore();

/**
 * Trigger quando um exame é criado
 * Atualiza contadores de estatísticas
 */
export const onExameCreated = functions.firestore
  .document("exames-realizados/{exameId}")
  .onCreate(async (snap, context) => {
    const exame = snap.data();
    const statsRef = db.collection("estatisticas").doc("geral");
    const topExamesRef = db.collection("top-exames").doc(exame.schemaId);

    // Verificar se é exame de hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataColeta = exame.dataColeta.toDate();
    dataColeta.setHours(0, 0, 0, 0);
    const isHoje = dataColeta.getTime() === hoje.getTime();

    // Atualizar estatísticas gerais
    await statsRef.set({
      totalExames: admin.firestore.FieldValue.increment(1),
      [`exames_${exame.status}`]: admin.firestore.FieldValue.increment(1),
      examesHoje: isHoje ? admin.firestore.FieldValue.increment(1) : admin.firestore.FieldValue.increment(0),
      ultimaAtualizacao: admin.firestore.FieldValue.serverTimestamp(),
    }, {merge: true});

    // Atualizar top exames
    await topExamesRef.set({
      nome: exame.schemaNome,
      quantidade: admin.firestore.FieldValue.increment(1),
    }, {merge: true});

    functions.logger.info("Estatísticas atualizadas para novo exame", {
      exameId: context.params.exameId,
      status: exame.status,
    });
  });

/**
 * Trigger quando um exame é atualizado
 * Ajusta contadores se o status mudou
 */
export const onExameUpdated = functions.firestore
  .document("exames-realizados/{exameId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Verificar se o status mudou
    if (before.status !== after.status) {
      const statsRef = db.collection("estatisticas").doc("geral");

      // Decrementar status antigo e incrementar novo
      await statsRef.set({
        [`exames_${before.status}`]: admin.firestore.FieldValue.increment(-1),
        [`exames_${after.status}`]: admin.firestore.FieldValue.increment(1),
        ultimaAtualizacao: admin.firestore.FieldValue.serverTimestamp(),
      }, {merge: true});

      functions.logger.info("Status do exame atualizado", {
        exameId: context.params.exameId,
        statusAnterior: before.status,
        novoStatus: after.status,
      });
    }
  });

/**
 * Trigger quando um exame é excluído
 * Decrementa contadores
 */
export const onExameDeleted = functions.firestore
  .document("exames-realizados/{exameId}")
  .onDelete(async (snap, context) => {
    const exame = snap.data();
    const statsRef = db.collection("estatisticas").doc("geral");
    const topExamesRef = db.collection("top-exames").doc(exame.schemaId);

    // Verificar se era exame de hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataColeta = exame.dataColeta.toDate();
    dataColeta.setHours(0, 0, 0, 0);
    const isHoje = dataColeta.getTime() === hoje.getTime();

    // Decrementar estatísticas gerais
    await statsRef.set({
      totalExames: admin.firestore.FieldValue.increment(-1),
      [`exames_${exame.status}`]: admin.firestore.FieldValue.increment(-1),
      examesHoje: isHoje ? admin.firestore.FieldValue.increment(-1) : admin.firestore.FieldValue.increment(0),
      ultimaAtualizacao: admin.firestore.FieldValue.serverTimestamp(),
    }, {merge: true});

    // Decrementar top exames
    await topExamesRef.set({
      quantidade: admin.firestore.FieldValue.increment(-1),
    }, {merge: true});

    functions.logger.info("Exame removido, estatísticas atualizadas", {
      exameId: context.params.exameId,
    });
  });

/**
 * Trigger quando um paciente é criado
 * Incrementa contador de pacientes
 */
export const onPacienteCreated = functions.firestore
  .document("pacientes/{pacienteId}")
  .onCreate(async (snap, context) => {
    const statsRef = db.collection("estatisticas").doc("geral");

    await statsRef.set({
      totalPacientes: admin.firestore.FieldValue.increment(1),
      ultimaAtualizacao: admin.firestore.FieldValue.serverTimestamp(),
    }, {merge: true});

    functions.logger.info("Paciente criado, contador atualizado", {
      pacienteId: context.params.pacienteId,
    });
  });

/**
 * Trigger quando um paciente é excluído
 * Decrementa contador de pacientes
 */
export const onPacienteDeleted = functions.firestore
  .document("pacientes/{pacienteId}")
  .onDelete(async (snap, context) => {
    const statsRef = db.collection("estatisticas").doc("geral");

    await statsRef.set({
      totalPacientes: admin.firestore.FieldValue.increment(-1),
      ultimaAtualizacao: admin.firestore.FieldValue.serverTimestamp(),
    }, {merge: true});

    functions.logger.info("Paciente removido, contador atualizado", {
      pacienteId: context.params.pacienteId,
    });
  });

/**
 * Função HTTP para resetar/inicializar estatísticas
 * Útil para migração ou reset
 */
export const initializeStats = functions.https.onRequest(async (req, res) => {
  try {
    const stats = await recalcularEstatisticas();

    res.json({
      success: true,
      message: "Estatísticas inicializadas com sucesso",
      stats,
    });
  } catch (error) {
    functions.logger.error("Erro ao inicializar estatísticas", error);
    res.status(500).json({
      success: false,
      error: "Erro ao inicializar estatísticas",
    });
  }
});

/**
 * Função callable para recalcular estatísticas
 * Pode ser chamada do frontend com segurança
 */
export const recalcularEstatisticasCallable = functions.https.onCall(async (data, context) => {
  try {
    const stats = await recalcularEstatisticas();

    functions.logger.info("Estatísticas recalculadas via callable", {
      stats,
      userId: context.auth?.uid,
    });

    return {
      success: true,
      message: "Estatísticas recalculadas com sucesso",
      stats,
    };
  } catch (error) {
    functions.logger.error("Erro ao recalcular estatísticas", error);
    throw new functions.https.HttpsError(
      "internal",
      "Erro ao recalcular estatísticas"
    );
  }
});

/**
 * Função auxiliar para recalcular todas as estatísticas
 * Baseada nos dados atuais do Firestore
 */
async function recalcularEstatisticas() {
  // Buscar todos os exames e pacientes
  const examesSnapshot = await db.collection("exames-realizados").get();
  const pacientesSnapshot = await db.collection("pacientes").get();

  // Calcular estatísticas
  let totalExames = 0;
  let examesPendentes = 0;
  let examesFinalizados = 0;
  let examesLiberados = 0;
  let examesHoje = 0;
  const topExamesMap = new Map<string, {nome: string; quantidade: number}>();

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  examesSnapshot.forEach((doc) => {
    const exame = doc.data();
    totalExames++;

    // Contar por status
    if (exame.status === "pendente") examesPendentes++;
    if (exame.status === "finalizado") examesFinalizados++;
    if (exame.status === "liberado") examesLiberados++;

    // Contar exames de hoje
    const dataColeta = exame.dataColeta.toDate();
    dataColeta.setHours(0, 0, 0, 0);
    if (dataColeta.getTime() === hoje.getTime()) {
      examesHoje++;
    }

    // Contar top exames
    const existing = topExamesMap.get(exame.schemaId) || {nome: exame.schemaNome, quantidade: 0};
    topExamesMap.set(exame.schemaId, {
      nome: exame.schemaNome,
      quantidade: existing.quantidade + 1,
    });
  });

  const totalPacientes = pacientesSnapshot.size;

  // Salvar estatísticas gerais
  await db.collection("estatisticas").doc("geral").set({
    totalExames,
    exames_pendente: examesPendentes,
    exames_finalizado: examesFinalizados,
    exames_liberado: examesLiberados,
    examesHoje,
    totalPacientes,
    ultimaAtualizacao: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Salvar top exames
  const batch = db.batch();
  topExamesMap.forEach((data, schemaId) => {
    const ref = db.collection("top-exames").doc(schemaId);
    batch.set(ref, data);
  });
  await batch.commit();

  return {
    totalExames,
    examesPendentes,
    examesFinalizados,
    examesLiberados,
    examesHoje,
    totalPacientes,
    topExames: topExamesMap.size,
  };
}

/**
 * Cloud Function para criar usuário de paciente
 * Usa Admin SDK para não fazer login automático
 */
export const criarUsuarioPaciente = functions.https.onCall(async (data, context) => {
  try {
    // Validar autenticação
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Usuário não autenticado'
      );
    }

    // Validar role (apenas admin e funcionário podem criar)
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    const userData = userDoc.data();
    
    if (!userData || !['admin', 'funcionario'].includes(userData.role)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Sem permissão para criar usuários'
      );
    }

    const { paciente, pacienteId } = data;

    // Validar dados
    if (!paciente || !pacienteId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Dados do paciente são obrigatórios'
      );
    }

    // Determinar qual documento usar (CPF tem prioridade)
    const documento = paciente.cpf || paciente.cns;
    if (!documento) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Paciente deve ter CPF ou CNS'
      );
    }

    // Gerar email virtual
    const documentoLimpo = documento.replace(/\D/g, '');
    const email = `paciente_${documentoLimpo}@secsa.local`;

    // Gerar senha baseada na data de nascimento (DDMMAAAA)
    const dataNasc = new Date(paciente.dataNascimento);
    const ano = dataNasc.getFullYear();
    const mes = String(dataNasc.getMonth() + 1).padStart(2, '0');
    const dia = String(dataNasc.getDate()).padStart(2, '0');
    const senha = `${dia}${mes}${ano}`;

    console.log('📧 Criando usuário para paciente:', {
      email,
      pacienteId,
      documento: documentoLimpo
    });

    // Criar usuário no Firebase Authentication (Admin SDK não faz login)
    const userRecord = await admin.auth().createUser({
      email,
      password: senha,
      displayName: paciente.nomeCompleto,
    });

    const uid = userRecord.uid;

    // Criar documento na collection users
    const userData: any = {
      email,
      displayName: paciente.nomeCompleto,
      role: 'paciente',
      pacienteId: pacienteId,
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Adicionar campos opcionais
    if (paciente.cpf) userData.cpf = paciente.cpf;
    if (paciente.cns) userData.cns = paciente.cns;
    if (paciente.dataNascimento) {
      userData.dataNascimento = admin.firestore.Timestamp.fromDate(
        new Date(paciente.dataNascimento)
      );
    }
    if (paciente.telefone) userData.telefone = paciente.telefone;

    await db.collection('users').doc(uid).set(userData);

    console.log('✅ Usuário criado com sucesso!', {
      uid,
      email,
      pacienteId
    });

    return {
      success: true,
      uid,
      email
    };

  } catch (error: any) {
    console.error('❌ Erro ao criar usuário para paciente:', error);
    
    // Se o email já existe, retornar sucesso
    if (error.code === 'auth/email-already-exists') {
      console.log('ℹ️ Usuário já existe para este paciente');
      return {
        success: true,
        message: 'Usuário já existe'
      };
    }

    throw new functions.https.HttpsError(
      'internal',
      `Erro ao criar usuário: ${error.message}`
    );
  }
});
