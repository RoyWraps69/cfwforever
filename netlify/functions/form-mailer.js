// DEPRECATED: this function moved to submission-created.js (Netlify's auto-invoked
// handler for form submissions). If anything is still calling /.netlify/functions/form-mailer
// directly (e.g., a dashboard webhook), update or remove it — submission-created.js
// fires on every form submission automatically and sends to roy@ + karigan@.
exports.handler = async function() {
  return {
    statusCode: 410,
    headers: { 'Content-Type': 'text/plain' },
    body: 'form-mailer has moved to submission-created (auto-invoked). No action taken.'
  };
};
