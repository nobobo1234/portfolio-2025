<script lang="ts">
	interface Props {
		onInsert: (url: string) => void;
		onClose: () => void;
	}

	const { onInsert, onClose }: Props = $props();

	let fileInput = $state<HTMLInputElement | null>(null);
	let previewUrl = $state<string | null>(null);
	let uploading = $state(false);
	let errorMsg = $state<string | null>(null);

	function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = file ? URL.createObjectURL(file) : null;
		errorMsg = null;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const file = fileInput?.files?.[0];
		if (!file) {
			errorMsg = 'Please select an image file.';
			return;
		}

		uploading = true;
		errorMsg = null;

		try {
			const form = new FormData();
			form.append('file', file);

			const res = await fetch('/admin/upload', { method: 'POST', body: form });
			const data = await res.json();

			if (!res.ok || !data.url) {
				errorMsg = data.error ?? 'Upload failed.';
				return;
			}

			onInsert(data.url);
		} catch {
			errorMsg = 'Network error. Please try again.';
		} finally {
			uploading = false;
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="modal-backdrop"
	role="dialog"
	aria-modal="true"
	aria-labelledby="img-modal-title"
	tabindex="-1"
	onclick={handleBackdropClick}
	onkeydown={handleKeydown}
>
	<div class="modal">
		<div class="modal-header">
			<h3 id="img-modal-title">Insert image</h3>
			<button type="button" class="close-btn" aria-label="Close" onclick={onClose}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
		</div>

		<form class="modal-body" onsubmit={handleSubmit}>
			<label class="file-label">
				<span>Image file <span class="hint">(.jpg, .png, .webp — max 5 MB)</span></span>
				<input
					bind:this={fileInput}
					type="file"
					accept=".jpg,.jpeg,.png,.webp"
					onchange={handleFileChange}
					disabled={uploading}
				/>
			</label>

			{#if previewUrl}
				<div class="preview-wrapper">
					<img src={previewUrl} alt="Preview" class="preview" />
				</div>
			{/if}

			{#if errorMsg}
				<p class="error">{errorMsg}</p>
			{/if}

			<div class="modal-actions">
				<button type="button" class="btn-cancel" onclick={onClose} disabled={uploading}>
					Cancel
				</button>
				<button type="submit" class="btn-insert" disabled={uploading || !previewUrl}>
					{#if uploading}Uploading…{:else}Insert{/if}
				</button>
			</div>
		</form>
	</div>
</div>

<style lang="scss">
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal {
		background: white;
		border-radius: 0.75rem;
		padding: 1.75rem 2rem;
		width: min(36rem, calc(100vw - 2rem));
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;

		h3 {
			font-size: 1.2rem;
			font-weight: 600;
			margin: 0;
		}
	}

	.close-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border: none;
		background: transparent;
		cursor: pointer;
		border-radius: 0.35rem;
		color: color-mix(in srgb, var(--color-text) 50%, white);
		transition: background 0.15s, color 0.15s;

		svg {
			width: 1.1rem;
			height: 1.1rem;
		}

		&:hover {
			background: color-mix(in srgb, var(--color-text) 8%, white);
			color: var(--color-text);
		}
	}

	.modal-body {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.file-label {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-size: 0.85rem;

		span {
			color: color-mix(in srgb, var(--color-text) 75%, white);
		}

		input[type='file'] {
			font-size: 0.9rem;
		}
	}

	.hint {
		font-size: 0.8rem;
		opacity: 0.6;
	}

	.preview-wrapper {
		border-radius: 0.5rem;
		overflow: hidden;
		border: 1px solid color-mix(in srgb, var(--color-text) 15%, white);
		max-height: 14rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--color-text) 4%, white);
	}

	.preview {
		max-width: 100%;
		max-height: 14rem;
		object-fit: contain;
		display: block;
	}

	.error {
		font-size: 0.9rem;
		color: #b42318;
		margin: 0;
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.6rem;
	}

	.btn-cancel {
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		border: 1px solid color-mix(in srgb, var(--color-text) 25%, white);
		background: white;
		border-radius: 0.4rem;
		cursor: pointer;
		transition: background 0.15s;

		&:hover:not(:disabled) {
			background: color-mix(in srgb, var(--color-text) 6%, white);
		}

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}
	}

	.btn-insert {
		padding: 0.5rem 1.1rem;
		font-size: 0.9rem;
		border: 1px solid var(--color-text);
		background: var(--color-text);
		color: var(--color-bg);
		border-radius: 0.4rem;
		cursor: pointer;
		transition: opacity 0.15s;

		&:hover:not(:disabled) {
			opacity: 0.85;
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}
</style>
