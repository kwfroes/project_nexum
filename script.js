const THEME_STORAGE_KEY = 'nexum-theme';

function getPreferredTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

function applyTheme(theme) {
    const root = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const isDark = theme === 'dark';

    root.dataset.theme = theme;

    if (themeToggle) {
        themeToggle.setAttribute(
            'aria-label',
            isDark ? 'Ativar tema claro' : 'Ativar tema escuro'
        );

        themeToggle.setAttribute(
            'title',
            isDark ? 'Ativar tema claro' : 'Ativar tema escuro'
        );

        themeToggle.setAttribute('aria-pressed', String(isDark));
    }

    const themeColor = document.querySelector(
        'meta[name="theme-color"]'
    );

    if (themeColor) {
        themeColor.setAttribute(
            'content',
            isDark ? '#111827' : '#FAFAF8'
        );
    }
}

function initializeTheme() {
    applyTheme(getPreferredTheme());

    const themeToggle = document.getElementById('theme-toggle');

    if (!themeToggle) {
        return;
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme =
            document.documentElement.dataset.theme || 'light';

        const nextTheme =
            currentTheme === 'dark' ? 'light' : 'dark';

        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        applyTheme(nextTheme);
    });
}

initializeTheme();
lucide.createIcons();


// Animação de rolagem (Fade In simples)
document.addEventListener("DOMContentLoaded", () => {
    const reveals = document.querySelectorAll(".reveal");

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target); // Para animar apenas uma vez
            }
        });
    }, {
        threshold: 0.15 // Dispara quando 15% do elemento estiver visível
    });

    reveals.forEach(reveal => {
        revealOnScroll.observe(reveal);
    });
});

// Handler do formulário de contato
const form = document.getElementById('form-contato');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('nome').value;
        const empresa = document.getElementById('empresa').value;
        const desafio = document.getElementById('desafio').value;
        
        // Formata a mensagem para o WhatsApp
        const msg = `Olá, sou ${nome} da empresa ${empresa}. Meu maior gargalo operacional hoje é: ${desafio}`;
        
        // Lembre-se de substituir o número abaixo pelo WhatsApp real da Nexum (DDI + DDD + Número)
        const numeroWhatsApp = '55XXXXXXXXXXX';
        
        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(msg)}`;
        
        // Abre o WhatsApp em uma nova aba
        window.open(url, '_blank');
    });
}

const steps = 6;
const answers = {};

function progress(n){ document.getElementById('prog').style.width = (n/steps*100)+'%'; }

function showStep(n){
  document.querySelectorAll('.step').forEach(s=>s.classList.remove('active'));
  document.getElementById('s'+n).classList.add('active');
  progress(n);
}

function clearErr(id){ document.getElementById(id).textContent=''; }

function syncSelected(container){
  container.querySelectorAll('.opt').forEach(opt=>{
    const inp = opt.querySelector('input');
    opt.classList.toggle('selected', inp.checked);
  });
}

document.querySelectorAll('.opt input').forEach(inp=>{
  inp.addEventListener('change', ()=>{
    syncSelected(inp.closest('.options'));
    clearErr('e'+inp.closest('.step').id.replace('s',''));
  });
});

function next(n){
  const err = document.getElementById('e'+n);
  if(n===1){
    const v = document.querySelector('input[name="porte"]:checked');
    if(!v){ err.textContent='Selecione uma opção para continuar.'; return; }
    answers.porte = v.value;
  }
  if(n===2){
    const vs = [...document.querySelectorAll('#opts2 input:checked')].map(i=>i.value);
    if(!vs.length){ err.textContent='Selecione ao menos uma opção.'; return; }
    answers.gestao = vs;
  }
  if(n===3){
    const vs = [...document.querySelectorAll('#opts3 input:checked')].map(i=>i.value);
    if(!vs.length){ err.textContent='Selecione ao menos uma opção.'; return; }
    if(vs.length>2){ err.textContent='Selecione até 2 opções.'; return; }
    answers.perdas = vs;
  }
  if(n===4){
    const v = document.querySelector('input[name="dor"]:checked');
    if(!v){ err.textContent='Selecione uma opção para continuar.'; return; }
    answers.dor = v.value;
  }
  if(n===5){
    const v = document.querySelector('input[name="urgencia"]:checked');
    if(!v){ err.textContent='Selecione uma opção para continuar.'; return; }
    answers.urgencia = v.value;
  }
  showStep(n+1);
}

function back(n){ showStep(n-1); }

function finish(){
  const desc = document.getElementById('descricao').value.trim();
  if(!desc){ document.getElementById('e6').textContent='Descreva o problema para continuar.'; return; }
  answers.descricao = desc;
  renderResult();
  showStep(7);
  document.getElementById('prog').style.width='100%';
}

function enviarDiagnosticoWpp() {
    const nome = document.getElementById('diag-nome').value.trim();
    const empresa = document.getElementById('diag-empresa').value.trim();
    const errEl = document.getElementById('e-diag');

    if (!nome || !empresa) {
        errEl.textContent = 'Preencha seu nome e empresa para continuar.';
        return;
    }

    const { porte, perdas, dor, urgencia, descricao } = answers;

    const perdaMap = {estoque:'Controle de estoque',financeiro:'Gestão financeira',demandas:'Gestão de demandas',relatorios:'Relatórios gerenciais',retrabalho:'Retrabalho operacional'};
    const dorMap = {complexo:'Adoção pela equipe',manual:'Eficiência e automação',mobile:'Acessibilidade mobile',visibilidade:'Visibilidade para gestão',nenhum:'Digitalização completa do processo'};

    const perdasLabel = (perdas || []).map(p => perdaMap[p] || p).join(', ');
    const dorLabel = dorMap[dor] || dor;
    const urgenciaLabel = { critico: 'Crítica — impacto imediato', breve: 'Breve — 1 a 3 meses', planejando: 'Planejamento futuro' }[urgencia] || urgencia;

    const msg =
`Olá! Acabei de fazer o diagnóstico no site da Nexum.

