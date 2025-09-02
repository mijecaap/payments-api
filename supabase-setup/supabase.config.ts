import { createClient } from '@supabase/supabase-js';

// Configuración del cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Cliente público (para uso en frontend y operaciones de lectura)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Para aplicaciones del lado del servidor
  },
});

// Cliente de servicio (para operaciones administrativas)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Configuración de Storage
export const STORAGE_CONFIG = {
  bucket: process.env.SUPABASE_STORAGE_BUCKET || 'candidatos-media',
  folders: {
    photos: 'photos/',
    logos: 'logos/',
    documents: 'documents/',
    events: 'events/',
  },
};

// Utilidades para Storage
export class SupabaseStorage {
  /**
   * Subir archivo al bucket de Supabase
   */
  static async uploadFile(
    file: Buffer | Blob,
    fileName: string,
    folder: string = '',
    options?: { contentType?: string; upsert?: boolean }
  ) {
    const filePath = folder ? `${folder}${fileName}` : fileName;
    
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_CONFIG.bucket)
      .upload(filePath, file, {
        contentType: options?.contentType,
        upsert: options?.upsert || false,
      });

    if (error) {
      throw error;
    }

    return {
      path: data.path,
      fullPath: data.fullPath,
      publicUrl: this.getPublicUrl(data.path),
    };
  }

  /**
   * Obtener URL pública de un archivo
   */
  static getPublicUrl(path: string): string {
    const { data } = supabaseAdmin.storage
      .from(STORAGE_CONFIG.bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  /**
   * Eliminar archivo del storage
   */
  static async deleteFile(path: string) {
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_CONFIG.bucket)
      .remove([path]);

    if (error) {
      throw error;
    }

    return { success: true };
  }

  /**
   * Listar archivos en una carpeta
   */
  static async listFiles(folder: string = '', limit: number = 100) {
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_CONFIG.bucket)
      .list(folder, {
        limit,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      throw error;
    }

    return data;
  }
}

// Tipos para TypeScript
export interface SupabaseFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
}

// Database types (estos serían generados automáticamente por Supabase)
export interface Database {
  public: {
    Tables: {
      candidates: {
        Row: {
          id: number;
          first_name: string;
          last_name: string;
          full_name: string;
          date_of_birth: string;
          place_of_birth: string | null;
          photo_url: string | null;
          biography: string | null;
          profession: string | null;
          political_party_id: number | null;
          position: 'president' | 'vice_president_1' | 'vice_president_2';
          campaign_slogan: string | null;
          approval_rating: number;
          voting_intention: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          first_name: string;
          last_name: string;
          date_of_birth: string;
          place_of_birth?: string | null;
          photo_url?: string | null;
          biography?: string | null;
          profession?: string | null;
          political_party_id?: number | null;
          position?: 'president' | 'vice_president_1' | 'vice_president_2';
          campaign_slogan?: string | null;
          approval_rating?: number;
          voting_intention?: number;
          is_active?: boolean;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          date_of_birth?: string;
          place_of_birth?: string | null;
          photo_url?: string | null;
          biography?: string | null;
          profession?: string | null;
          political_party_id?: number | null;
          position?: 'president' | 'vice_president_1' | 'vice_president_2';
          campaign_slogan?: string | null;
          approval_rating?: number;
          voting_intention?: number;
          is_active?: boolean;
        };
      };
      political_parties: {
        Row: {
          id: number;
          name: string;
          acronym: string;
          ideology: string | null;
          founding_date: string | null;
          logo_url: string | null;
          website_url: string | null;
          description: string | null;
          is_coalition: boolean;
          status: 'active' | 'inactive' | 'suspended';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          acronym: string;
          ideology?: string | null;
          founding_date?: string | null;
          logo_url?: string | null;
          website_url?: string | null;
          description?: string | null;
          is_coalition?: boolean;
          status?: 'active' | 'inactive' | 'suspended';
        };
        Update: {
          name?: string;
          acronym?: string;
          ideology?: string | null;
          founding_date?: string | null;
          logo_url?: string | null;
          website_url?: string | null;
          description?: string | null;
          is_coalition?: boolean;
          status?: 'active' | 'inactive' | 'suspended';
        };
      };
    };
  };
}