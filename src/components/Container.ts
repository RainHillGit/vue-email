import { defineComponent, h } from 'vue'

export interface ContainerProps {
  width?: number | string
  bgcolor?: string
  backgroundColor?: string
  style?: Record<string, string | number>
}

export const Container = defineComponent({
  name: 'EContainer',
  props: {
    width: {
      type: [Number, String],
      default: 600,
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
      h('table', {
        role: 'presentation',
        width: '100%',
        border: '0',
        cellpadding: '0',
        cellspacing: '0',
        style: {
          backgroundColor: props.bgcolor || props.backgroundColor || 'transparent',
        },
      }, [
        h('tbody', null, [
          h('tr', null, [
            h('td', {
              align: 'center',
              valign: 'top',
              style: {
                width: typeof props.width === 'number' ? `${props.width}px` : String(props.width),
                maxWidth: typeof props.width === 'number' ? `${props.width}px` : String(props.width),
              },
            }, slots.default?.()),
          ]),
        ]),
      ])
  },
})
