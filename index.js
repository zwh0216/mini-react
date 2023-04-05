let isMount = true
let workInProgressHook = null

const schedule = () => {
  workInProgressHook = fiber.memorizedState
  const node = fiber.node()
  if (isMount) {
    isMount = false
  }
  return node
}

const dispatchAction = (updateQueue, action) => {
  updateQueue.value.push(action)

  window.app = schedule()
}

const useMiniState = (initState) => {
  let hook

  if (isMount) {
    hook = {
      memorizedStateValue: initState,
      next: null,
      updateQueue: {
        value: []
      }
    }
    if (!fiber.memorizedState) {
      fiber.memorizedState = hook
    } else {
      workInProgressHook.next = hook
    }
    workInProgressHook = hook
  } else {
    hook = workInProgressHook
    workInProgressHook = workInProgressHook.next
  }

  let oldStateValue = hook.memorizedStateValue
  if (hook.updateQueue.value?.length > 0) {
    for (const action of hook.updateQueue.value) {
      if(typeof action === 'function'){
        oldStateValue = action(oldStateValue)
      } else {
        oldStateValue = action
      }
    }
    hook.updateQueue.value = []
    hook.memorizedStateValue = oldStateValue
  }

  return [hook.memorizedStateValue, dispatchAction.bind(null, hook.updateQueue)]
}

const App = () => {
  const [number, setNumber] = useMiniState(0)
  console.log('isMount ->', isMount)
  console.log('number ->', number)

  return {
    showState (){
      console.log('number ->', number)
    },
    increase: () => {
      setNumber(state => state + 1)
    },
    decrease () {
      setNumber(number - 1)
    }
  }
}

let fiber = {
  node: App,
  memorizedState: null,
}


window.app = schedule()