<script lang="ts">
	import SmallTitle from '$components/SmallTitle.svelte';
	import { Tipex, type TipexEditor } from '@friendofsvelte/tipex';
	import type { EditorEvents } from '@tiptap/core';
	import tipexStylesHref from '@friendofsvelte/tipex/styles/index.css?url';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let editor: TipexEditor = $state();
	let startQuoteDocJson = $state(data.startQuoteDocJson);
	let heroSubtitle = $state(data.heroSubtitle);
	let aboutSection = $state(data.aboutSection);
	let editorReady = $state(false);
	let confirmDeleteSlug = $state<string | null>(null);
	let confirmDeleteTitle = $state<string>('');
	let confirmDeleteBlogSlug = $state<string | null>(null);
	let confirmDeleteBlogTitle = $state<string>('');

	function handleEditorCreate(event: EditorEvents['create']) {
		const tiptapEditor = event.editor;
		tiptapEditor.commands.setContent(data.startQuoteDoc, false);
		startQuoteDocJson = JSON.stringify(tiptapEditor.getJSON());
		editorReady = true;
	}

	function handleEditorUpdate(event: EditorEvents['update']) {
		startQuoteDocJson = JSON.stringify(event.editor.getJSON());
	}
</script>

<svelte:head>
	<title>Admin - Noah's Portfolio</title>
	<meta name="description" content="Admin dashboard for managing portfolio content." />
	<link rel="stylesheet" href={tipexStylesHref} />
</svelte:head>

