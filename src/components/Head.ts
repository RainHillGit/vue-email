import { defineComponent, h } from 'vue'

export interface HeadProps {
  title?: string
}

export const Head = defineComponent({
  name: 'EHead',
  props: {
    title: {
      type: String,
    },
  },
  setup(props, { slots }) {
    return () =>
      h('head', null, [
        props.title
          ? h('title', null, props.title)
          : null,
        slots.default?.(),
      ])
  },
})
