import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it('should report healthy status', () => {
    const payload = controller.check();

    expect(payload.status).toBe('ok');
    expect(typeof payload.timestamp).toBe('string');
  });
});
