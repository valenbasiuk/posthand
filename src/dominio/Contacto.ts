import { ErrorDeDominio } from './ErrorDeDominio.js';

/**
 * RF-03: Contacto de la agenda (nombre completo + email).
 *
 * Es un objeto inmutable (value object): una vez creado no cambia.
 * "Modificar" un contacto devuelve un Contacto nuevo. Gracias a esto,
 * los correos históricos que referencian al contacto conservan los datos
 * que tenía en el momento del envío, aunque después se edite o se borre
 * de la agenda.
 */
export class Contacto {
  private static readonly FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private readonly _nombre: string;
  private readonly _email: string;

  constructor(nombre: string, email: string) {
    const nombreLimpio = nombre.trim();
    if (nombreLimpio.length === 0) {
      throw new ErrorDeDominio('El nombre del contacto es obligatorio');
    }

    const emailNormalizado = Contacto.normalizarEmail(email);
    if (!Contacto.esEmailValido(emailNormalizado)) {
      throw new ErrorDeDominio(`El email "${email}" no tiene un formato válido`);
    }

    this._nombre = nombreLimpio;
    this._email = emailNormalizado;
  }

  /** Los emails se comparan sin espacios y en minúsculas. */
  static normalizarEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  static esEmailValido(email: string): boolean {
    return Contacto.FORMATO_EMAIL.test(email.trim());
  }

  get nombre(): string {
    return this._nombre;
  }

  get email(): string {
    return this._email;
  }

  /** Parte del email después del "@", ej: "ucp.edu.ar". */
  get dominio(): string {
    return this._email.slice(this._email.indexOf('@') + 1);
  }

  /** Dos contactos son el mismo si tienen el mismo email (criterio anti-duplicados). */
  esMismoQue(otro: Contacto): boolean {
    return this._email === otro._email;
  }

  conNombre(nuevoNombre: string): Contacto {
    return new Contacto(nuevoNombre, this._email);
  }

  conEmail(nuevoEmail: string): Contacto {
    return new Contacto(this._nombre, nuevoEmail);
  }

  toString(): string {
    return `${this._nombre} <${this._email}>`;
  }
}
