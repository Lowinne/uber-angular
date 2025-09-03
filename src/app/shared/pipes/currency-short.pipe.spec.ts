import { CurrencyShortPipe } from './currency-short.pipe';

describe('CurrencyShortPipe', () => {
  it('create an instance', () => {
    const pipe = new CurrencyShortPipe();
    expect(pipe).toBeTruthy();
  });
});
