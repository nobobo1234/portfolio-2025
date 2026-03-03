<script lang="ts">
	import SmallTitle from '$components/SmallTitle.svelte';
	import ImageUploadModal from '$components/ImageUploadModal.svelte';
	import { Tipex, type TipexEditor } from '@friendofsvelte/tipex';
	import type { EditorEvents } from '@tiptap/core';
	import { Image } from '@tiptap/extension-image';
	import '@tiptap/extension-bullet-list';
	import '@tiptap/extension-ordered-list';
	import tipexStylesHref from '@friendofsvelte/tipex/styles/index.css?url';
	import { beforeNavigate } from '$app/navigation';

	interface FormResult {
		error?: string;
		values?: Record<string, string>;
	}

	let { form }: { form?: FormResult | null } = $props();

	let editor: TipexEditor = $state();
	let contentJson = $state('');
	let editorReady = $state(false);
	let isDirty = $state(false);
	const imageExtension = Image.configure({ inline: true, allowBase64: false });

	let showImageModal = $state(false);

	function handleEditorCreate(event: EditorEvents['create']) {
		contentJson = JSON.stringify(event.editor.getJSON());
		editorReady = true;
	}

	function handleEditorUpdate(event: EditorEvents['update']) {
		contentJson = JSON.stringify(event.editor.getJSON());
		isDirty = true;
	}

	function handleImageInsert(url: string) {
		showImageModal = false;
		editor?.chain().focus().setImage({ src: url }).run();
		isDirty = true;
	}

	const v = $derived(form?.values as Record<string, string> | undefined);

	beforeNavigate(({ cancel }) => {
		if (isDirty && !confirm('You have unsaved changes. Leave the page?')) {
			cancel();
		}
	});

	$effect(() => {
		function handleBeforeUnload(e: BeforeUnloadEvent) {
			if (isDirty) e.preventDefault();
		}
		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	});
</script>

<svelte:head>
	<title>New Blog Post – Admin</title>
	<link rel="stylesheet" href={tipexStylesHref} />
</svelte:head>

