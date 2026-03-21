import http from 'k6/http';
import { check } from 'k6';

/** In Compose, default hits the nginx service. On the host: `BASE_URL=http://localhost:9080 k6 run loadtest/script.js` */
const baseUrl = __ENV.BASE_URL || 'http://nginx:80';

export const options = {
  scenarios: {
    generate_short_urls: {
      executor: 'constant-arrival-rate',
      rate: 1000,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 1000,
      maxVUs: 1000,
    },
  },
};

export default function () {
  const payload = JSON.stringify({
    url: `https://example.com/${__VU}-${__ITER}-${Date.now()}`,
  });
  const res = http.post(`${baseUrl}/short-url`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, {
    'status is 201': (r) => r.status === 201,
  });
}
