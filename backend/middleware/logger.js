import morgan from 'morgan';

// Morgan log format: [REQUEST] METHOD URL STATUS - RESPONSE_TIMEms
// Example: [REQUEST] POST /api/repo/create 201 - 32ms
const requestLogger = morgan((tokens, req, res) => {
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const status = tokens.status(req, res);
  const responseTime = tokens['response-time'](req, res);
  return `[REQUEST] ${method} ${url} ${status} - ${responseTime}ms`;
});

export default requestLogger;
