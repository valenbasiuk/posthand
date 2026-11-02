import { Contacto } from './Contacto.js';
import { ErrorDeDominio } from './ErrorDeDominio.js';

export interface CambiosContacto {
  nombre?: string;
  email?: string;
}

/**
 * RF-03: Agenda de contactos con operaciones de alta, consulta,
 * modificación y baja.
 *
 * Criterio anti-duplicados: no puede haber dos contactos con el mismo
 * email (comparado sin distinguir mayúsculas). Internamente se usa un
 * Map cuya clave es el email normalizado.
 */
export class Agenda {
  private readonly contactos = new Map<string, Contacto>();

  agregar(contacto: Contacto): Contacto {
    if (this.contactos.has(contacto.email)) {
      throw new ErrorDeDominio(`Ya existe un contacto con el email ${contacto.email}`);
    }
    this.contactos.set(contacto.email, contacto);
    return contacto;
  }

  buscarPorEmail(email: string): Contacto | undefined {
    return this.contactos.get(Contacto.normalizarEmail(email));
  }

  existe(email: string): boolean {
    return this.contactos.has(Contacto.normalizarEmail(email));
  }

  /** Devuelve una copia: modificar el array devuelto no altera la agenda. */
  listar(): readonly Contacto[] {
    return [...this.contactos.values()];
  }

  get cantidad(): number {
    return this.contactos.size;
  }

  /**
   * Reemplaza el contacto por uno nuevo con los cambios indicados.
   * Si se cambia el email, se valida que no choque con otro contacto.
   */
  modificar(emailActual: string, cambios: CambiosContacto): Contacto {
    const actual = this.obtenerOFallar(emailActual);

    let modificado = actual;
    if (cambios.nombre !== undefined) modificado = modificado.conNombre(cambios.nombre);
    if (cambios.email !== undefined) modificado = modificado.conEmail(cambios.email);

    const cambiaDeEmail = !modificado.esMismoQue(actual);
    if (cambiaDeEmail && this.contactos.has(modificado.email)) {
      throw new ErrorDeDominio(`Ya existe un contacto con el email ${modificado.email}`);
    }

    this.contactos.delete(actual.email);
    this.contactos.set(modificado.email, modificado);
    return modificado;
  }

  /**
   * Quita el contacto de la agenda. Los correos que lo referencian no se
   * ven afectados: guardan su propia referencia al objeto Contacto.
   */
  eliminar(email: string): Contacto {
    const contacto = this.obtenerOFallar(email);
    this.contactos.delete(contacto.email);
    return contacto;
  }

  private obtenerOFallar(email: string): Contacto {
    const contacto = this.buscarPorEmail(email);
    if (!contacto) {
      throw new ErrorDeDominio(`No existe un contacto con el email ${email}`);
    }
    return contacto;
  }
}
