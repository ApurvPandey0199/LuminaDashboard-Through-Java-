/**
 * Lumina Blog - Public Feed & Article Reader Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    updateNavState();
    loadPosts();

    const searchInput = document.getElementById('search-input');
    let debounceTimer;

    searchInput?.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const currentCategory = document.querySelector('.pill.active')?.dataset.category || '';
            loadPosts(e.target.value.trim(), currentCategory);
        }, 250);
    });

    // Category pills
    const pills = document.querySelectorAll('.pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const category = pill.dataset.category || '';
            const search = searchInput?.value.trim() || '';
            loadPosts(search, category);
        });
    });

    // Modal Close
    const modalClose = document.getElementById('modal-close');
    const modal = document.getElementById('article-modal');
    modalClose?.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
});

function updateNavState() {
    const navAuth = document.getElementById('nav-auth');
    if (!navAuth) return;

    if (api.auth.isAuthenticated()) {
        const user = api.auth.getUser() || { name: 'Author' };
        const initials = user.name ? user.name.charAt(0).toUpperCase() : 'U';

        navAuth.innerHTML = `
            <div class="nav-user">
                <a href="dashboard.html" class="btn btn-secondary btn-sm">
                    <span>Dashboard</span>
                </a>
                <div class="user-avatar" title="${user.name} (${user.email})">${initials}</div>
                <button onclick="api.auth.logout()" class="btn btn-danger btn-sm" title="Sign Out">
                    <span>Logout</span>
                </button>
            </div>
        `;
    } else {
        navAuth.innerHTML = `
            <a href="auth.html" class="nav-link">Sign In</a>
            <a href="auth.html?mode=register" class="btn btn-primary btn-sm">Get Started</a>
        `;
    }
}

async function loadPosts(search = '', category = '') {
    const grid = document.getElementById('posts-grid');
    const emptyState = document.getElementById('empty-state');
    if (!grid) return;

    grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 0;">
            <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid rgba(99, 102, 241, 0.2); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
            <p style="margin-top: 1rem; color: var(--text-secondary);">Loading articles from database...</p>
        </div>
    `;

    try {
        const posts = await api.posts.getAll(search, category);

        if (!posts || posts.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        grid.innerHTML = posts.map(post => {
            const cover = post.coverImage || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80';
            const dateStr = post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently';
            const authorName = post.author ? post.author.name : 'Staff Writer';
            const authorInitials = authorName.charAt(0).toUpperCase();

            return `
                <article class="post-card" id="post-${post.id}">
                    <div class="post-thumb-wrapper">
                        <img class="post-thumb" src="${cover}" alt="${escapeHtml(post.title)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80'">
                        <span class="post-badge">${escapeHtml(post.category || 'Technology')}</span>
                    </div>
                    <div class="post-content">
                        <div class="post-meta">
                            <span>📅 ${dateStr}</span>
                            <span>•</span>
                            <span>💬 ${post.commentCount || 0} comments</span>
                        </div>
                        <h2 class="post-title">${escapeHtml(post.title)}</h2>
                        <p class="post-excerpt">${escapeHtml(post.summary || '')}</p>
                        <div class="post-footer">
                            <div class="post-author">
                                <div class="user-avatar" style="width: 28px; height: 28px; font-size: 0.75rem;">${authorInitials}</div>
                                <span>${escapeHtml(authorName)}</span>
                            </div>
                            <button onclick="readArticle(${post.id})" class="btn btn-secondary btn-sm">Read More →</button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    } catch (err) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 0; color: var(--danger);">
                <p>Failed to load articles: ${escapeHtml(err.message)}</p>
                <button onclick="loadPosts()" class="btn btn-secondary btn-sm" style="margin-top: 1rem;">Retry</button>
            </div>
        `;
    }
}

async function readArticle(id) {
    const modal = document.getElementById('article-modal');
    const modalBody = document.getElementById('modal-body');
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
        <div style="text-align: center; padding: 4rem 0;">
            <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid rgba(99, 102, 241, 0.2); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        </div>
    `;
    modal.classList.add('active');

    try {
        const post = await api.posts.getById(id);
        const comments = await api.comments.getByPost(id);

        const dateStr = post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
        const authorName = post.author ? post.author.name : 'Unknown';

        // Convert simple markdown / newlines to clean HTML
        let formattedContent = escapeHtml(post.content)
            .replace(/\n\n/g, '</p><p style="margin-bottom: 1.25rem; line-height: 1.8;">')
            .replace(/\n/g, '<br/>');

        modalBody.innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <span class="status-badge status-published" style="margin-bottom: 0.75rem;">${escapeHtml(post.category || 'General')}</span>
                <h1 style="font-size: 2rem; margin: 0.5rem 0 1rem;">${escapeHtml(post.title)}</h1>
                <div style="display: flex; align-items: center; gap: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
                    <span>✍️ By <strong>${escapeHtml(authorName)}</strong></span>
                    <span>•</span>
                    <span>📅 ${dateStr}</span>
                </div>
            </div>

            ${post.coverImage ? `<img src="${post.coverImage}" alt="${escapeHtml(post.title)}" style="width: 100%; max-height: 380px; object-fit: cover; border-radius: var(--radius-md); margin-bottom: 2rem;">` : ''}

            <div style="color: #d1d5db; font-size: 1.05rem; line-height: 1.8; margin-bottom: 3rem;">
                <p style="margin-bottom: 1.25rem;">${formattedContent}</p>
            </div>

            <hr style="border: 0; border-top: 1px solid var(--border); margin: 2rem 0;">

            <!-- Comments Section -->
            <div>
                <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span>Discussion</span>
                    <span style="font-size: 0.9rem; background: rgba(255, 255, 255, 0.1); padding: 0.2rem 0.6rem; border-radius: var(--radius-full);">${comments ? comments.length : 0}</span>
                </h3>

                <!-- Add Comment Form -->
                <form id="comment-form" onsubmit="submitComment(event, ${post.id})" style="margin-bottom: 2rem; background: rgba(0, 0, 0, 0.25); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border);">
                    <div style="margin-bottom: 0.75rem;">
                        <textarea id="comment-content" class="form-control" placeholder="Add to the discussion... (Markdown supported)" required style="min-height: 70px;"></textarea>
                    </div>
                    ${!api.auth.isAuthenticated() ? `
                        <div style="margin-bottom: 0.75rem;">
                            <input type="text" id="comment-author" class="form-control" placeholder="Your name (optional for guest reader)" style="max-width: 300px;">
                        </div>
                    ` : ''}
                    <div style="display: flex; justify-content: flex-end;">
                        <button type="submit" class="btn btn-primary btn-sm">Post Comment</button>
                    </div>
                </form>

                <!-- Comments List -->
                <div id="comments-list" style="display: flex; flex-direction: column; gap: 1rem;">
                    ${renderCommentsList(comments)}
                </div>
            </div>
        `;
    } catch (err) {
        modalBody.innerHTML = `
            <div style="text-align: center; color: var(--danger); padding: 2rem;">
                <p>Failed to load article details: ${escapeHtml(err.message)}</p>
            </div>
        `;
    }
}

function renderCommentsList(comments) {
    if (!comments || comments.length === 0) {
        return `<p style="color: var(--text-muted); font-size: 0.9rem; font-style: italic;">No comments yet. Be the first to share your thoughts!</p>`;
    }

    return comments.map(c => {
        const dateStr = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '';
        return `
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem; font-size: 0.85rem;">
                    <span style="font-weight: 600; color: var(--text-primary);">${escapeHtml(c.authorName || 'Guest')}</span>
                    <span style="color: var(--text-muted);">${dateStr}</span>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.95rem;">${escapeHtml(c.content)}</p>
            </div>
        `;
    }).join('');
}

async function submitComment(e, postId) {
    e.preventDefault();
    const contentInput = document.getElementById('comment-content');
    const authorInput = document.getElementById('comment-author');
    const content = contentInput.value.trim();
    const authorName = authorInput ? authorInput.value.trim() : null;

    if (!content) return;

    try {
        await api.comments.add(postId, content, authorName);
        Toast.show('Comment posted successfully!', 'success');
        readArticle(postId); // Refresh
    } catch (err) {
        Toast.show(err.message || 'Failed to post comment', 'error');
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

window.readArticle = readArticle;
window.submitComment = submitComment;
