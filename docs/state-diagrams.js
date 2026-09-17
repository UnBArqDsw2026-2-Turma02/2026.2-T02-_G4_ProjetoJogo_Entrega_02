(function () {
  'use strict';

  var viewer = document.createElement('dialog');
  viewer.className = 'diagram-viewer';
  viewer.setAttribute('aria-labelledby', 'diagram-viewer-title');
  viewer.innerHTML = '<h2 class="diagram-viewer-title" id="diagram-viewer-title"></h2>' +
    '<div class="diagram-viewer-toolbar">' +
    '<label>Zoom <input type="range" min="1" max="100" value="10" aria-label="Zoom do diagrama"></label>' +
    '<output aria-live="polite"></output>' +
    '<a target="_blank" rel="noopener">Imagem original</a>' +
    '<button type="button" aria-label="Fechar diagrama" title="Fechar diagrama">\u00d7</button>' +
    '</div><div class="diagram-viewer-scroll" tabindex="0" aria-label="Diagrama ampliado"><img alt=""></div>';
  document.body.appendChild(viewer);

  var image = viewer.querySelector('img');
  var slider = viewer.querySelector('input');
  var viewport = viewer.querySelector('.diagram-viewer-scroll');
  var trigger;

  function resizeImage() {
    var previousWidth = image.clientWidth;
    var centerX = (viewport.scrollLeft + viewport.clientWidth / 2) / previousWidth;
    var centerY = (viewport.scrollTop + viewport.clientHeight / 2) / previousWidth;
    image.style.width = Math.round(image.naturalWidth * Number(slider.value) / 100) + 'px';
    if (previousWidth) {
      viewport.scrollLeft = centerX * image.clientWidth - viewport.clientWidth / 2;
      viewport.scrollTop = centerY * image.clientWidth - viewport.clientHeight / 2;
    }
    viewer.querySelector('output').textContent = slider.value + '%';
  }

  function openDiagram(source) {
    trigger = source;
    slider.disabled = true;
    viewer.querySelector('h2').textContent = source.alt;
    viewer.querySelector('a').href = source.src;
    image.alt = source.alt;
    image.onload = function () {
      slider.value = Math.max(1, Math.min(100, Math.floor(viewport.clientWidth / image.naturalWidth * 100)));
      resizeImage();
      viewport.scrollTo(0, 0);
      slider.disabled = false;
    };
    viewer.showModal();
    document.body.classList.add('diagram-viewer-open');
    image.src = source.src;
    viewer.querySelector('button').focus();
  }

  // Capture only these diagrams before the existing Docsify zoom handler.
  document.addEventListener('click', function (event) {
    if (!event.target.matches('.state-diagram img')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openDiagram(event.target);
  }, true);
  document.addEventListener('keydown', function (event) {
    if (event.target.matches('.state-diagram img') && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openDiagram(event.target);
    }
  });
  slider.addEventListener('input', resizeImage);
  viewer.querySelector('button').addEventListener('click', function () { viewer.close(); });
  viewer.addEventListener('click', function (event) { if (event.target === viewer) viewer.close(); });
  viewer.addEventListener('close', function () {
    document.body.classList.remove('diagram-viewer-open');
    if (trigger && trigger.isConnected) trigger.focus();
  });
  window.addEventListener('hashchange', function () { if (viewer.open) viewer.close(); });
}());
