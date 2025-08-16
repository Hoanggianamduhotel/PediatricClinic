<template>
  <div>
    <h1>Clinic BS Khang</h1>
    <p>Basic Vue app is working!</p>
    <button @click="testClick">Test Button</button>
    <p v-if="clicked">Button clicked!</p>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'BasicApp',
  setup() {
    const clicked = ref(false)
    
    const testClick = () => {
      clicked.value = true
    }
    
    return {
      clicked,
      testClick
    }
  }
}
</script>