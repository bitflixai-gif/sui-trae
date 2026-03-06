export function parseJsonBody(input: any) {
  if (input == null) return {};
  if (typeof input === 'string') {
    try {
      const v = JSON.parse(input);
      if (v && typeof v === 'object') return v;
      throw new Error('invalid_json');
    } catch {
      throw new Error('invalid_json');
    }
  }
  if (typeof input === 'object') return input;
  throw new Error('invalid_json');
}
