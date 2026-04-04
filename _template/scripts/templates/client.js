// Syntax highlighting
document.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));

// LaTeX rendering
renderMathInElement(document.querySelector('.markdown-body'), {
  delimiters: [
    { left: '$$', right: '$$', display: true },
    { left: '$', right: '$', display: false },
    { left: '\\\\(', right: '\\\\)', display: false },
    { left: '\\\\[', right: '\\\\]', display: true },
  ],
  throwOnError: false,
});

// Search / filter
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase();
  document.querySelectorAll('.note-link').forEach(link => {
    const text = link.textContent.toLowerCase();
    link.style.display = text.includes(q) ? '' : 'none';
  });
  document.querySelectorAll('.category').forEach(cat => {
    const visibleLinks = cat.querySelectorAll('.note-link:not([style*="display: none"])');
    cat.style.display = visibleLinks.length > 0 ? '' : 'none';
    if (q && visibleLinks.length > 0) {
      cat.querySelector('.category-list')?.classList.remove('collapsed');
      cat.querySelector('.category-header')?.classList.remove('collapsed');
    }
  });
});

// Collapse/expand categories
document.querySelectorAll('.category-header').forEach(header => {
  header.addEventListener('click', () => {
    header.classList.toggle('collapsed');
    header.nextElementSibling?.classList.toggle('collapsed');
  });
});

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

// Close sidebar on mobile after clicking a link
document.querySelectorAll('.note-link').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) sidebar.classList.remove('open');
  });
});
