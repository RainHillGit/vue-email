import { defineComponent, h } from 'vue'

export const Button = defineComponent({
  name: 'EButton',
  props: {
    href: {
      type: String,
      required: true,
    },
  },
  setup(props, { slots }) {
    return () => h('a', {
      href: props.href,
      style: {
        display: 'inline-block',
        padding: '12px 24px',
        backgroundColor: '#2563eb',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px',
      },
    }, slots.default?.())
  },
})
