/**
 * Lumina Blog - Author Dashboard Controller (CRUD & Metrics)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Route guard
    if (!api.auth.requireAuth()) {
        return;
    }

    const user = api.auth.getUser() || { name: 'Author', email: '' };
    document.getElementById('author-greeting').innerText = `Welcome, ${user.name}`;
    document.getElementById('author-email').innerText = user.email;
    const initials = user.name ? user.name.charAt(0).toUpperCase() : 'A';
    const avatarEl = document.getElementById('author-avatar');
    if (avatarEl) avatarEl.innerText = initials;

    loadDashboardPosts();

    // Post Form Submit (Create / Edit)
    const postForm = document.getElementById('post-form');
    postForm?.addEventListener('submit', handlePostSubmit);

    // Cancel Edit Button
    const cancelBtn = document.getElementById('cancel-edit-btn');
    cancelBtn?.addEventListener('click', resetPostForm);

    // Image file upload preview
    const imageFileInput = document.getElementById('post-image-file');
    const imageUrlInput = document.getElementById('post-image-url');
    imageFileInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                Toast.show('Image size exceeds 5MB limit', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                imageUrlInput.value = event.target.result;
                showImagePreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    imageUrlInput?.addEventListener('input', (e) => {
        showImagePreview(e.target.value.trim());
    });
});

function showImagePreview(src) {
    const previewContainer = document.getElementById('image-preview-container');
    const previewImg = document.getElementById('image-preview');
    if (!previewContainer || !previewImg) return;

    if (src) {
        previewImg.src = src;
        previewContainer.style.display = 'block';
    } else {
        previewContainer.style.display = 'none';
    }
}

async function loadDashboardPosts() {
    const listContainer = document.getElementById('dashboard-posts-list');
    const emptyState = document.getElementById('dashboard-empty');
    if (!listContainer) return;

    listContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 0;">
            <div style="display: inline-block; width: 36px; height: 36px; border: 3px solid rgba(99, 102, 241, 0.2); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
            <p style="margin-top: 1rem; color: var(--text-secondary);">Loading your articles...</p>
        </div>
    `;

    try {
        const posts = await api.posts.getMyPosts();

        // Update Stats Counters
        const totalCount = posts ? posts.length : 0;
        const publishedCount = posts ? posts.filter(p => p.status === 'PUBLISHED').length : 0;
        const draftCount = posts ? posts.filter(p => p.status === 'DRAFT').length : 0;

        document.getElementById('stat-total').innerText = totalCount;
        document.getElementById('stat-published').innerText = publishedCount;
        document.getElementById('stat-drafts').innerText = draftCount;

        if (!posts || posts.length === 0) {
            listContainer.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        listContainer.innerHTML = posts.map(post => {
            const dateStr = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '';
            const isPublished = post.status === 'PUBLISHED';
            const statusClass = isPublished ? 'status-published' : 'status-draft';
            const statusText = isPublished ? '● Published' : '○ Draft';

            return `
                <div class="post-card" style="margin-bottom: 1.25rem; flex-direction: row; align-items: center; justify-content: space-between; padding: 1.25rem; gap: 1rem; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 250px;">
                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                            <span class="status-badge ${statusClass}">${statusText}</span>
                            <span style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(post.category || 'General')}</span>
                            <span style="font-size: 0.8rem; color: var(--text-muted);">• ${dateStr}</span>
                        </div>
                        <h3 style="font-size: 1.15rem; margin-bottom: 0.25rem; color: var(--text-primary);">${escapeHtml(post.title)}</h3>
                        <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(post.summary || '')}</p>
                    </div>

                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <button onclick="editPost(${post.id})" class="btn btn-secondary btn-sm" title="Edit Article">
                            ✏️ Edit
                        </button>
                        <button onclick="confirmDeletePost(${post.id}, '${escapeHtml(post.title)}')" class="btn btn-danger btn-sm" title="Delete Article">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        listContainer.innerHTML = `
            <div style="text-align: center; color: var(--danger); padding: 2rem;">
                <p>Failed to load dashboard posts: ${escapeHtml(err.message)}</p>
                <button onclick="loadDashboardPosts()" class="btn btn-secondary btn-sm" style="margin-top: 1rem;">Retry</button>
            </div>
        `;
    }
}

let editingPostId = null;

async function editPost(id) {
    try {
        const post = await api.posts.getById(id);
        editingPostId = post.id;

        document.getElementById('form-title').innerText = 'Edit Article';
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-category').value = post.category || 'General';
        document.getElementById('post-status').value = post.status || 'PUBLISHED';
        document.getElementById('post-image-url').value = post.coverImage || '';
        document.getElementById('post-content').value = post.content;

        showImagePreview(post.coverImage || '');

        const submitBtn = document.getElementById('save-post-btn');
        submitBtn.innerText = 'Update Article';
        document.getElementById('cancel-edit-btn').style.display = 'inline-flex';

        // Scroll to editor smoothly
        document.getElementById('post-editor-card').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        Toast.show('Failed to fetch post for editing', 'error');
    }
}

function resetPostForm() {
    editingPostId = null;
    document.getElementById('form-title').innerText = 'Create New Article';
    document.getElementById('post-form').reset();
    showImagePreview('');
    document.getElementById('save-post-btn').innerText = 'Publish Article';
    document.getElementById('cancel-edit-btn').style.display = 'none';
}

async function handlePostSubmit(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('save-post-btn');

    const title = document.getElementById('post-title').value.trim();
    const category = document.getElementById('post-category').value;
    const status = document.getElementById('post-status').value;
    const coverImage = document.getElementById('post-image-url').value.trim();
    const content = document.getElementById('post-content').value.trim();

    if (!title || !content) {
        Toast.show('Title and Content are required fields.', 'error');
        return;
    }

    const payload = {
        title,
        category,
        status,
        coverImage: coverImage || null,
        content
    };

    try {
        submitBtn.disabled = true;
        submitBtn.innerText = editingPostId ? 'Updating...' : 'Publishing...';

        if (editingPostId) {
            await api.posts.update(editingPostId, payload);
            Toast.show('Article updated successfully!', 'success');
        } else {
            await api.posts.create(payload);
            Toast.show('Article published successfully!', 'success');
        }

        resetPostForm();
        loadDashboardPosts();
    } catch (err) {
        Toast.show(err.message || 'Operation failed. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = editingPostId ? 'Update Article' : 'Publish Article';
    }
}

let pendingDeleteId = null;

function confirmDeletePost(id, title) {
    pendingDeleteId = id;
    const modal = document.getElementById('delete-modal');
    document.getElementById('delete-post-title').innerText = title;
    modal.classList.add('active');
}

window.closeDeleteModal = function () {
    pendingDeleteId = null;
    document.getElementById('delete-modal').classList.remove('active');
};

window.executeDeletePost = async function () {
    if (!pendingDeleteId) return;
    const confirmBtn = document.getElementById('confirm-delete-btn');

    try {
        confirmBtn.disabled = true;
        confirmBtn.innerText = 'Deleting...';

        await api.posts.delete(pendingDeleteId);
        Toast.show('Article deleted successfully!', 'success');

        closeDeleteModal();
        loadDashboardPosts();
    } catch (err) {
        Toast.show(err.message || 'Failed to delete article.', 'error');
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerText = 'Yes, Delete';
    }
};

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

window.editPost = editPost;
window.confirmDeletePost = confirmDeletePost;