*Nome:* ${nome}
*Empresa:* ${empresa}
*Porte:* ${porte} colaboradores

*Principais gargalos:* ${perdasLabel}
*Dor principal:* ${dorLabel}
*Urgência:* ${urgenciaLabel}

*O que descrevemos:* ${descricao}

Gostaria de conversar sobre como resolver isso.`;

    const url = `https://wa.me/55XXXXXXXXXXX?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}


function renderResult(){
  const {porte, perdas, dor, urgencia, descricao} = answers;

  const urgTag = urgencia==='critico'
    ? '<span class="tag tag-red">Urgência alta</span>'
    : urgencia==='breve'
    ? '<span class="tag tag-amber">Urgência média</span>'
    : '<span class="tag tag-green">Planejamento</span>';

  const perdaMap = {estoque:'Controle de estoque',financeiro:'Gestão financeira',demandas:'Gestão de demandas',relatorios:'Relatórios gerenciais',retrabalho:'Retrabalho operacional'};
  const dorMap = {complexo:'Adoção pela equipe',manual:'Eficiência e automação',mobile:'Acessibilidade mobile',visibilidade:'Visibilidade para gestão',nenhum:'Digitalização completa do processo'};
  const solMap = {estoque:'Estoque Mobile — controle em tempo real pelo celular.',financeiro:'Cockpit de Gestão — fechamento e métricas centralizados.',demandas:'Gestor de Demandas — rastreamento completo de tarefas.',relatorios:'Cockpit de Gestão — dashboard de relatórios automatizados.',retrabalho:'Gestor de Demandas — comunicação estruturada entre equipes.'};

  const perdasLabel = (perdas||[]).map(p=>perdaMap[p]||p).join(', ');
  const dorLabel = dorMap[dor] || dor;
  const solucoes = [...new Set((perdas||[]).map(p=>solMap[p]).filter(Boolean))];

// NOVO
  function esc(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  document.getElementById('resultado').innerHTML = `
    ${urgTag}
    <div class="result-card">
      <h3>Principais gargalos identificados</h3>
      <p>${esc(perdasLabel) || '—'}</p>
    </div>
    <div class="result-card">
      <h3>Foco da solução</h3>
      <p>${esc(dorLabel)}</p>
    </div>
    <div class="result-card">
      <h3>Sistemas que provavelmente se aplicam</h3>
      <p>${solucoes.map(esc).join('<br>') || 'A definir após diagnóstico aprofundado.'}</p>
    </div>
    <div class="result-card">
      <h3>O que você descreveu</h3>
      <p style="font-style:italic">"${esc(descricao)}"</p>
    </div>
  `;


}

// NOVO — versão limpa, sem duplicata
// ====== CONTROLE DOS MODAIS DE MOCKUP ======
function abrirModalMockup(tipoApp) {
    const modal = document.getElementById(`modal-mockup-${tipoApp}`);
    if (!modal) return;
    modal.classList.add('active');
    lucide.createIcons();
    document.body.style.overflow = 'hidden';
}

function fecharModalMockup() {
    document.querySelectorAll('.modal-overlay.active').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) fecharModalMockup();
    });
});

