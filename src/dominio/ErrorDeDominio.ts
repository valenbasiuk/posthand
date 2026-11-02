/**
 * Error lanzado cuando una operación viola una regla del dominio
 * (email inválido, contacto duplicado, correo incompleto, etc.).
 * Tener un tipo propio permite distinguirlo de errores inesperados en los tests.
 */
export class ErrorDeDominio extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorDeDominio';
  }
}
