<script lang="ts">
	import SmallTitle from '$components/SmallTitle.svelte';
	import { Tipex, type TipexEditor } from '@friendofsvelte/tipex';
	import type { EditorEvents } from '@tiptap/core';
	import tipexStylesHref from '@friendofsvelte/tipex/styles/index.css?url';
	import { beforeNavigate } from '$app/navigation';
	import type { PageProps } from './$types';

	interface FormResult {
		error?: string;
		values?: Record<string, string>;
	}

	let { data, form }: PageProps & { form?: FormResult | null } = $props();

	const project = data.project;

	let editor: TipexEditor = $state();
	let contentJson = $state(project.content);
	let editorReady = $state(false);
	let isDirty = $state(false);

	let bannerPreviewUrl = $state<string | null>(null);

	function handleBannerChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
		bannerPreviewUrl = file ? URL.createObjectURL(file) : null;
		isDirty = true;
	}

	function handleEditorCreate(event: EditorEvents['create']) {
		// Load existing content without triggering dirty
		let parsed: unknown;
		try { parsed = JSON.parse(project.content); } catch { parsed = null; }
		if (parsed) event.editor.commands.setContent(parsed, false);
		contentJson = JSON.stringify(event.editor.getJSON());
		editorReady = true;
	}

	function handleEditorUpdate(event: EditorEvents['update']) {
		contentJson = JSON.stringify(event.editor.getJSON());
		isDirty = true;
	}

	// Use server-returned values on validation error, otherwise fall back to project data
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
	<title>Edit {project.title} – Admin</title>
	<link rel="stylesheet" href={tipexStylesHref} />
</svelte:head>

<div class="edit-project">
	<SmallTitle>edit project</SmallTitle>

	<form
		method="POST"
		action="?/update"
		class="project-form"
		enctype="multipart/form-data"
		oninput={() => { isDirty = true; }}
		onsubmit={() => { isDirty = false; }}
	>
		<!-- Basic info -->
		<section class="form-section">
			<h2>Basic info</h2>
			<div class="field-row">
				<label class="field">
					<span>Title</span>
					<input type="text" name="title" value={v?.title ?? project.title} required maxlength={200} />
				</label>
				<label class="field">
					<span>Subtitle</span>
					<input type="text" name="subtitle" value={v?.subtitle ?? project.subtitle} required maxlength={400} />
				</label>
			</div>
		</section>

		<!-- Project details -->
		<section class="form-section">
			<h2>Project details</h2>
			<div class="field-row">
				<label class="field">
					<span>Client</span>
					<input type="text" name="client" value={v?.client ?? project.client} required maxlength={200} />
				</label>
				<label class="field">
					<span>Year</span>
					<input type="text" name="year" value={v?.year ?? project.year} required maxlength={20} placeholder="2025" />
				</label>
			</div>
			<div class="field-row">
				<label class="field">
					<span>Services</span>
					<input type="text" name="services" value={v?.services ?? project.services} required maxlength={400} placeholder="Design, Development" />
				</label>
				<label class="field">
					<span>Technology</span>
					<input type="text" name="technology" value={v?.technology ?? project.technology} required maxlength={400} placeholder="SvelteKit, Prisma" />
				</label>
			</div>
		</section>

		<!-- Links & media -->
		<section class="form-section">
			<h2>Links &amp; media</h2>
			<div class="field-row">
				<label class="field">
					<span>Demo URL</span>
					<input type="text" name="demoUrl" value={v?.demoUrl ?? project.demoUrl} required maxlength={500} placeholder="https://example.com" />
				</label>
				<label class="field">
					<span>GitHub URL <span class="optional">(optional)</span></span>
					<input type="text" name="githubUrl" value={v?.githubUrl ?? project.githubUrl ?? ''} maxlength={500} placeholder="https://github.com/..." />
				</label>
			</div>

			<div class="banner-section">
				<p class="field-label">Banner image <span class="optional">(leave empty to keep current)</span></p>
				<div class="current-banner">
					<img src={bannerPreviewUrl ?? project.bannerImgUrl} alt="Current banner" class="banner-preview" />
				</div>
				<label class="field">
					<span>Replace image <span class="optional">(.jpg, .png, .webp — max 5 MB)</span></span>
					<input
						type="file"
						name="bannerImg"
						accept=".jpg,.jpeg,.png,.webp"
						onchange={handleBannerChange}
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
				class="project-tipex"
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
			<button type="submit" disabled={!editorReady}>Save changes</button>
		</div>
	</form>
</div>

<style lang="scss">
	.edit-project {
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

	.project-form {
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

	.field-label {
		font-size: 0.85rem;
		color: color-mix(in srgb, var(--color-text) 75%, white);
		margin: 0;
	}

	.optional {
		font-size: 0.8rem;
		opacity: 0.6;
	}

	.banner-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.banner-preview {
		width: 100%;
		max-height: 240px;
		object-fit: cover;
		border-radius: 0.375rem;
		border: 1px solid color-mix(in srgb, var(--color-text) 20%, white);
	}

	.form-actions {
		display: flex;
		align-items: center;
		gap: 1.25rem;

		button {
			border: 1px solid var(--color-text);
			background: var(--color-text);
			color: var(--color-bg);
			padding: 0.55rem 1.1rem;
			cursor: pointer;
			font-size: 0.95rem;

			&:disabled {
				opacity: 0.6;
				cursor: not-allowed;
			}
		}
	}

	.cancel-link {
		font-size: 0.95rem;
		color: color-mix(in srgb, var(--color-text) 60%, white);
		text-decoration: none;

		&:hover {
			color: var(--color-text);
		}
	}

	.status {
		font-size: 0.95rem;
	}

	.status--error {
		color: #b42318;
	}

	:global(.project-tipex .h-4) {
		height: 1rem;
	}

	:global(.project-tipex .w-4) {
		width: 1rem;
	}
</style>
