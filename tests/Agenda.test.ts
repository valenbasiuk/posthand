import { describe, it, expect, beforeEach } from 'vitest';
import { Agenda } from '../src/dominio/Agenda.js';
import { Contacto } from '../src/dominio/Contacto.js';
import { Correo } from '../src/dominio/Correo.js';
import { ErrorDeDominio } from '../src/dominio/ErrorDeDominio.js';

describe('RF-03 · Agenda de contactos', () => {
  let agenda: Agenda;
  const ana = new Contacto('Ana Pérez', 'ana@ucp.edu.ar');
  const beto = new Contacto('Beto Gómez', 'beto@gmail.com');

  beforeEach(() => {
    agenda = new Agenda();
  });

  describe('alta', () => {
    it('agrega contactos nuevos', () => {
      agenda.agregar(ana);
      agenda.agregar(beto);
      expect(agenda.cantidad).toBe(2);
      expect(agenda.listar()).toEqual([ana, beto]);
    });

    it('impide duplicados por email, aunque cambien mayúsculas o nombre', () => {
      agenda.agregar(ana);
      const duplicado = new Contacto('Otra Ana', 'ANA@ucp.edu.ar');
      expect(() => agenda.agregar(duplicado)).toThrow(ErrorDeDominio);
      expect(agenda.cantidad).toBe(1);
    });
  });

  describe('consulta', () => {
    it('busca por email sin distinguir mayúsculas', () => {
      agenda.agregar(ana);
      expect(agenda.buscarPorEmail('Ana@UCP.edu.ar')).toBe(ana);
      expect(agenda.existe(' ana@ucp.edu.ar ')).toBe(true);
    });

    it('devuelve undefined si el contacto no existe', () => {
      expect(agenda.buscarPorEmail('nadie@ucp.edu.ar')).toBeUndefined();
      expect(agenda.existe('nadie@ucp.edu.ar')).toBe(false);
    });

    it('listar devuelve una copia que no altera la agenda', () => {
      agenda.agregar(ana);
      const lista = agenda.listar() as Contacto[];
      lista.push(beto);
      expect(agenda.cantidad).toBe(1);
    });

    it('una agenda nueva está vacía', () => {
      expect(agenda.cantidad).toBe(0);
      expect(agenda.listar()).toEqual([]);
    });
  });

  describe('modificación', () => {
    beforeEach(() => {
      agenda.agregar(ana);
      agenda.agregar(beto);
    });

    it('modifica el nombre de un contacto existente', () => {
      const modificado = agenda.modificar('ana@ucp.edu.ar', { nombre: 'Ana María Pérez' });
      expect(modificado.nombre).toBe('Ana María Pérez');
      expect(agenda.buscarPorEmail('ana@ucp.edu.ar')?.nombre).toBe('Ana María Pérez');
      expect(agenda.cantidad).toBe(2);
    });

    it('modifica el email y lo re-indexa', () => {
      agenda.modificar('ana@ucp.edu.ar', { email: 'ana.perez@ucp.edu.ar' });
      expect(agenda.existe('ana@ucp.edu.ar')).toBe(false);
      expect(agenda.buscarPorEmail('ana.perez@ucp.edu.ar')?.nombre).toBe('Ana Pérez');
      expect(agenda.cantidad).toBe(2);
    });

    it('permite cambiar solo mayúsculas del mismo email', () => {
      const modificado = agenda.modificar('ana@ucp.edu.ar', { email: 'ANA@ucp.edu.ar', nombre: 'Ana' });
      expect(modificado.email).toBe('ana@ucp.edu.ar');
      expect(agenda.cantidad).toBe(2);
    });

    it('no permite cambiar el email a uno que ya usa otro contacto', () => {
      expect(() => agenda.modificar('ana@ucp.edu.ar', { email: 'beto@gmail.com' })).toThrow(ErrorDeDominio);
      expect(agenda.buscarPorEmail('ana@ucp.edu.ar')).toBe(ana);
    });

    it('valida el formato del nuevo email', () => {
      expect(() => agenda.modificar('ana@ucp.edu.ar', { email: 'sin-arroba' })).toThrow(ErrorDeDominio);
      expect(agenda.buscarPorEmail('ana@ucp.edu.ar')).toBe(ana);
    });

    it('falla si el contacto a modificar no existe', () => {
      expect(() => agenda.modificar('nadie@ucp.edu.ar', { nombre: 'X' })).toThrow(ErrorDeDominio);
    });
  });

  describe('baja', () => {
    it('elimina un contacto de la agenda', () => {
      agenda.agregar(ana);
      agenda.eliminar('ana@ucp.edu.ar');
      expect(agenda.existe('ana@ucp.edu.ar')).toBe(false);
      expect(agenda.cantidad).toBe(0);
    });

    it('falla si el contacto a eliminar no existe', () => {
      expect(() => agenda.eliminar('nadie@ucp.edu.ar')).toThrow(ErrorDeDominio);
    });

    it('eliminar un contacto no borra los correos históricos que lo referencian', () => {
      agenda.agregar(ana);
      agenda.agregar(beto);
      const correo = new Correo(ana, { asunto: 'Hola', para: [beto] });

      agenda.eliminar('ana@ucp.edu.ar');
      agenda.eliminar('beto@gmail.com');

      expect(correo.remitente.email).toBe('ana@ucp.edu.ar');
      expect(correo.para[0]?.email).toBe('beto@gmail.com');
    });

    it('modificar un contacto no altera los correos ya creados', () => {
      agenda.agregar(ana);
      const correo = new Correo(ana, { asunto: 'Hola', para: [beto] });
      agenda.modificar('ana@ucp.edu.ar', { nombre: 'Nombre Nuevo' });
      expect(correo.remitente.nombre).toBe('Ana Pérez');
    });
  });
});
