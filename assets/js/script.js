(() => {
    const topbar = document.querySelector('.topbar');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelectorAll('.topnav a');

    // Mobile menu
    if (menuToggle && topbar) {
        menuToggle.addEventListener('click', () => {
            const open = topbar.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', String(open));
        });
    }
    navLinks.forEach((a) => {
        a.addEventListener('click', () => {
            topbar?.classList.remove('open');
            menuToggle?.setAttribute('aria-expanded', 'false');
        });
    });

    // Reveal on scroll
    const revealTargets = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealTargets.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });
        revealTargets.forEach((el) => io.observe(el));
    } else {
        revealTargets.forEach((el) => el.classList.add('in-view'));
    }

    // Active nav highlight
    const sections = [...document.querySelectorAll('section[id]')];
    if ('IntersectionObserver' in window && sections.length) {
        const setActive = (id) => {
            navLinks.forEach((a) => {
                const match = a.getAttribute('href') === `#${id}`;
                a.classList.toggle('active', match);
            });
        };
        const navIo = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) setActive(e.target.id);
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
        sections.forEach((s) => navIo.observe(s));
    }
})();
