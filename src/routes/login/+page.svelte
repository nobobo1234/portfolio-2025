<script lang="ts">
	export let form: { error?: string } | null | undefined;
</script>

<svelte:head>
	<title>Admin Login</title>
</svelte:head>

<main class="login">
	<h1>Admin Login</h1>

	<form method="POST" class="login__form" autocomplete="off">
		<label for="username">Username</label>
		<input
			id="username"
			name="username"
			type="text"
			autocomplete="username"
			required
			maxlength="255"
		/>

		<label for="password">Password</label>
		<input
			id="password"
			name="password"
			type="password"
			autocomplete="current-password"
			required
			minlength="8"
			maxlength="255"
		/>

		{#if form?.error}
			<p class="login__error" role="alert" aria-live="polite">{form.error}</p>
		{/if}

		<button type="submit">Sign in</button>
	</form>
</main>

<style>
	.login {
		max-width: 28rem;
		margin: 6rem auto;
		padding: 2rem;
	}

	.login__form {
		display: grid;
		gap: 0.75rem;
	}

	.login__form input {
		padding: 0.6rem 0.7rem;
		border: 1px solid #b9b9b9;
		border-radius: 6px;
	}

	.login__form button {
		margin-top: 0.5rem;
		padding: 0.7rem 1rem;
		border: none;
		border-radius: 6px;
		background: #1f2937;
		color: #ffffff;
		cursor: pointer;
	}

	.login__error {
		color: #b91c1c;
		margin: 0.25rem 0 0;
	}
</style>
