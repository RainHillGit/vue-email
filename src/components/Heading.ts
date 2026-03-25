import { defineComponent, h } from 'vue'

export const Heading = defineComponent({
  name: 'EHeading',
  props: {
    as: {
      type: String,
      default: 'h1',
    },
  },
  setup(props, { slots }) {
    return () => h(props.as, null, slots.default?.())
  },
})
