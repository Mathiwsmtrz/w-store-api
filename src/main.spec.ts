describe('main bootstrap', () => {
  it('configures nest app and protects swagger routes', async () => {
    jest.resetModules();

    const appMock = {
      enableCors: jest.fn(),
      setGlobalPrefix: jest.fn(),
      useGlobalPipes: jest.fn(),
      use: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    };
    const createMock = jest.fn().mockResolvedValue(appMock);
    const createDocumentMock = jest.fn().mockReturnValue({ openapi: '3.0.0' });
    const setupMock = jest.fn();

    class DocumentBuilderMock {
      setTitle() {
        return this;
      }
      setDescription() {
        return this;
      }
      setVersion() {
        return this;
      }
      build() {
        return { title: 'Store Back API' };
      }
    }

    jest.doMock('@nestjs/core', () => ({
      NestFactory: {
        create: createMock,
      },
    }));
    jest.doMock('@nestjs/swagger', () => ({
      ApiOperation: () => () => undefined,
      ApiParam: () => () => undefined,
      ApiQuery: () => () => undefined,
      ApiTags: () => () => undefined,
      DocumentBuilder: DocumentBuilderMock,
      SwaggerModule: {
        createDocument: createDocumentMock,
        setup: setupMock,
      },
    }));

    await import('./main');

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(appMock.enableCors).toHaveBeenCalledTimes(1);
    expect(appMock.setGlobalPrefix).toHaveBeenCalledWith('api/v1');
    expect(appMock.useGlobalPipes).toHaveBeenCalledTimes(1);
    expect(createDocumentMock).toHaveBeenCalledTimes(1);
    expect(setupMock).toHaveBeenCalledWith(
      'docs',
      appMock,
      expect.objectContaining({ openapi: '3.0.0' }),
      expect.objectContaining({
        customCssUrl: expect.stringContaining('swagger-ui.css'),
        customJs: expect.arrayContaining([
          expect.stringContaining('swagger-ui-bundle.js'),
          expect.stringContaining('swagger-ui-standalone-preset.js'),
        ]),
      }),
    );
    expect(appMock.listen).toHaveBeenCalledWith(process.env.PORT ?? 80);

    type UseCall = [
      path: string,
      handler: (req: unknown, res: unknown, next: () => void) => void,
    ];
    const useCalls = appMock.use.mock.calls as unknown as UseCall[];
    const docsMiddlewareCall = useCalls.find((call) => call[0] === '/docs');
    expect(docsMiddlewareCall).toBeDefined();
    const protectSwagger = docsMiddlewareCall?.[1] as (
      req: { headers: { authorization?: string } },
      res: {
        setHeader: jest.Mock;
        status: jest.Mock;
        send: jest.Mock;
      },
      next: jest.Mock,
    ) => void;

    const unauthorizedResponse = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();

    protectSwagger({ headers: {} }, unauthorizedResponse, next);
    expect(unauthorizedResponse.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();

    const invalidAuthResponse = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    protectSwagger(
      {
        headers: {
          authorization: `Basic ${Buffer.from('admin:wrong').toString('base64')}`,
        },
      },
      invalidAuthResponse,
      next,
    );
    expect(invalidAuthResponse.status).toHaveBeenCalledWith(401);

    const validResponse = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    protectSwagger(
      {
        headers: {
          authorization: `Basic ${Buffer.from('admin:admin').toString('base64')}`,
        },
      },
      validResponse,
      next,
    );
    expect(next).toHaveBeenCalledTimes(1);
  });
});
