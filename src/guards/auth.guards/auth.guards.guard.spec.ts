import { AuthGuard } from './auth.guards.guard';

describe('AuthGuardsGuard', () => {
  it('should be defined', () => {
    expect(new AuthGuard()).toBeDefined();
  });
});
