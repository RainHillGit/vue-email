import { defineComponent, h } from 'vue'

export const Image = defineComponent({
  name: 'EImage',
  props: {
    src: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    return () => h('img', {
      src: props.src,
      alt: props.alt,
      style: { maxWidth: '100%', display: 'block' },
    })
  },
})
