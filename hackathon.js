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

      // Mapear campos do formulário para o que o backend Python espera
      payload.set('nome1', (data.get('leader_name') || '').toString().trim());
      payload.set('nome2', (data.get('member2_name') || 'N/A').toString().trim());
      payload.set('nome3', (data.get('member3_name') || 'N/A').toString().trim());
      payload.set('celular', (data.get('celular') || '').toString().trim());
      payload.set('email', (data.get('leader_email') || '').toString().trim());
      
      // Campos adicionais que vão para o Supabase mas não são validados pelo Python
      payload.set('team_name', (data.get('team_name') || '').toString().trim());
      payload.set('leader_name', (data.get('leader_name') || '').toString().trim());
      payload.set('leader_email', (data.get('leader_email') || '').toString().trim());
      payload.set('leader_university', (data.get('leader_university') || '').toString().trim());
      payload.set('member2_name', (data.get('member2_name') || '').toString().trim());
      payload.set('member2_email', (data.get('member2_email') || '').toString().trim());
      payload.set('member2_university', (data.get('member2_university') || '').toString().trim());
      payload.set('member3_name', (data.get('member3_name') || '').toString().trim());
      payload.set('member3_email', (data.get('member3_email') || '').toString().trim());
      payload.set('member3_university', (data.get('member3_university') || '').toString().trim());

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
