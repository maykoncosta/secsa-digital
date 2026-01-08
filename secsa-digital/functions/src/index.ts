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
