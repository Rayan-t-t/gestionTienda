import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp } from 'firebase/app';
import {
  Timestamp, collection, deleteDoc, getDocs, getFirestore,
  terminate, query, where, writeBatch, doc
} from 'firebase/firestore';

const CLAVES = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const VARIABLES = {
  apiKey: 'FIREBASE_API_KEY', authDomain: 'FIREBASE_AUTH_DOMAIN',
  projectId: 'FIREBASE_PROJECT_ID', storageBucket: 'FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'FIREBASE_MESSAGING_SENDER_ID', appId: 'FIREBASE_APP_ID'
};
const CLIENTES = ['cliente1@example.com', 'cliente2@example.com', 'cliente3@example.com',
                  'cliente4@example.com', 'cliente5@example.com'];

function leerConfiguracion() {
  if (CLAVES.every((clave) => process.env[VARIABLES[clave]])) {
    return Object.fromEntries(CLAVES.map((clave) => [clave, process.env[VARIABLES[clave]]]));
  }
  for (const archivo of ['src/environments/environment.ts', 'src/environments/environment.prod.ts']) {
    const ruta = resolve(archivo);
    if (!existsSync(ruta)) continue;
    const bloque = readFileSync(ruta, 'utf8').match(/firebaseConfig\s*:\s*\{([^}]*)\}/)?.[1] ?? '';
    const config = Object.fromEntries(
      [...bloque.matchAll(/(\w+)\s*:\s*['"]([^'"]*)['"]/g)].map(([, clave, valor]) => [clave, valor])
    );
    if (CLAVES.every((clave) => config[clave])) return config;
  }
  throw new Error('No se encontró la configuración de Firebase.');
}

const entero = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function generarVentas() {
  const ventas = [];
  const hoy = new Date();
  for (let atras = 29; atras >= 0; atras -= 1) {
    const base = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - atras);
    const esFinDeSemana = [0, 6].includes(base.getDay());
    const compras = Math.max(0, entero(0, 3) + (esFinDeSemana ? 2 : 0) + Math.floor((29 - atras) / 10));
    for (let i = 0; i < compras; i += 1) {
      const fecha = new Date(base.getFullYear(), base.getMonth(), base.getDate(), entero(9, 21), entero(0, 59));
      if (fecha > hoy) continue;
      const unidadesVendidas = entero(1, 4);
      ventas.push({
        tipo: 'venta',
        usuario: CLIENTES[entero(0, CLIENTES.length - 1)],
        detalle: `Compra finalizada: ${unidadesVendidas} unidades`,
        fecha: Timestamp.fromDate(fecha),
        unidadesVendidas,
        semilla: true
      });
    }
  }
  return ventas;
}

const modo = process.argv[2];
if (modo === '--simular') {
  const ventas = generarVentas();
  const unidades = ventas.reduce((total, venta) => total + venta.unidadesVendidas, 0);
  console.log(`Se insertarían ${ventas.length} ventas (${unidades} unidades). Ejemplos:`);
  for (const venta of ventas.slice(0, 5)) {
    console.log(venta.fecha.toDate().toLocaleString('es-ES'), venta.usuario, venta.detalle);
  }
  process.exit(0);
}

const db = getFirestore(initializeApp(leerConfiguracion()));
const coleccion = collection(db, 'actividad');

try {
  if (modo === '--borrar') {
    const existentes = await getDocs(query(coleccion, where('semilla', '==', true)));
    await Promise.all(existentes.docs.map((documento) => deleteDoc(documento.ref)));
    console.log(`Eliminadas ${existentes.size} ventas sembradas.`);
  } else {
    const ventas = generarVentas();
    for (let inicio = 0; inicio < ventas.length; inicio += 400) {
      const lote = writeBatch(db);
      for (const venta of ventas.slice(inicio, inicio + 400)) lote.set(doc(coleccion), venta);
      await lote.commit();
    }
    console.log(`Insertadas ${ventas.length} ventas de ejemplo en 'actividad'.`);
  }
} catch (error) {
  console.error('No se pudo completar la operación:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await terminate(db);
}