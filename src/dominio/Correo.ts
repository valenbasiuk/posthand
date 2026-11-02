import { randomUUID } from 'node:crypto';
import { Contacto } from './Contacto.js';
import { ErrorDeDominio } from './ErrorDeDominio.js';

export interface DatosCorreo {
  asunto?: string;
  cuerpo?: string;
  para?: readonly Contacto[];
}

/**
 * RF-01: Correo electrónico.
 *
 * - Identidad: cada correo tiene un id único (UUID) generado al crearse.
 * - El remitente es obligatorio desde el inicio (es quien redacta).
 * - Asunto, cuerpo y destinatarios pueden faltar: un borrador puede estar
 *   incompleto (RF-07). Lo que se exige para enviar se valida con
 *   `validarParaEnvio()`.
 * - Los destinatarios se guardan en un array privado; hacia afuera solo se
 *   expone una copia de solo lectura, así nadie puede saltarse las reglas
 *   (por ejemplo, agregar duplicados) modificando el array directamente.
 *
 * RF-08: estado de lectura (leído / no leído).
 * RF-09 (parcial): indicador de favorito.
 */
export class Correo {
  readonly id: string;
  readonly remitente: Contacto;
  readonly fechaCreacion: Date;

  private readonly _asunto: string;
  private readonly _cuerpo: string;
  private readonly _para: Contacto[] = [];
  private _leido = false;
  private _favorito = false;

  constructor(remitente: Contacto, datos: DatosCorreo = {}) {
    if (!(remitente instanceof Contacto)) {
      throw new ErrorDeDominio('El remitente debe ser un Contacto');
    }

    this.id = randomUUID();
    this.remitente = remitente;
    this.fechaCreacion = new Date();
    this._asunto = (datos.asunto ?? '').trim();
    this._cuerpo = datos.cuerpo ?? '';

    for (const destinatario of datos.para ?? []) {
      this.agregarDestinatarioSinRepetir(destinatario);
    }
  }

  get asunto(): string {
    return this._asunto;
  }

  get cuerpo(): string {
    return this._cuerpo;
  }

  /** Copia de solo lectura de los destinatarios. */
  get para(): readonly Contacto[] {
    return Object.freeze([...this._para]);
  }

  tieneDestinatario(contacto: Contacto): boolean {
    return this._para.some((d) => d.esMismoQue(contacto));
  }

  /** Dos variables apuntan "al mismo correo" si comparten id. */
  esMismoQue(otro: Correo): boolean {
    return this.id === otro.id;
  }

  // ---------- Validación para envío (usada por RF-02 / RF-07) ----------

  /** Devuelve la lista de problemas que impiden enviar. Vacía = se puede enviar. */
  validarParaEnvio(): string[] {
    const errores: string[] = [];
    if (this._asunto.length === 0) errores.push('El asunto es obligatorio');
    if (this._para.length === 0) errores.push('Debe haber al menos un destinatario');
    return errores;
  }

  puedeEnviarse(): boolean {
    return this.validarParaEnvio().length === 0;
  }

  // ---------- RF-08: estado de lectura ----------

  get leido(): boolean {
    return this._leido;
  }

  marcarComoLeido(): void {
    this._leido = true;
  }

  marcarComoNoLeido(): void {
    this._leido = false;
  }

  // ---------- RF-09: favorito ----------

  get favorito(): boolean {
    return this._favorito;
  }

  marcarComoFavorito(): void {
    this._favorito = true;
  }

  desmarcarComoFavorito(): void {
    this._favorito = false;
  }

  // ---------- privados ----------

  private agregarDestinatarioSinRepetir(destinatario: Contacto): void {
    if (!(destinatario instanceof Contacto)) {
      throw new ErrorDeDominio('Cada destinatario debe ser un Contacto');
    }
    if (!this.tieneDestinatario(destinatario)) {
      this._para.push(destinatario);
    }
  }
}
