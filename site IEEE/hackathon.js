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

      const data = new FormData(form);
      const payload = new URLSearchParams();

      ['nome1','nome2','nome3','nusp1','nusp2','nusp3','celular','email'].forEach(k => {
        payload.set(k, data.get(k) || '');
      });

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
