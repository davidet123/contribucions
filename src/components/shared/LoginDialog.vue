<template>
  <v-dialog :model-value="modelValue" @update:model-value="tancar" max-width="380">
    <v-card>
      <v-card-title class="dialog-title">
        <v-icon size="18" class="mr-2">mdi-login-variant</v-icon>
        Iniciar sessió
        <v-spacer />
        <v-btn icon size="small" variant="text" @click="tancar(false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-2">
        <v-form @submit.prevent="ferLogin">
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            variant="outlined"
            density="comfortable"
            autofocus
            :error-messages="error ? ' ' : ''"
            @keydown.enter="ferLogin"
          />
          <v-text-field
            v-model="password"
            label="Contrasenya"
            type="password"
            variant="outlined"
            density="comfortable"
            :error-messages="error || ''"
            @keydown.enter="ferLogin"
          />
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-3">
        <v-spacer />
        <v-btn variant="text" size="small" @click="tancar(false)">Cancel·lar</v-btn>
        <v-btn
          color="primary"
          size="small"
          :loading="enviant"
          :disabled="!email || !password"
          @click="ferLogin"
        >
          Entrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  modelValue: Boolean,
})
const emit = defineEmits(['update:modelValue'])

const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const enviant = ref(false)
const error = ref('')

// Netejar el formulari cada vegada que s'obre el dialog
watch(() => props.modelValue, (obert) => {
  if (obert) {
    email.value = ''
    password.value = ''
    error.value = ''
  }
})

async function ferLogin() {
  if (!email.value || !password.value) return
  enviant.value = true
  error.value = ''
  const ok = await authStore.login(email.value, password.value)
  enviant.value = false
  if (ok) {
    tancar(false)
  } else {
    error.value = authStore.error
  }
}

function tancar(valor) {
  emit('update:modelValue', valor)
}
</script>

<style scoped>
.dialog-title {
  display: flex;
  align-items: center;
  font-family: 'Space Mono', monospace;
  font-size: 14px;
  padding: 16px 20px 12px;
}
</style>