// Fechar modais com Esc
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharModalMockup();
});

function initializeCockpitNavigation() {
    const cockpitModal = document.getElementById(
        'modal-mockup-cockpit'
    );

    if (!cockpitModal) {
        return;
    }

    const navigationButtons = cockpitModal.querySelectorAll(
        '.dash-nav-item[data-screen]'
    );

    const screens = cockpitModal.querySelectorAll(
        '.dash-screen[data-screen-panel]'
    );

    navigationButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const targetScreen = button.dataset.screen;

            navigationButtons.forEach((item) => {
                const isActive = item === button;

                item.classList.toggle('active', isActive);
                item.setAttribute(
                    'aria-pressed',
                    String(isActive)
                );
            });

            screens.forEach((screen) => {
                const isTarget =
                    screen.dataset.screenPanel === targetScreen;

                screen.classList.toggle('active', isTarget);
            });

            if (window.lucide) {
                lucide.createIcons();
            }
        });
    });
}

document.addEventListener(
    'DOMContentLoaded',
    initializeCockpitNavigation
);

// =========================================
// CONTROLE DE NAVEGAÇÃO DO ESTOQUE MOBILE
// =========================================
function initializeMobileMockupNavigation() {
    const estoqueModal = document.getElementById('modal-mockup-estoque');
    if (!estoqueModal) return;

    const navButtons = estoqueModal.querySelectorAll('.mobile-nav-btn[data-mobile-nav]');
    const screens = estoqueModal.querySelectorAll('.mobile-screen[data-mobile-screen]');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetScreen = button.dataset.mobileNav;

            // Atualiza botões ativos
            navButtons.forEach(btn => {
                const isActive = btn === button;
                btn.classList.toggle('active', isActive);
            });

            // Alterna a tela correspondente
            screens.forEach(screen => {
                const isTarget = screen.dataset.mobileScreen === targetScreen;
                screen.classList.toggle('active', isTarget);
            });

            if (window.lucide) {
                lucide.createIcons();
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', initializeMobileMockupNavigation);

// ============================================================
// PORTAL DE TOOLTIP para o .mobile-device
// Resolve: overflow:hidden do celular cortava os balões
// ============================================================
(function () {
    const portal      = document.getElementById('tooltip-portal');
    const portalBubble = portal.querySelector('.portal-bubble');
    let activeHotspot = null;

    function showPortalTooltip(hotspot) {
        // Lê o conteúdo HTML do tooltip original (filho do hotspot)
        const originalTooltip = hotspot.querySelector('.tooltip');
        if (!originalTooltip) return;

        portalBubble.innerHTML = originalTooltip.innerHTML;

        // Decide se a seta aponta para cima ou para baixo
        const isBottom = originalTooltip.classList.contains('tooltip-bottom');
        portalBubble.classList.toggle('arrow-up', isBottom);

        // Posiciona o portal próximo ao hotspot usando coordenadas da viewport
        const rect = hotspot.getBoundingClientRect();

        // Mostra temporariamente (invisível) para medir largura real do balão
        portal.style.visibility = 'hidden';
        portal.style.opacity    = '0';
        portal.style.display    = 'block';
        const bubbleW = portalBubble.offsetWidth;
        const bubbleH = portalBubble.offsetHeight;

        let top, left;

        if (isBottom) {
            // Balão aparece ABAIXO do hotspot
            top  = rect.bottom + 8;
            left = rect.left + rect.width / 2 - bubbleW / 2;
        } else {
            // Balão aparece ACIMA do hotspot (padrão)
            top  = rect.top - bubbleH - 12;
            left = rect.left + rect.width / 2 - bubbleW / 2;
        }

        // Impede vazar pela borda esquerda/direita da tela
        const margin = 8;
        left = Math.max(margin, Math.min(left, window.innerWidth - bubbleW - margin));

        portal.style.top  = top  + 'px';
        portal.style.left = left + 'px';

        // Exibe com animação
        portal.style.display    = '';
        portal.style.visibility = '';
        portal.style.opacity    = '';
        portal.classList.add('visible');
        activeHotspot = hotspot;
    }

    function hidePortalTooltip() {
        portal.classList.remove('visible');
        activeHotspot = null;
    }

    // Delega eventos em todos os hotspots DENTRO do .mobile-device
    const mobileDevice = document.querySelector('.mobile-device');
    if (!mobileDevice) return;

    mobileDevice.addEventListener('mouseover', function (e) {
        const hotspot = e.target.closest('.hotspot');
        if (hotspot && hotspot !== activeHotspot) {
            showPortalTooltip(hotspot);
        }
    });

    mobileDevice.addEventListener('mouseout', function (e) {
        const hotspot = e.target.closest('.hotspot');
        if (hotspot) {
            // Só esconde se o mouse saiu do hotspot de vez
            const related = e.relatedTarget;
            if (!hotspot.contains(related)) {
                hidePortalTooltip();
            }
        }
    });

    // Suporte a toque (mobile real): toca uma vez abre, toca fora fecha
    mobileDevice.addEventListener('touchstart', function (e) {
        const hotspot = e.target.closest('.hotspot');
        if (hotspot) {
            e.preventDefault();
            if (activeHotspot === hotspot) {
                hidePortalTooltip();
            } else {
                showPortalTooltip(hotspot);
            }
        } else if (activeHotspot) {
            hidePortalTooltip();
        }
    }, { passive: false });
})();

// ============================================================
// NAVEGAÇÃO POR ABAS — Modal Gestor de Demandas
// ============================================================
function initializeDemandasNavigation() {
    const modal = document.getElementById('modal-mockup-demandas');
    if (!modal) return;

    const tabs = modal.querySelectorAll('.demandas-tab');
    const panels = modal.querySelectorAll('.demandas-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.demandasTab;

            // Alterna a classe 'active' nas abas
            tabs.forEach(t => t.classList.toggle('active', t === tab));

            // Alterna a classe 'active' nos painéis (o CSS cuida do display)
            panels.forEach(p => {
                p.classList.toggle('active', p.dataset.demandasPanel === target);
            });

            // Recarrega os ícones caso a nova aba tenha ícones não renderizados
            if (window.lucide) {
                lucide.createIcons();
            }
        });
    });
}


document.addEventListener('DOMContentLoaded', initializeDemandasNavigation);

// ============================================================
// CONTROLE DE TEMA INTERNO DOS MOCKUPS
// ============================================================
function toggleMockupTheme(btn) {
    // Busca a casca principal de qualquer um dos 3 mockups
    const mockupContainer = btn.closest('.app-mockup') || 
                            btn.closest('.mobile-device') || 
                            btn.closest('.dashboard-mockup');
    
    if (mockupContainer) {
        if (mockupContainer.classList.contains('mockup-theme-dark')) {
            mockupContainer.classList.remove('mockup-theme-dark');
            mockupContainer.classList.add('mockup-theme-light');
        } else {
            mockupContainer.classList.remove('mockup-theme-light');
            mockupContainer.classList.add('mockup-theme-dark');
        }
    }
}