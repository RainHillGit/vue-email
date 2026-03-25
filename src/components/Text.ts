import { defineComponent, h } from 'vue'

export const Text = defineComponent({
  name: 'EText',
  setup(_, { slots }) {
    return () => h('p', null, slots.default?.())
  },
})
