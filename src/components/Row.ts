import { defineComponent, h } from 'vue'

export interface RowProps {
  style?: Record<string, string | number>
}

export const Row = defineComponent({
  name: 'ERow',
  setup(_, { slots }) {
    return () => h('tr', { role: 'presentation' }, slots.default?.())
  },
})
