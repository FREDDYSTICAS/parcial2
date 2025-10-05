import dotenv from 'dotenv';
dotenv.config();

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Estructura de credenciales del service account proveniente de env
interface FirebaseServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain?: string;
}

let firestore: Firestore | null = null;

export const initializeFirebase = () => {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON no está definido en el entorno');
    }

    // Render escapa saltos de línea en private_key, normalizarlos
    const parsed = JSON.parse(raw) as FirebaseServiceAccount;
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');

    initializeApp({
      credential: cert(parsed as any)
    });
  }

  firestore = getFirestore();
  return firestore;
};

// Adaptador mínimo con API similar a nano(db) usada en controladores
// Colección única 'documents' con campo 'type'
const collectionName = 'documents';

export const db = {
  async get(id: string): Promise<any> {
    const fs = firestore || initializeFirebase();
    const snap = await fs.collection(collectionName).doc(id).get();
    if (!snap.exists) throw Object.assign(new Error('not_found'), { statusCode: 404 });
    return { _id: snap.id, ...(snap.data() as object) };
  },

  async insert(doc: any): Promise<{ id: string }>{
    const fs = firestore || initializeFirebase();
    const id = doc._id || `${doc.type || 'doc'}_${Date.now()}`;
    const data = { ...doc };
    delete (data as any)._rev;
    await fs.collection(collectionName).doc(id).set(data, { merge: true });
    return { id };
  },

  async find(params: { selector: any; limit?: number; skip?: number }): Promise<{ docs: any[]; warning?: string }>{
    const fs = firestore || initializeFirebase();
    const { selector, limit = 50, skip = 0 } = params;
    let query: FirebaseFirestore.Query = fs.collection(collectionName);

    // Soporta filtro por type y campos simples de igualdad
    if (selector) {
      Object.entries(selector).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.where(key, '==', value as any);
        }
      });
    }

    // Firestore no soporta skip directo; simulamos con paginación simple
    const snapshots = await query.limit(limit + skip).get();
    const docs = snapshots.docs.slice(skip).map(d => ({ _id: d.id, ...(d.data() as object) }));
    return { docs };
  },

  async list(params?: { include_docs?: boolean }): Promise<{ rows: { id: string; doc?: any }[] }>{
    const fs = firestore || initializeFirebase();
    const snapshots = await fs.collection(collectionName).get();
    const rows = snapshots.docs.map(d => ({ id: d.id, doc: params?.include_docs ? ({ _id: d.id, ...(d.data() as object) }) : undefined }));
    return { rows };
  },

  async bulk({ docs }: { docs: { _id: string }[] }): Promise<any>{
    const fs = firestore || initializeFirebase();
    const batch = fs.batch();
    docs.forEach(doc => {
      batch.delete(fs.collection(collectionName).doc(doc._id));
    });
    await batch.commit();
    return { ok: true };
  },

  async view(design: string, viewName: string, options: any): Promise<{ rows: { doc: any }[] }>{
    // Emulamos vistas usadas: empleados_por_nombre, empleados_por_documento, contratos_por_empleado, usuarios_sistema
    const fs = firestore || initializeFirebase();
    let query: FirebaseFirestore.Query = fs.collection(collectionName);

    if (viewName === 'empleados_por_nombre' && options?.startkey) {
      query = query.where('type', '==', 'empleado').orderBy('nombre_apellido').startAt(options.startkey).endAt(`${options.startkey}\uf8ff`);
    } else if (viewName === 'empleados_por_documento' && options?.key) {
      query = query.where('type', '==', 'empleado').where('nro_documento', '==', options.key);
    } else if (viewName === 'contratos_por_empleado' && options?.key) {
      query = query.where('type', '==', 'contrato').where('empleado_id', '==', options.key);
    } else if (viewName === 'usuarios_sistema' && options?.key) {
      query = query.where('type', '==', 'usuario').where('username', '==', options.key);
    }

    const snaps = await query.get();
    const rows = snaps.docs.map(d => ({ doc: { _id: d.id, ...(d.data() as object) } }));
    return { rows };
  }
};

export const initializeDatabase = async () => {
  const fs = initializeFirebase();
  // Asegurar índices manuales: en Firestore se crean compuestos desde consola según consultas
  console.log('✅ Firebase Firestore inicializado');
};


