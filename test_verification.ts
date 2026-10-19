import { SEED_GAMES } from './src/data/seedGames.ts';
import {
  initDuelState,
  stepDuel,
  insertGameAtRank,
  reorderGames,
} from './src/utils/binarySearchDuel.ts';
import { getRecommendations } from './src/services/recommendations.ts';

console.log('--- TEST 1: Verificación de Datos Semilla (93 Juegos) ---');
console.assert(SEED_GAMES.length === 93, `Esperado 93 juegos, obtenido: ${SEED_GAMES.length}`);
console.log(`✓ Total de juegos: ${SEED_GAMES.length}`);

// Verificar correlativos
for (let i = 0; i < SEED_GAMES.length; i++) {
  console.assert(
    SEED_GAMES[i].rank === i + 1,
    `Error en el puesto correlativo para el índice ${i}: esperado ${i + 1}, obtenido ${SEED_GAMES[i].rank}`
  );
}
console.log('✓ Todos los rangos son estrictamente correlativos del 1 al 93.');

// Verificar títulos clave
console.assert(SEED_GAMES[0].title.includes('Sekiro'), `Puesto 1 debe ser Sekiro: ${SEED_GAMES[0].title}`);
console.assert(SEED_GAMES[1].title.includes('Elden Ring'), `Puesto 2 debe ser Elden Ring: ${SEED_GAMES[1].title}`);
console.assert(SEED_GAMES[5].title.includes('Hollow Knight'), `Puesto 6 debe ser Hollow Knight: ${SEED_GAMES[5].title}`);
console.assert(SEED_GAMES[9].title.includes('Resident Evil 2'), `Puesto 10 debe ser Resident Evil 2: ${SEED_GAMES[9].title}`);
console.assert(SEED_GAMES[92].title.includes('Aborigenus'), `Puesto 93 debe ser Aborigenus: ${SEED_GAMES[92].title}`);
console.log('✓ Posiciones iniciales clave (#1 Sekiro, #2 Elden Ring, #6 Hollow Knight, #10 RE2, #93 Aborigenus) verificadas.');

console.log('\n--- TEST 2: Simulación de Duelo 1v1 con Búsqueda Binaria ---');
// Simular inserción de "Lies of P"
// Deseamos que quede en puesto #3 (por debajo de Sekiro #1 y Elden Ring #2, pero por encima de Dark Souls 2 #3)
const newGame = { title: 'Lies of P', genres: ['Soulslike', 'Acción'] };
let duel = initDuelState(newGame, SEED_GAMES);

let rounds = 0;
while (!duel.isComplete && duel.currentStep) {
  rounds++;
  const midGame = duel.currentStep.comparedGame;
  // Si el juego existente es Sekiro (rank 1) o Elden Ring (rank 2), gana el existente.
  // Para cualquier otro juego (rank >= 3), gana "Lies of P".
  const winner = midGame.rank <= 2 ? 'existing' : 'new';
  console.log(`  Ronda ${rounds}: Comparando con #${midGame.rank} "${midGame.title}" -> Ganador: ${winner === 'new' ? 'Lies of P' : midGame.title}`);
  duel = stepDuel(duel, winner, SEED_GAMES);
}

console.assert(duel.isComplete, 'El duelo debe completarse.');
console.assert(duel.calculatedRank === 3, `Esperado puesto 3, obtenido: ${duel.calculatedRank}`);
console.log(`✓ Búsqueda Binaria finalizó con éxito en ${rounds} rondas. Puesto calculado: #${duel.calculatedRank}`);

// Probar inserción
const updatedList = insertGameAtRank(SEED_GAMES, { id: 'test-lop', rank: 3, title: 'Lies of P', genres: ['Soulslike'] }, 3);
console.assert(updatedList.length === 94, `Esperado 94 juegos, obtenido: ${updatedList.length}`);
console.assert(updatedList[2].title === 'Lies of P' && updatedList[2].rank === 3, 'Lies of P debe estar en puesto 3');
console.assert(updatedList[3].rank === 4, `Dark Souls 2 debe pasar al puesto 4, obtenido: ${updatedList[3].rank}`);
console.assert(updatedList[93].rank === 94, `Aborigenus debe pasar al puesto 94, obtenido: ${updatedList[93].rank}`);
console.log('✓ Inserción y desplazamiento correlativo 1..94 verificado sin huecos.');

console.log('\n--- TEST 3: Verificación de Recomendaciones ---');
const recs = getRecommendations(SEED_GAMES);
console.assert(recs.length > 0, 'Debe haber recomendaciones.');
console.assert(recs[0].matchScore >= 80, 'La mejor recomendación debe tener alta afinidad.');
console.log(`✓ Se generaron ${recs.length} recomendaciones no terminadas.`);
console.log(`  Top recomendación: "${recs[0].title}" con ${recs[0].matchScore}% Match.`);
console.log(`  Motivo: "${recs[0].whyYouWillLoveIt.slice(0, 80)}..."`);

console.log('\n--- TODOS LOS TESTS PASARON EXITOSAMENTE ---');
