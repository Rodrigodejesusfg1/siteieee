// Inscrições: validação, condicional e envio para Google Apps Script
(function() {
  const menu = document.getElementById('nav-menu');
  const toggle = document.getElementById('nav-toggle');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('active');
    });
  }

  const indicacaoCheckbox = document.getElementById('chkIndicacao');
  const indicacaoWrapper = document.getElementById('indicacaoWrapper');
  if (indicacaoCheckbox && indicacaoWrapper) {
    indicacaoCheckbox.addEventListener('change', () => {
      indicacaoWrapper.classList.toggle('hidden', !indicacaoCheckbox.checked);
      const input = document.getElementById('indicacao');
      if (input) {
        input.required = indicacaoCheckbox.checked;
      }
    });
  }

  const form = document.getElementById('inscricaoForm');
  const statusEl = document.getElementById('formStatus');

  // URL do backend em produção (Vercel Serverless Function)
  const BACKEND_URL = '/api/inscricao';

  function setStatus(msg, ok = true) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.style.color = ok ? '#a7f3d0' : '#fecaca';
    // Log para debug
    console.log(`[FORM STATUS] ${ok ? 'SUCCESS' : 'ERROR'}: ${msg}`);
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot
      const hp = document.getElementById('_hp');
      if (hp && hp.value) {
        setStatus('Erro de validação.');
        return;
      }

      // Coleta dados
      const data = new FormData(form);

      // Serializa checkboxes de divulgação
      const divulgacoes = [];
      form.querySelectorAll('input[name="divulgacao"]:checked').forEach(chk => divulgacoes.push(chk.value));

      // Monta pares para x-www-form-urlencoded (evita CORS preflight)
      const payload = new URLSearchParams();
      payload.set('nome', data.get('nome') || '');
      payload.set('email', data.get('email') || '');
      payload.set('telefone', data.get('telefone') || '');
      payload.set('faculdade', data.get('faculdade') || '');
      payload.set('nusp', data.get('nusp') || '');
      payload.set('curso', data.get('curso') || '');
      payload.set('ingresso', data.get('ingresso') || '');
      payload.set('membro_ieee', data.get('membro_ieee') || '');
      payload.set('voluntario_ieee', data.get('voluntario_ieee') || '');
      payload.set('divulgacao', divulgacoes.join(', '));
      payload.set('indicacao', data.get('indicacao') || '');

      // Adiciona honeypot para o backend
      payload.set('_hp', document.getElementById('_hp')?.value || '');

      console.log('[FORM SUBMIT] Enviando dados:', Object.fromEntries(payload));

      try {
        setStatus('Enviando...', true);
        const resp = await fetch(BACKEND_URL, {
          method: 'POST',
          body: payload,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        });

        console.log('[FORM SUBMIT] Response status:', resp.status);

        if (!resp.ok) {
          const errorText = await resp.text();
          console.error('[FORM SUBMIT] Response error:', errorText);
          throw new Error(`Erro ${resp.status}: ${errorText}`);
        }

        const result = await resp.json();
        console.log('[FORM SUBMIT] Response data:', result);

        if (result.success) {
          // Redireciona para a página de sucesso
          window.location.href = 'inscricao-confirmada.html';
        } else {
          setStatus(`❌ ${result.message || 'Erro desconhecido'}`, false);
        }
      } catch (err) {
        console.error('[FORM SUBMIT] Network/Parse error:', err);
        setStatus(`❌ Erro de conexão: ${err.message}`, false);
      }
    });
  }
})();
