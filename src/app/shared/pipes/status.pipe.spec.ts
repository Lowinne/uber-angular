import { StatusPipe } from './status.pipe';

describe('StatusPipe', () => {
  const pipe = new StatusPipe();

  it('should translate known statuses', () => {
    expect(pipe.transform('requested')).toBe('Demandée');
    expect(pipe.transform('ongoing')).toBe('En cours');
    expect(pipe.transform('completed')).toBe('Terminée');
  });

  it('should return raw value if unknown', () => {
    expect(pipe.transform('unknown')).toBe('unknown');
  });
});