<div class="admin-container">
	<SmallTitle>admin dashboard</SmallTitle>
    <div class="editor-cards">
        <section class="editor-card hero">
            <h2>Start quote</h2>
            <p class="editor-card__hint">
                Use italic in the editor for words that should render with the underline style on the
                homepage.
            </p>

            <Tipex
                bind:tipex={editor}
                oncreate={handleEditorCreate}
                onupdate={handleEditorUpdate}
                class="admin-tipex"
            >
                {#snippet controlComponent(tipex)}
                    <div class="tipex-controller">
                        <div class="tipex-basic-controller-wrapper">
                            <button
                                type="button"
                                class="tipex-edit-button tipex-button-extra tipex-button-rigid"
                                class:active={tipex?.isActive('italic')}
                                onclick={() => tipex?.chain().focus().toggleMark('italic').run()}
                                aria-label="Italic"
                                title="Italic (⌘+I)"
                            >
                                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                                    <path
                                        d="M7.991 11.674 9.53 4.455c.123-.595.246-.71 1.347-.807l.11-.52H7.211l-.11.52c1.06.096 1.128.212 1.005.807L6.57 11.674c-.123.595-.246.71-1.346.806l-.11.52h3.774l.11-.52c-1.06-.095-1.129-.211-1.006-.806z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                {/snippet}
            </Tipex>

            <form method="POST" action="?/saveStartQuote" class="editor-form">
                <input type="hidden" name="startQuoteDoc" value={startQuoteDocJson} />
                <label class="subtitle-input">
                    <span>Hero subtitle</span>
                    <input
                        type="text"
                        name="heroSubtitle"
                        bind:value={heroSubtitle}
                        maxlength={data.heroSubtitleMaxLength}
                        required
                    />
                </label>
                <button type="submit" disabled={!editorReady}>Save</button>
            </form>

            {#if form?.startQuoteError}
                <p class="status status--error">{form.startQuoteError}</p>
            {/if}

            {#if data.justSavedStartQuote}
                <p class="status status--success">Start quote saved.</p>
            {/if}
        </section>

        <section class="editor-card about">
            <h2>About</h2>

            <form method="POST" action="?/saveAbout" class="editor-form">
                <label class="subtitle-input subtitle-input--full">
                    <span>About section</span>
                    <div class="about-textarea-shell">
                        <textarea
                            class="about-textarea"
                            name="aboutSection"
                            bind:value={aboutSection}
                            maxlength={data.aboutSectionMaxLength}
                            required
                            placeholder="Write your about section..."
                        ></textarea>
                    </div>
                </label>
                <button type="submit">Save</button>
            </form>

            {#if form?.aboutError}
                <p class="status status--error">{form.aboutError}</p>
            {/if}

            {#if data.justSavedAbout}
                <p class="status status--success">About section saved.</p>
            {/if}
        </section>

        <section class="editor-card card-list projects">
            <h2>Projects</h2>
            <a href="/admin/projects/new" class="new-btn">+ New</a>
            <div class="project-list">
                {#each data.projects as project (project.slug)}
                    <div class="project-row">
                        <a href="/admin/projects/{project.slug}" class="project-row__title">
                            {project.title}
                        </a>
                        <form method="POST" action="?/toggleVisibility" class="project-row__visibility">
                            <input type="hidden" name="slug" value={project.slug} />
                            <button
                                type="submit"
                                class="visibility-btn"
                                class:visible={project.visible}
                                title={project.visible ? 'Visible on homepage — click to hide' : 'Hidden from homepage — click to show'}
                                aria-label={project.visible ? 'Hide from homepage' : 'Show on homepage'}
                            >
                                {#if project.visible}
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                {:else}
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                    </svg>
                                {/if}
                            </button>
                        </form>
                        <button
                            type="button"
                            class="delete-btn"
                            aria-label="Delete {project.title}"
                            title="Delete project"
                            onclick={() => { confirmDeleteSlug = project.slug; confirmDeleteTitle = project.title; }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                        </button>
                    </div>
                {:else}
                    <i>No projects yet. Create one with the button above.</i>
                {/each}
            </div>
        </section>
        
        <section class="editor-card card-list blog">
            <h2>Blog posts</h2>
            <a href="/admin/blog/new" class="new-btn">+ New</a>
            <div class="blog-list">
                {#each data.blogs as post (post.slug)}
                    <div class="project-row">
                        <a href="/admin/blog/{post.slug}" class="project-row__title">
                            {post.title}
                        </a>
                        <button
                            type="button"
                            class="delete-btn"
                            aria-label="Delete {post.title}"
                            title="Delete post"
                            onclick={() => { confirmDeleteBlogSlug = post.slug; confirmDeleteBlogTitle = post.title; }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                        </button>
                    </div>
                {:else}
                    <i>No posts yet. Create one with the button above.</i>
                {/each}
            </div>
        </section>
</div>
</div>

{#if confirmDeleteBlogSlug}
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
        class="modal-backdrop"
        role="dialog"
        tabindex="-1"
        aria-modal="true"
        aria-labelledby="modal-blog-title"
        onkeydown={(e) => { if (e.key === 'Escape') confirmDeleteBlogSlug = null; }}
    >
        <div class="modal">
            <h3 id="modal-blog-title">Delete blog post?</h3>
            <p>
                Are you sure you want to permanently delete
                <strong>{confirmDeleteBlogTitle}</strong>? This cannot be undone.
            </p>
            <div class="modal-actions">
                <button type="button" class="btn-cancel" onclick={() => confirmDeleteBlogSlug = null}>
                    Cancel
                </button>
                <form method="POST" action="?/deleteBlog">
                    <input type="hidden" name="slug" value={confirmDeleteBlogSlug} />
                    <button type="submit" class="btn-delete">Delete</button>
                </form>
            </div>
        </div>
    </div>
{/if}

{#if confirmDeleteSlug}
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
        class="modal-backdrop"
        role="dialog"
        tabindex="-1"
        aria-modal="true"
        aria-labelledby="modal-title"
        onkeydown={(e) => { if (e.key === 'Escape') confirmDeleteSlug = null; }}
    >
        <div class="modal">
            <h3 id="modal-title">Delete project?</h3>
            <p>
                Are you sure you want to permanently delete
                <strong>{confirmDeleteTitle}</strong>? This cannot be undone.
            </p>
            <div class="modal-actions">
                <button type="button" class="btn-cancel" onclick={() => confirmDeleteSlug = null}>
                    Cancel
                </button>
                <form method="POST" action="?/deleteProject">
                    <input type="hidden" name="slug" value={confirmDeleteSlug} />
                    <button type="submit" class="btn-delete">Delete</button>
                </form>
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
	.admin-container {
		padding: 6rem 3rem 6rem 3rem;
		width: 100%;
		max-width: 120rem;
		margin: 0 auto;
        display: flex;
		flex-direction: column;

		@media (max-width: 768px) {
			padding: 4rem 2rem;
		}
	}

    .editor-cards {
		display: grid;
        gap: 1rem;
        grid-template-columns: 2fr 1fr;
        grid-template-rows: min-content min-content;
    }

	.editor-card {
		background-color: white;
		border: 1px solid color-mix(in srgb, var(--color-text) 15%, white);
		border-radius: 0.75rem;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;

        &.card-list {
            display: grid;
            grid-template-columns: auto min-content;
            grid-template-rows: min-content auto;

            & > div {
                grid-column: 1 / -1;
            }
        }

        &.hero {
            grid-column: 1 / 2;
        }

        &.about {
            grid-column: 1 / 2;
        }

        &.projects {
            grid-row: 1 / 2;
            grid-column: 2 / -1;
        }

        &.blog {
            grid-row: 2 / 3;
            grid-column: 2 / -1;
        }
	}

	.editor-card h2 {
		font-size: 1.4rem;
		font-weight: 500;
	}

	.editor-card__hint {
		font-size: 0.95rem;
		color: color-mix(in srgb, var(--color-text) 75%, white);
	}

	.editor-form {
		display: flex;
		align-items: flex-start;
		flex-direction: column;
		gap: 0.75rem;
	}

	.subtitle-input {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: min(36rem, 100%);
		font-size: 0.85rem;
	}

	.subtitle-input--full {
		width: min(52rem, 100%);
	}

	.subtitle-input input {
		border: 1px solid color-mix(in srgb, var(--color-text) 20%, white);
		background-color: white;
		color: var(--color-text);
		padding: 0.5rem 0.65rem;
		font-size: var(--text-tipex-base);
		min-height: 2.2rem;
	}

	.about-textarea-shell {
		width: 100%;
		background: var(--color-tipex-100);
		border: 1px solid color-mix(in srgb, var(--color-text) 20%, white);
		border-radius: 0.5rem;
		overflow: hidden;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	.about-textarea-shell:focus-within {
		border-color: color-mix(in srgb, var(--color-text) 50%, white);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-text) 10%, transparent);
	}

	.about-textarea {
		display: block;
		width: 100%;
		min-height: 12rem;
		padding: 1rem 0.5rem;
		border: none;
		outline: none;
		resize: none;
		color: var(--color-text);
		font-size: var(--text-tipex-base);
		font-family: var(--font-serif);
	}

	.about-textarea::placeholder {
		color: color-mix(in srgb, var(--color-text) 50%, white);
	}

	.editor-form button {
		border: 1px solid var(--color-text);
		background: var(--color-text);
		color: var(--color-bg);
		padding: 0.55rem 0.9rem;
		cursor: pointer;
		font-size: 0.95rem;
	}

	.editor-form button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.status {
		font-size: 0.95rem;
	}

	.status--error {
		color: #b42318;
	}

	.status--success {
		color: #067647;
	}

	:global(.admin-tipex .h-4) {
		height: 1rem;
	}

	:global(.admin-tipex .w-4) {
		width: 1rem;
	}

	/* ---- project list ---- */
	.new-btn {
		display: inline-flex;
		align-items: center;
		font-size: 0.9rem;
		padding: 0.35rem 0.8rem;
		border: 1px solid var(--color-text);
		background: var(--color-text);
		color: var(--color-bg);
		text-decoration: none;
		border-radius: 0.4rem;
		white-space: nowrap;
		transition: opacity 0.15s;
		&:hover { opacity: 0.75; }
	}

	.project-list,
	.blog-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;

		i {
			font-size: 0.9rem;
			color: color-mix(in srgb, var(--color-text) 50%, white);
		}
	}

	.project-row {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.6rem;
		border-radius: 0.4rem;
		background: color-mix(in srgb, var(--color-text) 4%, white);
		border: 1px solid color-mix(in srgb, var(--color-text) 10%, white);

		&:hover { border-color: color-mix(in srgb, var(--color-text) 20%, white); }
	}

	.project-row__title {
		font-size: 0.95rem;
		font-weight: 500;
		text-decoration: none;
		color: var(--color-text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;

		&:hover { text-decoration: underline; }
	}

	.visibility-btn,
	.delete-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border: none;
		background: transparent;
		cursor: pointer;
		border-radius: 0.35rem;
		color: color-mix(in srgb, var(--color-text) 45%, white);
		transition: background 0.15s, color 0.15s;
		flex-shrink: 0;

		svg { width: 1.1rem; height: 1.1rem; }

		&:hover {
			background: color-mix(in srgb, var(--color-text) 10%, white);
			color: var(--color-text);
		}
	}

	.visibility-btn.visible {
		color: #067647;
	}

	.delete-btn:hover {
		background: #fef3f2;
		color: #b42318;
	}

	/* ---- delete modal ---- */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.45);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal {
		background: white;
		border-radius: 0.75rem;
		padding: 2rem 2.5rem;
		max-width: 38rem;
		width: calc(100% - 3rem);
		box-shadow: 0 20px 60px rgba(0,0,0,0.2);

		h3 {
			font-size: 1.3rem;
			font-weight: 600;
			margin-bottom: 0.75rem;
		}

		p {
			font-size: 0.95rem;
			color: color-mix(in srgb, var(--color-text) 75%, white);
			line-height: 1.5;
			margin-bottom: 1.5rem;
		}
	}

	.modal-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
	}

	.btn-cancel {
		padding: 0.55rem 1.1rem;
		font-size: 0.95rem;
		border: 1px solid color-mix(in srgb, var(--color-text) 25%, white);
		background: white;
		border-radius: 0.4rem;
		cursor: pointer;
		transition: background 0.15s;
		&:hover { background: color-mix(in srgb, var(--color-text) 6%, white); }
	}

	.btn-delete {
		padding: 0.55rem 1.1rem;
		font-size: 0.95rem;
		border: 1px solid #b42318;
		background: #b42318;
		color: white;
		border-radius: 0.4rem;
		cursor: pointer;
		transition: background 0.15s;
		&:hover { background: #962012; border-color: #962012; }
	}
</style>
