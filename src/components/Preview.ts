import { defineComponent, h } from 'vue'

export interface PreviewProps {
  children?: string
}

export const Preview = defineComponent({
  name: 'EPreview',
  props: {
    children: {
      type: String,
    },
  },
  setup(props, { slots }) {
    return () =>
      h('div', {
        style: {
          display: 'none',
          maxHeight: '0',
          maxWidth: '0',
          overflow: 'hidden',
          msoHide: 'all',
        },
        'data-preview': 'true',
      }, props.children || slots.default?.())
  },
})
