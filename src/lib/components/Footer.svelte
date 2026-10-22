<script lang="ts">
  import { base } from '$app/paths';
  import LogoJBA from './LogoJBA.svelte';

  const currentYear = new Date().getFullYear();
</script>

<footer class="jba-footer no-print">
  <div class="container footer-main">
    <div class="footer-grid">
      <div class="footer-brand-col">
        <LogoJBA variant="compact" theme="dark" />
        <p class="footer-description">
          Consultoria especializada em gestão pública, simplificação de rotinas administrativas e realização periódica de concursos públicos e processos seletivos.
        </p>
      </div>

      <div class="footer-col">
        <h3 class="footer-heading">Atuação</h3>
        <ul class="footer-list">
          <li><a href="{base}/atuacao#gestao">Gestão Pública e Simplificação de Rotinas</a></li>
          <li><a href="{base}/atuacao#governanca">Planejamento, Licitações e Governança</a></li>
          <li><a href="{base}/concursos">Concursos Públicos e Processos Seletivos</a></li>
          <li><a href="{base}/transparencia">Transparência e Conformidade LGPD</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h3 class="footer-heading">Área do Candidato</h3>
        <ul class="footer-list">
          <li><a href="{base}/concursos?aba=editais">Editais e Quadro de Vagas</a></li>
          <li><a href="{base}/concursos?aba=inscricao">Ficha de Inscrição Online</a></li>
          <li><a href="{base}/concursos?aba=consulta">Consultar Protocolo / Comprovante</a></li>
          <li><a href="{base}/concursos?aba=publicacoes">Publicações, Gabaritos e Recursos</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h3 class="footer-heading">Contato Institucional</h3>
        <div class="contact-list">
          <p>
            <strong>Atendimento a Órgãos Públicos:</strong><br />
            <span>contato@jbaconsultorias.com.br</span>
          </p>
          <p>
            <strong>Suporte a Concursos:</strong><br />
            <span>concursos@jbaconsultorias.com.br</span>
          </p>
          <p>
            <strong>Horário:</strong><br />
            Segunda a Sexta, das 08h às 18h
          </p>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {currentYear} <strong>JBA Consultorias e Soluções Públicas</strong>. Todos os direitos reservados.</p>
      <p class="footer-motto">SIMPLIFICANDO ROTINAS, OTIMIZANDO RESULTADOS</p>
    </div>
  </div>
</footer>

<style>
  .jba-footer {
    margin-top: auto;
    background-color: #06143a;
    color: rgba(250, 247, 240, 0.78);
    font-size: 0.875rem;
    border-top: 2px solid #c49539;
  }

  .footer-main {
    padding-top: 3.5rem;
    padding-bottom: 2rem;
  }

  .footer-grid {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr 1fr;
    gap: 2rem;
    padding-bottom: 2.5rem;
  }

  .footer-brand-col {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .footer-description {
    line-height: 1.65;
    max-width: 340px;
  }

  .footer-heading {
    font-family: var(--font-heading);
    color: #f9d567;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 1rem;
  }

  .footer-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .footer-list a {
    color: rgba(250, 247, 240, 0.78);
    line-height: 1.45;
  }

  .footer-list a:hover {
    color: #f9d567;
  }

  .contact-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    line-height: 1.5;
  }

  .contact-list strong {
    color: #FAF7F0;
    font-weight: 600;
  }

  .footer-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 0.8rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .footer-bottom strong {
    color: #FAF7F0;
  }

  .footer-motto {
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #f9d567;
    font-size: 0.72rem;
  }

  @media (max-width: 960px) {
    .footer-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 600px) {
    .footer-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
