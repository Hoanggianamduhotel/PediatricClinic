<template>
  <div 
    v-if="visible"
    ref="draggableElement"
    class="character-widget"
    @click="handleCharacterClick"
    @keypress="handleKeyPress"
    role="button"
    tabindex="0"
    aria-label="Linh vật"
  >
    <img 
      :src="images[currentIndex]"
      alt="Linh vật"
      class="mascot-image"
    />
    <v-btn
      icon
      size="small"
      color="grey-darken-1"
      variant="text"
      @click.stop="handleClose"
      aria-label="Đóng linh vật"
      class="close-button"
    >
      <v-icon size="20">mdi-close</v-icon>
    </v-btn>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'

export default {
  name: 'CharacterWidget',
  emits: ['character-click', 'close'],
  setup(props, { emit }) {
    const visible = ref(true)
    const currentIndex = ref(0)
    const draggableElement = ref(null)
    let intervalId = null
    let isDragging = false
    let dragOffset = { x: 0, y: 0 }

    const images = [
      "https://luimiikovmsaeqmocjhu.supabase.co/storage/v1/object/public/gif/cau_be_nam_3.jpg",
      "https://luimiikovmsaeqmocjhu.supabase.co/storage/v1/object/public/gif/mascot.gif",
      "https://luimiikovmsaeqmocjhu.supabase.co/storage/v1/object/public/gif/ga_con_kute.gif",
    ]

    const handleCharacterClick = () => {
      if (!isDragging) {
        emit('character-click')
      }
    }

    const handleClose = () => {
      visible.value = false
      emit('close')
    }

    const handleKeyPress = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleCharacterClick()
      }
    }

    // Drag functionality
    const startDrag = (e) => {
      isDragging = false
      const rect = draggableElement.value.getBoundingClientRect()
      dragOffset.x = e.clientX - rect.left
      dragOffset.y = e.clientY - rect.top
      
      document.addEventListener('mousemove', drag)
      document.addEventListener('mouseup', stopDrag)
    }

    const drag = (e) => {
      if (!isDragging) {
        isDragging = true
      }
      
      const x = e.clientX - dragOffset.x
      const y = e.clientY - dragOffset.y
      
      // Keep widget within viewport bounds
      const maxX = window.innerWidth - draggableElement.value.offsetWidth
      const maxY = window.innerHeight - draggableElement.value.offsetHeight
      
      const boundedX = Math.max(0, Math.min(x, maxX))
      const boundedY = Math.max(0, Math.min(y, maxY))
      
      draggableElement.value.style.left = boundedX + 'px'
      draggableElement.value.style.top = boundedY + 'px'
    }

    const stopDrag = () => {
      document.removeEventListener('mousemove', drag)
      document.removeEventListener('mouseup', stopDrag)
      
      // Reset dragging flag after a short delay to prevent click event
      setTimeout(() => {
        isDragging = false
      }, 100)
    }

    onMounted(() => {
      // Start image rotation interval
      intervalId = setInterval(() => {
        currentIndex.value = (currentIndex.value + 1) % images.length
      }, 10000)

      // Add drag event listeners
      if (draggableElement.value) {
        draggableElement.value.addEventListener('mousedown', startDrag)
      }
    })

    onBeforeUnmount(() => {
      if (intervalId) {
        clearInterval(intervalId)
      }
      
      // Clean up drag event listeners
      document.removeEventListener('mousemove', drag)
      document.removeEventListener('mouseup', stopDrag)
    })

    return {
      visible,
      currentIndex,
      images,
      draggableElement,
      handleCharacterClick,
      handleClose,
      handleKeyPress
    }
  }
}
</script>

<style scoped>
.character-widget {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1300;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: white;
  padding: 8px;
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.character-widget:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.character-widget:active {
  transform: scale(0.98);
}

.mascot-image {
  width: 20vw;
  height: 20vw;
  min-width: 180px;
  min-height: 150px;
  border-radius: 80%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  object-fit: cover;
}

.close-button {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .mascot-image {
    width: 25vw;
    height: 25vw;
    min-width: 120px;
    min-height: 100px;
  }
  
  .character-widget {
    top: 8px;
    right: 8px;
    padding: 6px;
  }
}

@media (max-width: 480px) {
  .mascot-image {
    width: 30vw;
    height: 30vw;
    min-width: 100px;
    min-height: 80px;
  }
}
</style>