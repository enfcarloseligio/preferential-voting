exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      NETLIFY_SITE_ID: process.env.NETLIFY_SITE_ID || 'missing',
      NETLIFY_BLOBS_TOKEN: process.env.NETLIFY_BLOBS_TOKEN ? 'present' : 'missing',
    }),
  };
};
