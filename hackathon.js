(function() {
  const form = document.getElementById('hackathonForm');
  const statusEl = document.getElementById('hackathonStatus');
  const BACKEND_URL = '/api/hackathon';

  function setStatus(msg, ok = true) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.style.color = ok ? '#a7f3d0' : '#fecaca';
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot
      const hp = document.getElementById('_hp_h');
      if (hp && hp.value) {
        setStatus('Erro de validação.');
        return;
      }

      const terms = document.getElementById('terms');
      if (terms && !terms.checked) {
        setStatus('Você precisa concordar com os termos de uso para continuar.', false);
        return;
      }

      const data = new FormData(form);
      const payload = new URLSearchParams();

      const fields = [
        'team_name',
        'leader_name',
        'leader_email',
        'celular',
        'leader_university',
        'member2_name',
        'member2_email',
        'member2_university',
        'member3_name',
        'member3_email',
        'member3_university'
      ];

      fields.forEach((key) => {
        payload.set(key, (data.get(key) || '').toString().trim());
      });

      payload.set('terms', terms?.checked ? 'true' : 'false');
      payload.set('_hp', hp?.value || '');

      try {
        setStatus('Enviando...', true);
        const resp = await fetch(BACKEND_URL, {
          method: 'POST',
          body: payload,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (!resp.ok) {
          const t = await resp.text();
          throw new Error(t || `HTTP ${resp.status}`);
        }

        const result = await resp.json();
        if (result.success) {
          window.location.href = 'hackathon-confirmada.html';
        } else {
          setStatus(result.message || 'Erro desconhecido', false);
        }
      } catch (err) {
        setStatus(`Erro de conexão: ${err.message}`, false);
        console.error('[HACKATHON SUBMIT]', err);
      }
    });
  }
})();
