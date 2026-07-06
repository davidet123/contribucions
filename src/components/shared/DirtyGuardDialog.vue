<template>
  <v-dialog :model-value="modelValue" max-width="420" persistent>
    <v-card>
      <v-card-title class="dirty-title pa-6 pb-3">
        <v-icon color="warning" size="20" class="mr-2">mdi-alert-outline</v-icon>
        Canvis sense guardar
      </v-card-title>
      <v-card-text class="pa-6 pt-2">
        Tens canvis que no s'han guardat. Si surts ara es perdran.
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-btn variant="text" @click="$emit('cancel')">
          Tornar
        </v-btn>
        <v-spacer />
        <v-btn color="error" variant="flat" @click="$emit('confirm')">
          Sortir sense guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({ modelValue: Boolean })
defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.dirty-title {
  font-family: 'Space Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  color: #1A1A2E;
  display: flex;
  align-items: center;
}
</style>
