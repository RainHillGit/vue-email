import { defineComponent, h } from 'vue'

export interface SectionProps {
  bgcolor?: string
  backgroundColor?: string
  style?: Record<string, string | number>
}

export const Section = defineComponent({
  name: 'ESection',
  props: {
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
              style: {
                padding: '0',
              },
            }, slots.default?.()),
          ]),
        ]),
      ])
  },
})