<div class="new-post">
	<SmallTitle>new blog post</SmallTitle>

	<form
		method="POST"
		action="?/create"
		class="post-form"
		oninput={() => { isDirty = true; }}
		onsubmit={() => { isDirty = false; }}
	>
		<!-- Basic info -->
		<section class="form-section">
			<h2>Basic info</h2>
			<div class="field-row">
				<label class="field">
					<span>Title</span>
					<input type="text" name="title" value={v?.title ?? ''} required maxlength={200} />
				</label>
				<label class="field">
					<span>Published date</span>
					<input
						type="date"
						name="publishedAt"
						value={v?.publishedAt ?? new Date().toISOString().slice(0, 10)}
						required
					/>
				</label>
			</div>
		</section>

		<!-- Content -->
		<section class="form-section">
			<h2>Content</h2>
			<Tipex
				bind:tipex={editor}
				oncreate={handleEditorCreate}
				onupdate={handleEditorUpdate}
				extensions={[imageExtension]}
				class="blog-tipex"
			>
				{#snippet controlComponent(tipex)}
					<div class="tipex-controller">
						<div class="tipex-basic-controller-wrapper">
							<button
								type="button"
								class="tipex-edit-button tipex-button-extra tipex-button-rigid"
								class:active={tipex?.isActive('bold')}
								onclick={() => tipex?.chain().focus().toggleMark('bold').run()}
								aria-label="Bold"
								title="Bold (⌘+B)"
							>
								<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
									<path d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13zM5.908 4.674h1.696c.963 0 1.517.451 1.517 1.244 0 .834-.629 1.32-1.73 1.32H5.908V4.674zm0 6.788V8.598h1.73c1.217 0 1.88.492 1.88 1.415 0 .943-.643 1.449-1.832 1.449H5.907z"/>
								</svg>
							</button>
							<button
								type="button"
								class="tipex-edit-button tipex-button-extra tipex-button-rigid"
								class:active={tipex?.isActive('italic')}
								onclick={() => tipex?.chain().focus().toggleMark('italic').run()}
								aria-label="Italic"
								title="Italic (⌘+I)"
							>
								<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
									<path d="M7.991 11.674 9.53 4.455c.123-.595.246-.71 1.347-.807l.11-.52H7.211l-.11.52c1.06.096 1.128.212 1.005.807L6.57 11.674c-.123.595-.246.71-1.346.806l-.11.52h3.774l.11-.52c-1.06-.095-1.129-.211-1.006-.806z"/>
								</svg>
							</button>
							<button
								type="button"
								class="tipex-edit-button tipex-button-extra tipex-button-rigid"
								class:active={tipex?.isActive('heading', { level: 2 })}
								onclick={() => tipex?.chain().focus().setNode('heading', { level: 2 }).run()}
								aria-label="Heading 2"
								title="Heading 2"
							>
								<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
									<path d="M7.638 13V3.669H6.38V7.62H1.759V3.67H.5V13h1.258V8.728h4.62V13zm3.022.6.818-1.103c.63.633 1.378 1.047 2.189 1.047 1.01 0 1.614-.54 1.614-1.366 0-.801-.54-1.23-1.484-1.23h-.773V9.99h.773c.783 0 1.27-.388 1.27-1.105 0-.735-.532-1.15-1.367-1.15-.71 0-1.347.36-1.925.955L11.01 7.64c.73-.783 1.59-1.22 2.585-1.22 1.593 0 2.648.82 2.648 2.145 0 .867-.497 1.52-1.338 1.794v.055c.924.217 1.52.942 1.52 1.97 0 1.49-1.162 2.37-2.834 2.37-1.175 0-2.114-.486-2.931-1.155z"/>
								</svg>
							</button>
							<button
								type="button"
								class="tipex-edit-button tipex-button-extra tipex-button-rigid"
								class:active={tipex?.isActive('heading', { level: 3 })}
								onclick={() => tipex?.chain().focus().setNode('heading', { level: 3 }).run()}
								aria-label="Heading 3"
								title="Heading 3"
							>
								<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
									<path d="M7.638 13V3.669H6.38V7.62H1.759V3.67H.5V13h1.258V8.728h4.62V13h1.259V3.67h-1.26V7.62H7.638V3.67H6.38V13zm3.022.6.818-1.103c.63.633 1.378 1.047 2.189 1.047 1.01 0 1.614-.54 1.614-1.366 0-.801-.54-1.23-1.484-1.23h-.773V9.99h.773c.783 0 1.27-.388 1.27-1.105 0-.735-.532-1.15-1.367-1.15-.71 0-1.347.36-1.925.955L11.01 7.64c.73-.783 1.59-1.22 2.585-1.22 1.593 0 2.648.82 2.648 2.145 0 .867-.497 1.52-1.338 1.794v.055c.924.217 1.52.942 1.52 1.97 0 1.49-1.162 2.37-2.834 2.37a3.716 3.716 0 0 1-2.647-1.058L12.13 14c.631.61 1.458 1.02 2.394 1.02 1.593 0 2.648-.84 2.648-2.345 0-1.146-.748-1.94-1.838-2.107v-.056c.972-.234 1.567-.987 1.567-1.999 0-1.39-1.068-2.237-2.648-2.237-1.175 0-2.025.425-2.741 1.1L12.33 8.48c.595-.606 1.21-.956 1.911-.956.9 0 1.44.502 1.44 1.296 0 .856-.576 1.37-1.584 1.37h-.666v.923h.666c1.13 0 1.736.538 1.736 1.476 0 .925-.594 1.477-1.584 1.477-.81 0-1.464-.39-2.09-1.066z"/>
								</svg>
							</button>
							<!-- Bullet list -->
							<button
								type="button"
								class="tipex-edit-button tipex-button-extra tipex-button-rigid"
								class:active={tipex?.isActive('bulletList')}
								onclick={() => tipex?.chain().focus().toggleBulletList().run()}
								aria-label="Bullet list"
								title="Bullet list"
							>
								<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
									<path fill-rule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
								</svg>
							</button>
							<!-- Ordered list -->
							<button
								type="button"
								class="tipex-edit-button tipex-button-extra tipex-button-rigid"
								class:active={tipex?.isActive('orderedList')}
								onclick={() => tipex?.chain().focus().toggleOrderedList().run()}
								aria-label="Ordered list"
								title="Ordered list"
							>
								<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
									<path fill-rule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5z"/>
									<path d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 0 0-.342.338v.041zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635V5z"/>
								</svg>
							</button>
							<!-- Insert image -->
							<button
								type="button"
								class="tipex-edit-button tipex-button-extra tipex-button-rigid"
							onclick={() => { showImageModal = true; }}
							aria-label="Insert image"
							title="Insert image"
							>
								<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
									<path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
									<path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
								</svg>
							</button>
						</div>
					</div>
				{/snippet}
			</Tipex>
			<input type="hidden" name="content" value={contentJson} />
		</section>

		{#if form?.error}
			<p class="status status--error">{form.error}</p>
		{/if}

		<div class="form-actions">
			<a href="/admin" class="cancel-link">Cancel</a>
			<button type="submit" disabled={!editorReady}>Create post</button>
		</div>
	</form>
</div>

{#if showImageModal}
	<ImageUploadModal onInsert={handleImageInsert} onClose={() => { showImageModal = false; }} />
{/if}

<style lang="scss">
	.new-post {
		padding: 6rem 3rem;
		width: 100%;
		max-width: 90rem;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		@media (max-width: 768px) {
			padding: 4rem 2rem;
		}
	}

	.post-form {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		margin-top: 2rem;
	}

	.form-section {
		background-color: white;
		border: 1px solid color-mix(in srgb, var(--color-text) 15%, white);
		border-radius: 0.75rem;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;

		h2 {
			font-size: 1.4rem;
			font-weight: 500;
			margin: 0;
		}
	}

	.field-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;

		@media (max-width: 640px) {
			grid-template-columns: 1fr;
		}
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.85rem;

		span {
			color: color-mix(in srgb, var(--color-text) 75%, white);
		}

		input {
			border: 1px solid color-mix(in srgb, var(--color-text) 20%, white);
			background-color: white;
			color: var(--color-text);
			padding: 0.5rem 0.65rem;
			font-size: var(--text-tipex-base, 1rem);
			min-height: 2.2rem;
			transition: border-color 0.2s ease, box-shadow 0.2s ease;

			&:focus {
				outline: none;
				border-color: color-mix(in srgb, var(--color-text) 50%, white);
				box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-text) 10%, transparent);
			}
		}
	}

	.form-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.cancel-link {
		font-size: 0.95rem;
		color: color-mix(in srgb, var(--color-text) 65%, white);
		text-decoration: none;
		&:hover { text-decoration: underline; }
	}

	button[type='submit'] {
		border: 1px solid var(--color-text);
		background: var(--color-text);
		color: var(--color-bg);
		padding: 0.55rem 1.1rem;
		font-size: 0.95rem;
		cursor: pointer;

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}
	}

	.status {
		font-size: 0.95rem;
	}

	.status--error {
		color: #b42318;
	}

	:global(.blog-tipex .h-4) { height: 1rem; }
	:global(.blog-tipex .w-4) { width: 1rem; }
	:global(.blog-tipex img) { max-width: 100%; border-radius: 0.375rem; }

        :global(.blog-tipex .ProseMirror ul) {
                list-style: disc;
                padding-left: 1.5rem;
                margin-left: 0.5rem;
                margin-bottom: 0.75rem;
        }
        :global(.blog-tipex .ProseMirror ol) {
                list-style: decimal;
                padding-left: 1.5rem;
                margin-left: 0.5rem;
                margin-bottom: 0.75rem;
        }
        :global(.blog-tipex .ProseMirror li) {
                margin-bottom: 0.2rem;
        }
        :global(.blog-tipex .ProseMirror li > p) {
                margin-bottom: 0;
        }
</style>
