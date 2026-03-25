import { defineComponent, h } from 'vue'

export const Link = defineComponent({
  name: 'ELink',
  props: {
    href: {
      type: String,
      required: true,
    },
  },
  setup(props, { slots }) {
    return () => h('a', { href: props.href }, slots.default?.())
  },
})
