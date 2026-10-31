import { extraerIdYoutube } from './youtube';

describe('extraerIdYoutube', () => {
  const id = 'dQw4w9WgXcQ';

  it('reconoce los formatos habituales de YouTube', () => {
    expect(extraerIdYoutube(`https://www.youtube.com/watch?v=${id}`)).toBe(id);
    expect(extraerIdYoutube(`https://youtu.be/${id}?t=10`)).toBe(id);
    expect(extraerIdYoutube(`https://www.youtube.com/embed/${id}`)).toBe(id);
    expect(extraerIdYoutube(`https://www.youtube.com/shorts/${id}`)).toBe(id);
    expect(extraerIdYoutube(`https://m.youtube.com/watch?v=${id}&feature=share`)).toBe(id);
  });

  it('rechaza valores vacíos, otros dominios y identificadores no válidos', () => {
    expect(extraerIdYoutube(null)).toBeNull();
    expect(extraerIdYoutube('')).toBeNull();
    expect(extraerIdYoutube('no es una url')).toBeNull();
    expect(extraerIdYoutube(`https://example.com/watch?v=${id}`)).toBeNull();
    expect(extraerIdYoutube('https://www.youtube.com/watch?v=corto')).toBeNull();
    expect(extraerIdYoutube(`javascript:alert('${id}')`)).toBeNull();
  });
});
