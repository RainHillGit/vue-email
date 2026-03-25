import { defineComponent, h } from 'vue'

export interface FontProps {
  value?: string
  fallback?: string | string[]
  style?: Record<string, string | number>
}

const defaultFallbacks: Record<string, string[]> = {
  'Helvetica': ['Arial', 'sans-serif'],
  'Georgia': ['serif'],
  'Times New Roman': ['Times', 'serif'],
  'Courier New': ['Courier', 'monospace'],
  'Arial': ['Helvetica', 'sans-serif'],
  'Verdana': ['Helvetica', 'sans-serif'],
  'Trebuchet MS': ['Helvetica', 'sans-serif'],
  'Palatino': ['Georgia', 'serif'],
}

export const Font = defineComponent({
  name: 'EFont',
  props: {
    value: {
      type: String,
      default: 'Helvetica, Arial, sans-serif',
    },
    fallback: {
      type: [String, Array] as unknown as () => string | string[],
    },
  },
  setup(props, { slots }) {
    return () => {
      let fontFamily = props.value

      if (props.fallback) {
        const fallbackArray = Array.isArray(props.fallback) ? props.fallback : [props.fallback]
        fontFamily = `${props.value}, ${fallbackArray.join(', ')}`
      } else {
        const matchedKey = Object.keys(defaultFallbacks).find(key => 
          props.value.toLowerCase().includes(key.toLowerCase())
        )
        
        if (matchedKey && !props.value.includes(',')) {
          fontFamily = `${props.value}, ${defaultFallbacks[matchedKey].join(', ')}`
        }
      }

      return h('div', {
        style: {
          fontFamily,
          display: 'none',
          maxHeight: '0',
          maxWidth: '0',
          overflow: 'hidden',
          msoHide: 'all',
        },
      }, slots.default?.())
    }
  },
})
