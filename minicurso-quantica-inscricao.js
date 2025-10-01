(function () {
  const form = document.getElementById('quanticaForm');
  const statusEl = document.getElementById('quanticaStatus');
  const BACKEND_URL = '/api/minicurso-quantica';

  function setStatus(message, ok = true) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.style.color = ok ? '#a7f3d0' : '#fecaca';
  }

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const hp = document.getElementById('_hp_q');
    if (hp && hp.value) {
      setStatus('Erro de validação.', false);
      return;
    }

    const data = new FormData(form);
    const payload = new URLSearchParams();

    const nome = (data.get('nome') || '').toString().trim();
    const telefone = (data.get('telefone') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const nusp = (data.get('nusp') || '').toString().trim();

    if (!nome || !telefone || !email) {
      setStatus('Informe nome, telefone e e-mail para prosseguir.', false);
      return;
    }

    payload.set('nome', nome);
    payload.set('telefone', telefone);
    payload.set('email', email);
    payload.set('nusp', nusp);
    payload.set('_hp', hp?.value || '');

    try {
      setStatus('Enviando...', true);
      const resp = await fetch(BACKEND_URL, {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `Erro ${resp.status}`);
      }

      const result = await resp.json();
      if (result.success) {
        window.location.href = 'minicurso-quantica-confirmada.html';
      } else {
        setStatus(result.message || 'Não foi possível enviar sua inscrição.', false);
      }
    } catch (error) {
      console.error('[QUANTICA SUBMIT]', error);
      setStatus(`Erro de conexão: ${error.message}`, false);
    }
  });
})();
