import { defineComponent, h } from 'vue'

export interface HtmlProps {
  lang?: string
  dir?: 'ltr' | 'rtl'
}

export const Html = defineComponent({
  name: 'EHtml',
  props: {
    lang: {
      type: String,
      default: 'en',
    },
    dir: {
      type: String as () => 'ltr' | 'rtl',
    },
  },
  setup(props, { slots }) {
    return () =>
      h('html', { lang: props.lang, dir: props.dir }, slots.default?.())
  },
})
