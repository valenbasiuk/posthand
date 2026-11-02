import { describe, it, expect } from 'vitest';
import { Correo } from '../src/dominio/Correo.js';
import { Contacto } from '../src/dominio/Contacto.js';
import { ErrorDeDominio } from '../src/dominio/ErrorDeDominio.js';

const ana = new Contacto('Ana Pérez', 'ana@ucp.edu.ar');
const beto = new Contacto('Beto Gómez', 'beto@gmail.com');
const caro = new Contacto('Caro Díaz', 'caro@ucp.edu.ar');

describe('RF-01 · Creación de correos', () => {
  it('mantiene correctamente su información', () => {
    const correo = new Correo(ana, { asunto: 'Examen final', cuerpo: 'Es el lunes', para: [beto, caro] });

    expect(correo.remitente).toBe(ana);
    expect(correo.asunto).toBe('Examen final');
    expect(correo.cuerpo).toBe('Es el lunes');
    expect(correo.para).toEqual([beto, caro]);
    expect(correo.fechaCreacion).toBeInstanceOf(Date);
  });

  it('nace como no leído y no favorito', () => {
    const correo = new Correo(ana, { asunto: 'Hola', para: [beto] });
    expect(correo.leido).toBe(false);
    expect(correo.favorito).toBe(false);
  });

  it('permite crear múltiples correos con distintos remitentes y destinatarios', () => {
    const c1 = new Correo(ana, { asunto: 'A', para: [beto] });
    const c2 = new Correo(beto, { asunto: 'B', para: [ana, caro] });

    expect(c1.remitente).toBe(ana);
    expect(c2.remitente).toBe(beto);
    expect(c1.para).toEqual([beto]);
    expect(c2.para).toEqual([ana, caro]);
  });

  it('cada correo tiene un id único, aunque tenga los mismos datos', () => {
    const datos = { asunto: 'Igual', cuerpo: 'Igual', para: [beto] };
    const correos = Array.from({ length: 100 }, () => new Correo(ana, datos));
    const ids = new Set(correos.map((c) => c.id));

    expect(ids.size).toBe(100);
    expect(correos[0]!.esMismoQue(correos[0]!)).toBe(true);
    expect(correos[0]!.esMismoQue(correos[1]!)).toBe(false);
  });

  it('puede crearse incompleto (borrador): sin asunto, cuerpo ni destinatarios', () => {
    const borrador = new Correo(ana);
    expect(borrador.asunto).toBe('');
    expect(borrador.cuerpo).toBe('');
    expect(borrador.para).toEqual([]);
  });

  it('exige que el remitente sea un Contacto', () => {
    const falso = { nombre: 'X', email: 'x@x.com' } as unknown as Contacto;
    expect(() => new Correo(falso)).toThrow(ErrorDeDominio);
  });

  it('exige que cada destinatario sea un Contacto', () => {
    const falso = { nombre: 'X', email: 'x@x.com' } as unknown as Contacto;
    expect(() => new Correo(ana, { para: [beto, falso] })).toThrow(ErrorDeDominio);
  });

  it('no repite destinatarios con el mismo email', () => {
    const betoOtraVez = new Contacto('Beto', 'BETO@gmail.com');
    const correo = new Correo(ana, { asunto: 'Hola', para: [beto, betoOtraVez, caro] });
    expect(correo.para).toHaveLength(2);
    expect(correo.tieneDestinatario(betoOtraVez)).toBe(true);
  });

  describe('la colección de destinatarios está protegida', () => {
    it('modificar el array original no afecta al correo', () => {
      const lista = [beto];
      const correo = new Correo(ana, { asunto: 'Hola', para: lista });
      lista.push(caro);
      expect(correo.para).toEqual([beto]);
    });

    it('el array expuesto no se puede modificar', () => {
      const correo = new Correo(ana, { asunto: 'Hola', para: [beto] });
      const expuesto = correo.para as Contacto[];
      expect(() => expuesto.push(caro)).toThrow(TypeError);
      expect(correo.para).toEqual([beto]);
    });
  });

  describe('validación para envío', () => {
    it('un correo con asunto y destinatario puede enviarse', () => {
      const correo = new Correo(ana, { asunto: 'Hola', para: [beto] });
      expect(correo.puedeEnviarse()).toBe(true);
      expect(correo.validarParaEnvio()).toEqual([]);
    });

    it('sin asunto (o solo espacios) no puede enviarse', () => {
      const correo = new Correo(ana, { asunto: '   ', para: [beto] });
      expect(correo.puedeEnviarse()).toBe(false);
      expect(correo.validarParaEnvio()).toContain('El asunto es obligatorio');
    });

    it('sin destinatarios no puede enviarse', () => {
      const correo = new Correo(ana, { asunto: 'Hola' });
      expect(correo.puedeEnviarse()).toBe(false);
      expect(correo.validarParaEnvio()).toContain('Debe haber al menos un destinatario');
    });

    it('informa todos los problemas a la vez', () => {
      expect(new Correo(ana).validarParaEnvio()).toHaveLength(2);
    });
  });
});

describe('RF-08 · Leído / no leído', () => {
  it('se puede marcar como leído', () => {
    const correo = new Correo(ana, { asunto: 'Hola', para: [beto] });
    correo.marcarComoLeido();
    expect(correo.leido).toBe(true);
  });

  it('se puede volver a marcar como no leído', () => {
    const correo = new Correo(ana, { asunto: 'Hola', para: [beto] });
    correo.marcarComoLeido();
    correo.marcarComoNoLeido();
    expect(correo.leido).toBe(false);
  });

  it('el estado se mantiene al consultarlo varias veces y es idempotente', () => {
    const correo = new Correo(ana, { asunto: 'Hola', para: [beto] });
    correo.marcarComoLeido();
    correo.marcarComoLeido();
    expect(correo.leido).toBe(true);
    expect(correo.leido).toBe(true);
  });

  it('cambiar el estado de un correo no afecta a otros', () => {
    const c1 = new Correo(ana, { asunto: 'A', para: [beto] });
    const c2 = new Correo(ana, { asunto: 'B', para: [beto] });
    c1.marcarComoLeido();
    expect(c2.leido).toBe(false);
  });
});

describe('RF-09 (parcial) · Indicador de favorito', () => {
  it('se puede marcar y desmarcar como favorito', () => {
    const correo = new Correo(ana, { asunto: 'Hola', para: [beto] });
    correo.marcarComoFavorito();
    expect(correo.favorito).toBe(true);
    correo.desmarcarComoFavorito();
    expect(correo.favorito).toBe(false);
  });
});
