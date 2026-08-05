<!-- src/components/contribucio/TaulaSenyal.vue -->
<template>
  <table class="pdf-senyal-table">
    <thead>
      <tr><th colspan="2">{{ senyal.nom?.toUpperCase() }}</th></tr>
    </thead>
    <tbody>
      <tr>
        <td class="text-center">VIDEO</td>
        <td class="text-center">{{ senyal.video }}</td>
      </tr>
      <tr v-for="audio in senyal.audios" :key="audio.numero">
        <td v-if="audio.contingut" class="text-center">ÀUDIO {{ audio.numero }}</td>
        <td v-if="audio.contingut" class="text-center">{{ audio.contingut }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps({
  senyal: { type: Object, required: true },
})
</script>

<style scoped>
.pdf-senyal-table {
  width: 100%;
  font-size: 6.5pt;
  border-collapse: collapse;
  font-family: 'DM Sans', sans-serif;
  border: 1px solid #F5A623;
}
.pdf-senyal-table th {
  background: #ffffff;
  color: #1A1A2E;
  font-size: 6.5pt;
  font-weight: 700;
  padding: 3px 5px;
  text-align: center;
  white-space: nowrap;
  border: 1px solid #F5A623;
  font-family: 'DM Sans', sans-serif;
}
.pdf-senyal-table td {
  padding: 2.5px 6px;
  border: 1px solid #F5A623;
  font-size: 6.5pt;
  font-weight: 700;
  white-space: nowrap;
  color: #1A1A2E;
  font-family: 'DM Sans', sans-serif;
}
/* Columna d'etiquetes (VIDEO/ÀUDIO) sempre igual d'ampla entre taules:
   es redueix al mínim necessari pel seu propi contingut, que és el
   mateix vocabulari curt a totes les taules de senyal. */
.pdf-senyal-table td:first-child {
  width: 1%;
  white-space: nowrap;
  font-weight: 700;
}
</style>