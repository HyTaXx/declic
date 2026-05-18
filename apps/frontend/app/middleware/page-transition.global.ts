const pageOrder = ['/', '/select-modules', '/quiz', '/results']

export default defineNuxtRouteMiddleware((to, from) => {
  const toIndex = pageOrder.indexOf(to.path)
  const fromIndex = pageOrder.indexOf(from.path)

  const isForward = toIndex > fromIndex || fromIndex === -1

  to.meta.pageTransition = {
    name: isForward ? 'slide-bottom' : 'slide-top',
    mode: 'out-in',
  }
  from.meta.pageTransition = {
    name: isForward ? 'slide-bottom' : 'slide-top',
    mode: 'out-in',
  }
})
