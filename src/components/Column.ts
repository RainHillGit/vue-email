import { defineComponent, h } from 'vue'

export const Column = defineComponent({
  name: 'EColumn',
  setup(_, { slots }) {
    return () => h('td', null, slots.default?.())
  },
})
