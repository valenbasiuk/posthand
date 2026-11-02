import { describe, it, expect } from 'vitest';
import { Contacto } from '../src/dominio/Contacto.js';
import { ErrorDeDominio } from '../src/dominio/ErrorDeDominio.js';

describe('RF-03 · Contacto', () => {
  it('guarda nombre y email', () => {
    const c = new Contacto('Ana Pérez', 'ana@ucp.edu.ar');
    expect(c.nombre).toBe('Ana Pérez');
    expect(c.email).toBe('ana@ucp.edu.ar');
  });

  it('normaliza el email (sin espacios y en minúsculas) y recorta el nombre', () => {
    const c = new Contacto('  Ana Pérez ', '  Ana@UCP.edu.AR ');
    expect(c.nombre).toBe('Ana Pérez');
    expect(c.email).toBe('ana@ucp.edu.ar');
  });

  it('expone el dominio del email', () => {
    expect(new Contacto('Ana', 'ana@ucp.edu.ar').dominio).toBe('ucp.edu.ar');
  });

  it.each(['', 'ana', 'ana@', '@ucp.edu.ar', 'ana@ucp', 'ana perez@ucp.edu.ar', 'ana@@ucp.edu.ar'])(
    'rechaza el email inválido "%s"',
    (email) => {
      expect(() => new Contacto('Ana', email)).toThrow(ErrorDeDominio);
    },
  );

  it('rechaza un nombre vacío', () => {
    expect(() => new Contacto('   ', 'ana@ucp.edu.ar')).toThrow(ErrorDeDominio);
  });

  it('esMismoQue compara por email, sin importar mayúsculas ni nombre', () => {
    const a = new Contacto('Ana', 'ana@ucp.edu.ar');
    const b = new Contacto('Ana P.', 'ANA@ucp.edu.ar');
    const c = new Contacto('Ana', 'otra@ucp.edu.ar');
    expect(a.esMismoQue(b)).toBe(true);
    expect(a.esMismoQue(c)).toBe(false);
  });

  it('es inmutable: conNombre/conEmail devuelven un contacto nuevo', () => {
    const original = new Contacto('Ana', 'ana@ucp.edu.ar');
    const renombrado = original.conNombre('Ana María');
    const conOtroEmail = original.conEmail('ana@gmail.com');

    expect(original.nombre).toBe('Ana');
    expect(original.email).toBe('ana@ucp.edu.ar');
    expect(renombrado.nombre).toBe('Ana María');
    expect(conOtroEmail.email).toBe('ana@gmail.com');
  });

  it('se representa como "Nombre <email>"', () => {
    expect(new Contacto('Ana', 'ana@ucp.edu.ar').toString()).toBe('Ana <ana@ucp.edu.ar>');
  });
});
