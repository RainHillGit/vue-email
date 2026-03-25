import { defineComponent, h } from 'vue'

export const Hr = defineComponent({
  name: 'EHr',
  setup() {
    return () => h('hr', {
      style: {
        border: 'none',
        borderTop: '1px solid #e5e7eb',
        margin: '24px 0',
      },
    })
  },
})
