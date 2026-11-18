/**
 * v-outside="handler": calls the handler when a click lands outside the element, e.g. to close a dropdown.
 */
export default {
  mounted(el, binding) {
    el.clickOutsideEvent = event => {
      if (!el.contains(event.target) && typeof binding.value === 'function') {
        binding.value(event);
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  beforeUnmount(el) {
    document.removeEventListener('click', el.clickOutsideEvent);
  },
};
