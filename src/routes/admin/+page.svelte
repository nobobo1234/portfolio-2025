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
	let editorReady = $state(false);

	const TIPEX_STYLE_OWNER_ATTR = 'data-admin-tipex-style-owner';
	const TIPEX_STYLE_LINK_ATTR = 'data-admin-tipex-style';

	$effect(() => {
		const existingLink = document.head.querySelector<HTMLLinkElement>(`link[${TIPEX_STYLE_LINK_ATTR}]`);
		if (existingLink) {
			existingLink.setAttribute(TIPEX_STYLE_OWNER_ATTR, String((Number(existingLink.getAttribute(TIPEX_STYLE_OWNER_ATTR) ?? '0') || 0) + 1));
			return () => {
				const currentOwners = Number(existingLink.getAttribute(TIPEX_STYLE_OWNER_ATTR) ?? '1') || 1;
				if (currentOwners <= 1) {
					existingLink.remove();
				} else {
					existingLink.setAttribute(TIPEX_STYLE_OWNER_ATTR, String(currentOwners - 1));
				}
			};
		}

		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = tipexStylesHref;
		link.setAttribute(TIPEX_STYLE_LINK_ATTR, 'true');
		link.setAttribute(TIPEX_STYLE_OWNER_ATTR, '1');
		document.head.append(link);

		return () => {
			const currentOwners = Number(link.getAttribute(TIPEX_STYLE_OWNER_ATTR) ?? '1') || 1;
			if (currentOwners <= 1) {
				link.remove();
			} else {
				link.setAttribute(TIPEX_STYLE_OWNER_ATTR, String(currentOwners - 1));
			}
		};
	});

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
</svelte:head>

<div class="admin-container">
	<SmallTitle>admin dashboard</SmallTitle>

	<section class="editor-card">
		<h2>Start quote</h2>
		<p class="editor-card__hint">
			Use italic in the editor for words that should render with the underline style on the homepage.
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

		<form method="POST" action="/admin" class="editor-form">
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
			<button type="submit" disabled={!editorReady}>Save quote</button>
		</form>

		{#if form?.error}
			<p class="status status--error">{form.error}</p>
		{/if}

		{#if data.justSaved}
			<p class="status status--success">Start quote saved.</p>
		{/if}
	</section>
</div>

<style>
	.admin-container {
		padding: 0 3rem 6rem 3rem;
		width: 100%;
		max-width: 120rem;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 2.5rem;

		@media (max-width: 768px) {
			padding: 4rem 2rem;
		}
	}

	.editor-card {
		background-color: white;
		border: 1px solid color-mix(in srgb, var(--color-text) 15%, white);
		border-radius: 0.75rem;
		padding: 1.5rem;
		max-width: 60rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
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
		align-items: flex-end;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.subtitle-input {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: min(36rem, 100%);
		font-size: 0.85rem;
	}

	.subtitle-input input {
		border: 1px solid color-mix(in srgb, var(--color-text) 20%, white);
		background-color: white;
		color: var(--color-text);
		padding: 0.5rem 0.65rem;
		font-size: 0.95rem;
		min-height: 2.2rem;
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
</style>
