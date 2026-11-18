<script lang="ts">
  import { contactSchema } from './contactSchema';

  type Field = 'name' | 'email' | 'subject' | 'message';
  type FieldError = { field: Field | null; message: string };
  type Status = 'idle' | 'sending' | 'success';
  
  const fields: Field[] = ['name', 'email', 'subject', 'message'];
  const emptyForm = { name: '', email: '', subject: '', message: '', website: '' };

  let touched = $state<Partial<Record<Field, boolean>>>({});
  let form = $state({ ...emptyForm });
  let status = $state<Status>('idle');
  let errors = $state<FieldError[]>([]);
  let successMessage = $state('');

  const globalErrors = $derived(errors.filter(e => e.field === null));
  const fieldError = (field: Field) => errors.find(e => e.field === field)?.message;

  function validateField(field: Field): boolean {
    const result = contactSchema.shape[field].safeParse(form[field]);
    errors = errors.filter(e => e.field !== field);
    if (!result.success) {
      errors = [...errors, { field, message: result.error.issues[0].message }];
    }
    return result.success;
  }
  
  function onBlur(field: Field) {
    touched[field] = true;
    validateField(field);
  }

  function onInput(field: Field) {
    if (touched[field]) validateField(field);
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    errors = errors.filter(e => e.field !== null);
    fields.forEach(f => (touched[f] = true));
    const allValid = fields.map(validateField).every(Boolean);
    if (!allValid) {
      status = 'idle';
      const firstInvalid = fields.find(f => fieldError(f));
      if (firstInvalid) document.getElementById(firstInvalid)?.focus();
      return; 
    }
    status = 'sending';
    errors = [];

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        errors = body?.errors ?? [{ field: null, message: 'Une erreur inattendue est survenue.' }];
        status = 'idle';
        return;
      }

      successMessage = body?.message ?? 'Message envoyé.';
      status = 'success';
      form = { ...emptyForm };
      touched = {};
    } catch {
      errors = [{ field: null, message: 'Impossible de joindre le serveur. Vérifiez votre connexion.' }];
      status = 'idle';
    }
  }
</script>

<h1>Contact</h1>
<form onsubmit={handleSubmit} novalidate>
  <div class="field">
    <label for="name">Nom</label>
    <input id="name" bind:value={form.name} required maxlength="100" autocomplete="name"  placeholder="Vos prénoms et noms"
      onblur={() => onBlur('name')} oninput={() => onInput('name')}
      aria-invalid={!!fieldError('name')} aria-describedby={fieldError('name') ? 'name-error' : undefined} />
    {#if fieldError('name')}<p id="name-error" class="error">{fieldError('name')}</p>{/if}
  </div>

  <div class="field">
    <label for="email">E-mail</label>
    <input id="email" type="email" bind:value={form.email} required maxlength="254"  placeholder="Votre adresse e-mail" autocomplete="email"
      onblur={() => onBlur('email')} oninput={() => onInput('email')}
      aria-invalid={!!fieldError('email')} aria-describedby={fieldError('email') ? 'email-error' : undefined} />
    {#if fieldError('email')}<p id="email-error" class="error">{fieldError('email')}</p>{/if}
  </div>

  <div class="field">
    <label for="subject">Sujet</label>
    <input id="subject" bind:value={form.subject} required maxlength="150" placeholder="L'objet de votre demande"    
      onblur={() => onBlur('subject')} oninput={() => onInput('subject')}
      aria-invalid={!!fieldError('subject')} aria-describedby={fieldError('subject') ? 'subject-error' : undefined} />
    {#if fieldError('subject')}<p id="subject-error" class="error">{fieldError('subject')}</p>{/if}
  </div>

  <div class="field">
    <label for="message">Message</label>
    <textarea id="message" bind:value={form.message} required maxlength="5000" rows="6" placeholder="Votre message"        
      onblur={() => onBlur('message')} oninput={() => onInput('message')}
      aria-invalid={!!fieldError('message')} aria-describedby={fieldError('message') ? 'message-error' : undefined}></textarea>
    {#if fieldError('message')}<p id="message-error" class="error">{fieldError('message')}</p>{/if}
  </div>

  <div class="miel" aria-hidden="true">
    <label for="website">URL du site</label>
    <input id="website" bind:value={form.website} tabindex="-1" autocomplete="off" />
  </div>

  <button type="submit" disabled={status === 'sending'}>
    {status === 'sending' ? 'Envoi…' : 'Envoyer'}
  </button>

  <div role="status" aria-live="polite">
    {#if status === 'success'}<p class="success">{successMessage}</p>{/if}
    {#each globalErrors as e (e.message)}<p class="error">{e.message}</p>{/each}
  </div>
</form>
