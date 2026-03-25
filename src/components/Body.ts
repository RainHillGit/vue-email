import { defineComponent, h } from 'vue'

export interface BodyProps {
  width?: number | string
  bgcolor?: string
  backgroundColor?: string
  style?: Record<string, string | number>
}

export const Body = defineComponent({
  name: 'EBody',
  props: {
    width: {
      type: [Number, String],
    },
    bgcolor: {
      type: String,
    },
    backgroundColor: {
      type: String,
    },
  },
  setup(props, { slots }) {
    return () =>
      h('body', {
        style: {
          margin: '0',
          padding: '0',
          width: '100%',
          height: '100%',
          backgroundColor: props.bgcolor || props.backgroundColor || '#ffffff',
          ...(props.width ? { width: typeof props.width === 'number' ? `${props.width}px` : props.width } : {}),
        },
      }, slots.default?.())
  },
})
