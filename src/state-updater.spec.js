/* eslint-env jest */

import { createStateUpdater, createStateUpdaterCtx } from './state-updater'
import {
  random as fkRand,
  date as fkDate
} from 'faker'

describe('constructor: createStateUpdater', () => {
  test('without update action', () => {
    function wrapper () {
      createStateUpdater()
    }

    expect(wrapper).toThrowError('updateAction must be a function')
  })

  test('using an update action which is not of the type function', () => {
    function wrapper () {
      createStateUpdater('some string')
    }

    expect(wrapper).toThrowError('updateAction must be a function')
  })

  test('without parameters', () => {
    function wrapper () {
      createStateUpdater('some string')
    }

    expect(wrapper).toThrowError('updateAction must be a function')
  })

  test('with parameters', () => {
    function wrapper () {
      const updater = () => Promise.resolve()
      createStateUpdater(updater, ...generateRandomParams())
    }

    expect(wrapper).not.toThrowError()
  })
})

describe('constructor: createStateUpdaterCtx', () => {
  test('without update action', () => {
    function wrapper () {
      createStateUpdaterCtx()
    }

    expect(wrapper).toThrowError('updateAction must be a function')
  })

  test('using an update action which is not of the type function', () => {
    function wrapper () {
      createStateUpdaterCtx('some string')
    }

    expect(wrapper).toThrowError('updateAction must be a function')
  })

  test('without context', () => {
    function wrapper () {
      const updater = () => Promise.resolve()
      createStateUpdaterCtx(updater)
    }

    expect(wrapper).toThrowError('context is required')
  })

  test('with context being null', () => {
    function wrapper () {
      const updater = () => Promise.resolve()
      createStateUpdaterCtx(updater, null)
    }

    expect(wrapper).toThrowError('context cannot be null')
  })

  test('without parameters', () => {
    function wrapper () {
      const updater = () => Promise.resolve()
      createStateUpdaterCtx(updater, {})
    }

    expect(wrapper).not.toThrowError()
  })

  test('with parameters', () => {
    function wrapper () {
      const updater = () => Promise.resolve()
      createStateUpdaterCtx(updater, {}, ...generateRandomParams())
    }

    expect(wrapper).not.toThrowError()
  })
})

describe('method: call', () => {
  test('without updater', () => {
    const sua = createStateUpdater(async () => {})
    function wrapper () {
      sua.call()
    }

    expect(wrapper).toThrowError('action must be a function')
  })

  test('without parameters', () => {
    const sua = createStateUpdater(async () => {})
    const action = jest.fn(() => Promise.resolve())

    sua.call(action)
    expect(action).toHaveBeenCalledWith()
    expect(action).toHaveBeenCalledTimes(1)
  })

  test('with parameters', () => {
    const sua = createStateUpdater(async () => {})
    const action = jest.fn(() => Promise.resolve())
    const params = generateRandomParams()

    sua.call(action, ...params)
    expect(action).toHaveBeenCalledWith(...params)
    expect(action).toHaveBeenCalledTimes(1)
  })

  test('executes updater without parameters when they are not provided to the constructor', async () => {
    let statusUpdated = false
    const updater = {
      async update () {
        expect(this).not.toEqual(updater)
        statusUpdated = true
        return Promise.resolve()
      }
    }
    const updateSpy = jest.spyOn(updater, 'update')
    const sua = createStateUpdater(updater.update)

    const act = async () => {
      if (!statusUpdated) {
        return sua.updateState()
      }

      return 'done'
    }

    await sua.call(act)
    expect(updateSpy).toHaveBeenCalledWith()
    expect(updateSpy).toHaveBeenCalledTimes(1)
  })

  test('executes updater with parameters when they are provided to the constructor', async () => {
    let statusUpdated = false
    const updater = {
      async update () {
        expect(this).not.toEqual(updater)
        statusUpdated = true
        return Promise.resolve()
      }
    }
    const updateSpy = jest.spyOn(updater, 'update')
    const params = generateRandomParams()
    const sua = createStateUpdater(updater.update, ...params)

    const act = async () => {
      if (!statusUpdated) {
        return sua.updateState()
      }

      return 'done'
    }

    await sua.call(act)
    expect(updateSpy).toHaveBeenCalledWith(...params)
    expect(updateSpy).toHaveBeenCalledTimes(1)
  })

  test('executes updater with context when it is provided and without parameters when they are not provided to the constructor', async () => {
    let statusUpdated = false
    const updater = {
      async update () {
        expect(this).toEqual(updater)
        statusUpdated = true
        return Promise.resolve()
      }
    }
    const updateSpy = jest.spyOn(updater, 'update')
    const sua = createStateUpdaterCtx(updater.update, updater)

    const act = async () => {
      if (!statusUpdated) {
        return sua.updateState()
      }

      return 'done'
    }

    await sua.call(act)
    expect(updateSpy).toHaveBeenCalledWith()
    expect(updateSpy).toHaveBeenCalledTimes(1)
  })

  test('executes updater with context when it is provided and with parameters when they are provided to the constructor', async () => {
    let statusUpdated = false
    const updater = {
      async update () {
        expect(this).toEqual(updater)
        statusUpdated = true
        return Promise.resolve()
      }
    }
    const updateSpy = jest.spyOn(updater, 'update')
    const params = generateRandomParams()
    const sua = createStateUpdaterCtx(updater.update, updater, ...params)

    const act = async () => {
      if (!statusUpdated) {
        return sua.updateState()
      }

      return 'done'
    }

    await sua.call(act)
    expect(updateSpy).toHaveBeenCalledWith(...params)
    expect(updateSpy).toHaveBeenCalledTimes(1)
  })

  test('executes updater when action reports to update the state and after it execute action again', async () => {
    let statusUpdated = false
    const updater = jest.fn(() => {
      statusUpdated = true
      return Promise.resolve()
    })
    const sua = createStateUpdater(updater)

    const actRes = fkRand.word()
    const action = jest.fn(() => {
      if (!statusUpdated) {
        return sua.updateState()
      }
      return Promise.resolve(actRes)
    })

    const res = await sua.call(action)
    expect(res).toEqual(actRes)
    expect(updater).toHaveBeenCalledWith()
    expect(updater).toHaveBeenCalledTimes(1)
    expect(action).toHaveBeenCalledTimes(2)
  })
})

describe('method: callCtx', () => {
  test('without updater', () => {
    const sua = createStateUpdater(async () => {})
    function wrapper () {
      sua.callCtx()
    }

    expect(wrapper).toThrowError('action must be a function')
  })

  test('without context', () => {
    const sua = createStateUpdater(async () => {})
    function wrapper () {
      sua.callCtx(async () => {})
    }

    expect(wrapper).toThrowError('context is required')
  })

  test('with null context', () => {
    const sua = createStateUpdater(async () => {})
    function wrapper () {
      sua.callCtx(async () => {}, null)
    }

    expect(wrapper).toThrowError('context cannot be null')
  })

  test('without parameters', async () => {
    const sua = createStateUpdater(async () => {})
    const operator = {
      async action () {
        expect(this).toEqual(operator)
        return Promise.resolve()
      }
    }
    const actionSpy = jest.spyOn(operator, 'action')

    sua.callCtx(operator.action, operator)
    expect(actionSpy).toHaveBeenCalledWith()
    expect(actionSpy).toHaveBeenCalledTimes(1)
  })

  test('with parameters', () => {
    const sua = createStateUpdater(async () => {})
    const operator = {
      async action () {
        expect(this).toEqual(operator)
        return Promise.resolve()
      }
    }
    const actionSpy = jest.spyOn(operator, 'action')
    const params = generateRandomParams()

    sua.callCtx(operator.action, operator, ...params)
    expect(actionSpy).toHaveBeenCalledWith(...params)
    expect(actionSpy).toHaveBeenCalledTimes(1)
  })

  test('executes updater without parameters when they are not provided to the constructor', async () => {
    let statusUpdated = false
    const updater = {
      async update () {
        expect(this).not.toEqual(updater)
        statusUpdated = true
        return Promise.resolve()
      }
    }
    const updateSpy = jest.spyOn(updater, 'update')
    const sua = createStateUpdater(updater.update)

    const operator = {
      async action () {
        expect(this).toEqual(operator)
        if (!statusUpdated) {
          return sua.updateState()
        }
        return Promise.resolve()
      }
    }

    await sua.callCtx(operator.action, operator)
    expect(updateSpy).toHaveBeenCalledWith()
    expect(updateSpy).toHaveBeenCalledTimes(1)
  })

  test('executes updater with parameters when they are provided to the constructor', async () => {
    let statusUpdated = false
    const updater = {
      async update () {
        expect(this).not.toEqual(updater)
        statusUpdated = true
        return Promise.resolve()
      }
    }
    const updateSpy = jest.spyOn(updater, 'update')
    const params = generateRandomParams()
    const sua = createStateUpdater(updater.update, ...params)

    const operator = {
      async action () {
        expect(this).toEqual(operator)
        if (!statusUpdated) {
          return sua.updateState()
        }

        return 'done'
      }
    }

    await sua.callCtx(operator.action, operator)
    expect(updateSpy).toHaveBeenCalledWith(...params)
    expect(updateSpy).toHaveBeenCalledTimes(1)
  })

  test('executes updater with context when it is provided and without parameters when they are not provided to the constructor', async () => {
    let statusUpdated = false
    const updater = {
      async update () {
        expect(this).toEqual(updater)
        statusUpdated = true
        return Promise.resolve()
      }
    }
    const updateSpy = jest.spyOn(updater, 'update')
    const sua = createStateUpdaterCtx(updater.update, updater)
    const operator = {
      async action () {
        expect(this).toEqual(operator)
        if (!statusUpdated) {
          return sua.updateState()
        }

        return 'done'
      }
    }

    await sua.callCtx(operator.action, operator)
    expect(updateSpy).toHaveBeenCalledWith()
    expect(updateSpy).toHaveBeenCalledTimes(1)
  })

  test('executes updater with context when it is provided and with parameters when they are provided to the constructor', async () => {
    let statusUpdated = false
    const updater = {
      async update () {
        expect(this).toEqual(updater)
        statusUpdated = true
        return Promise.resolve()
      }
    }
    const updateSpy = jest.spyOn(updater, 'update')
    const params = generateRandomParams()
    const sua = createStateUpdaterCtx(updater.update, updater, ...params)
    const operator = {
      async action () {
        expect(this).toEqual(operator)
        if (!statusUpdated) {
          return sua.updateState()
        }

        return 'done'
      }
    }

    await sua.callCtx(operator.action, operator)
    expect(updateSpy).toHaveBeenCalledWith(...params)
    expect(updateSpy).toHaveBeenCalledTimes(1)
  })

  test('executes updater when action reports to update the state and after it execute action again', async () => {
    let statusUpdated = false
    const updater = jest.fn(() => {
      statusUpdated = true
      return Promise.resolve()
    })
    const sua = createStateUpdater(updater)

    const actRes = fkRand.word()
    const operator = {
      async action () {
        if (!statusUpdated) {
          return sua.updateState()
        }
        return Promise.resolve(actRes)
      }
    }
    const actionSpy = jest.spyOn(operator, 'action')

    const res = await sua.callCtx(operator.action, operator)
    expect(res).toEqual(actRes)
    expect(updater).toHaveBeenCalledWith()
    expect(updater).toHaveBeenCalledTimes(1)
    expect(actionSpy).toHaveBeenCalledTimes(2)
  })
})

describe('call actions when the state is not updating', () => {
  let updater, sua

  beforeAll(() => {
    updater = jest.fn(() => {
      return new Promise()
    })
    sua = createStateUpdater(updater)
  })

  test('all the actions are executed without the update state action being called', async () => {
    const actions = generateActions(sua)

    for (const act of actions) {
      if (act.ctx) {
        await sua.callCtx(act.action, act.ctx)
      } else {
        await sua.call(act.action)
      }

      expect(act.action).toHaveBeenCalledTimes(1)
    }

    expect(updater).not.toHaveBeenCalled()
  })
})

describe('call actions when the state is updating and resumes with a resolved promise', () => {
  let updater
  let actionsBeforeStateUpdating, actionsBeforeStateUpdatingResults
  let actionsAfterStateUpdating, actionsAfterStateUpdatingResults

  beforeAll(async () => {
    const updaterCtrl = createPromiseHandlerCtrl()
    let updaterPromise
    updater = jest.fn(() => {
      updaterPromise = new Promise(updaterCtrl)
      return updaterPromise
    })

    const sua = createStateUpdater(updater)

    actionsBeforeStateUpdating = generateActions(sua)

    // Guarantee that updater isn't executed before all the actions are executed
    const actionsOnHoldCtrls = []

    for (const act of actionsBeforeStateUpdating) {
      act.action.updateState = true

      const ctrl = createPromiseHandlerCtrl()
      actionsOnHoldCtrls.push(ctrl)
      act.action.onHold = new Promise(ctrl)
    }

    actionsBeforeStateUpdatingResults = callActions(sua, actionsBeforeStateUpdating)

    // Wait until all the actions have been reported to update the state
    await new Promise((resolve, reject) => {
      const id = setInterval(() => {
        for (const act of actionsBeforeStateUpdating) {
          if (act.action.mock.calls.length === 0) {
            return
          }
        }

        clearInterval(id)

        for (const ctrl of actionsOnHoldCtrls) {
          ctrl.resolve()
        }
        resolve()
      }, 1000)
    })

    await Promise.all(actionsBeforeStateUpdating.map((act) => act.action.onHold))
    updaterCtrl.resolve()
    await updaterPromise

    actionsAfterStateUpdating = generateActions(sua)
    actionsAfterStateUpdatingResults = callActions(sua, actionsAfterStateUpdating)
  })

  test('then all the actions are resolved with their result', async () => {
    let results = await Promise.all(actionsBeforeStateUpdatingResults)
    for (let i = 0; i < results.length; i++) {
      expect(results[i]).toEqual(actionsBeforeStateUpdating[i].action.resolve)
    }

    results = await Promise.all(actionsAfterStateUpdatingResults)
    for (let i = 0; i < results.length; i++) {
      expect(results[i]).toEqual(actionsAfterStateUpdating[i].action.resolve)
    }
  })

  test('then all the actions called before state updater, are called twice', () => {
    for (const act of actionsBeforeStateUpdating) {
      expect(act.action).toHaveBeenCalledTimes(2)
    }
  })

  test('then all the actions called when state updater was in progress, are called once', () => {
    for (const act of actionsAfterStateUpdating) {
      expect(act.action).toHaveBeenCalledTimes(1)
    }
  })

  test('the state updater is only called once', () => {
    expect(updater).toHaveBeenCalledTimes(1)
  })
})

describe('call actions when the state is updating and resumes with a rejected promise', () => {
  let updater, rejectionError
  let actionsStateUpdaterRejection, actionsStateUpdaterRejectionResults
  let actionsStateUpdaterResolved, actionsStateUpdaterResolvedResultsPromises

  beforeAll(async () => {
    rejectionError = new Error(`Updater has failed: ${fkRand.words()}`)

    let updaterCtrl
    let updaterPromise
    updater = jest.fn(() => {
      updaterCtrl = createPromiseHandlerCtrl()
      updaterPromise = new Promise(updaterCtrl)
      return updaterPromise
    })

    const sua = createStateUpdater(updater)

    actionsStateUpdaterRejection = generateActions(sua)
    for (const act of actionsStateUpdaterRejection) {
      act.action.updateState = true
    }

    actionsStateUpdaterRejectionResults = []
    const actionsStateUpdaterRejectionResultsPromises = callActions(sua, actionsStateUpdaterRejection)
    // Avoid to have node warning about
    // PromiseRejectionHandledWarning: Promise rejection was handled asynchronously
    for (let i = 0; i < actionsStateUpdaterRejectionResultsPromises.length; i++) {
      const idx = i
      actionsStateUpdaterRejectionResultsPromises[i].catch((e) => {
        actionsStateUpdaterRejectionResults[idx] = e
      })
    }

    // Wait until all the actions have been reported to update the state
    await new Promise((resolve, reject) => {
      const id = setInterval(() => {
        for (const act of actionsStateUpdaterRejection) {
          if (act.action.mock.calls.length !== 0) {
            clearInterval(id)
            resolve()
          }
        }
      }, 200)
    })

    updaterCtrl.reject(rejectionError)
    try {
      // Wait the updater to finish but don't make this hook to crash because
      // of the expected rejection
      await updaterPromise
    } catch (_) {
    }

    actionsStateUpdaterResolved = generateActions(sua)
    for (const act of actionsStateUpdaterResolved) {
      act.action.updateState = true
    }

    actionsStateUpdaterResolvedResultsPromises = callActions(sua, actionsStateUpdaterResolved)

    // Wait until all the actions have been reported to update the state
    await new Promise((resolve, reject) => {
      const id = setInterval(() => {
        for (const act of actionsStateUpdaterResolved) {
          if (act.action.mock.calls.length !== 0) {
            clearInterval(id)
            resolve()
          }
        }
      }, 200)
    })

    updaterCtrl.resolve()
    await updaterPromise
  })

  test('the actions, which were waiting until the rejected state updater resumed, are rejected with the updater rejection', () => {
    for (const rr of actionsStateUpdaterRejectionResults) {
      expect(rr).toEqual(rejectionError)
    }
  })

  test('the actions, which were waiting until the rejected state updater resumed, are called once', () => {
    for (const act of actionsStateUpdaterRejection) {
      expect(act.action).toHaveBeenCalledTimes(1)
    }
  })

  test('the actions, which were waiting until the resolved state updater resumed, are resolved with their result', async () => {
    const results = await Promise.all(actionsStateUpdaterResolvedResultsPromises)
    for (let i = 0; i < results.length; i++) {
      expect(results[i]).toEqual(actionsStateUpdaterResolved[i].action.resolve)
    }
  })

  test('the actions, which were waiting until the resolved state updater resumed, are called twice', () => {
    for (const act of actionsStateUpdaterResolved) {
      expect(act.action).toHaveBeenCalledTimes(2)
    }
  })

  test('the updater is called twice', () => {
    expect(updater).toHaveBeenCalledTimes(2)
  })
})

describe('call an action, which requires an updated state which resolves, causes that the following ones', () => {
  let updaterCtrl, updaterPromise, actions, actionsResults, actionOnHoldCtrl

  beforeAll(async () => {
    updaterCtrl = createPromiseHandlerCtrl()
    const updater = jest.fn(() => {
      updaterPromise = new Promise(updaterCtrl)
      return updaterPromise
    })

    const sua = createStateUpdater(updater)

    actions = generateActions(sua)
    actions[0].action.updateState = true

    actionsResults = callActions(sua, [actions[0]])

    // Wait until the action have been reported to update the state
    await new Promise((resolve, reject) => {
      const id = setInterval(() => {
        if (actions[0].action.mock.calls.length === 0) {
          return
        }

        clearInterval(id)
        resolve()
      }, 200)
    })

    const restActions = actions.slice(1)
    // Put the second on hold for checking concurrency
    actionOnHoldCtrl = createPromiseHandlerCtrl()
    restActions[0].action.onHold = new Promise(actionOnHoldCtrl)

    // call the rest of the actions
    actionsResults.push(...callActions(sua, restActions))
  })

  test('are not called until the state update operation resumes', () => {
    for (let i = 1; i < actions.length; i++) {
      expect(actions[i].action).not.toHaveBeenCalled()
    }
  })

  test('are resolved concurrently when the state updater resumes', async () => {
    updaterCtrl.resolve()
    await updaterPromise

    const testPromises = []
    for (let i = 0; i < actions.length; i++) {
      if (i === 1) {
        // skip the second which is on hold
        continue
      }

      testPromises.push(expect(actionsResults[i]).resolves.toBe(actions[i].action.resolve))
    }

    await Promise.all(testPromises)

    actionOnHoldCtrl.resolve()
    await expect(actionsResults[1]).resolves.toBe(actions[1].action.resolve)
  })

  test('are only called once', async () => {
    for (let i = 1; i < actions.length; i++) {
      expect(actions[i].action).toHaveBeenCalledTimes(1)
    }
  })
})

describe('call an action, which requires an updated state which rejects, causes that the following ones', () => {
  let rejectionError, updaterCtrl, updaterPromise, actions, actionsResults, actionOnHoldCtrl

  beforeAll(async () => {
    rejectionError = new Error(`Updater has failed: ${fkRand.words()}`)
    updaterCtrl = createPromiseHandlerCtrl()
    const updater = jest.fn(() => {
      updaterPromise = new Promise(updaterCtrl)
      return updaterPromise
    })

    const sua = createStateUpdater(updater)

    actions = generateActions(sua)
    actions[0].action.updateState = true

    actionsResults = callActions(sua, [actions[0]])

    // Wait until the action have been reported to update the state
    await new Promise((resolve, reject) => {
      const id = setInterval(() => {
        if (actions[0].action.mock.calls.length === 0) {
          return
        }

        clearInterval(id)
        resolve()
      }, 200)
    })

    const restActions = actions.slice(1)
    // Put the second on hold for checking concurrency
    actionOnHoldCtrl = createPromiseHandlerCtrl()
    restActions[0].action.onHold = new Promise(actionOnHoldCtrl)

    // call the rest of the actions
    actionsResults.push(...callActions(sua, restActions))
  })

  test('are not called until the state update action resumes', () => {
    for (let i = 1; i < actions.length; i++) {
      expect(actions[i].action).not.toHaveBeenCalled()
    }
  })

  test('are rejected concurrently when the state updater resumes', async () => {
    updaterCtrl.reject(rejectionError)
    try {
      // Wait the updater to finish but don't make this test case to crash because
      // of the expected rejection
      await updaterPromise
    } catch (_) {
    }

    const testPromises = []
    for (let i = 0; i < actions.length; i++) {
      if (i === 1) {
        // skip the second which is on hold
        continue
      }

      testPromises.push(expect(actionsResults[i]).rejects.toThrow(rejectionError))
    }

    await Promise.all(testPromises)

    actionOnHoldCtrl.resolve()
    await expect(actionsResults[1]).rejects.toThrow(rejectionError)
  })

  test('are not even called', async () => {
    for (let i = 1; i < actions.length; i++) {
      expect(actions[i].action).toHaveBeenCalledTimes(0)
    }
  })
})

/**
 * Generates a random number of parameters, between 1 and 10
 */
function generateRandomParams () {
  const numParams = fkRand.number(9) + 1
  const params = []

  for (let i = 0; i < numParams; i++) {
    if (i % 2) {
      params.push(fkRand.boolean())
      continue
    }

    if (i % 3) {
      params.push(fkRand.words())
      continue
    }

    params.push(fkDate.future())
  }

  return params
}

/**
 * Returns a Promise executor function which attach as properties the resolve
 * and reject functions passes as parameters, for being able to control when
 * to execute one of them.
 */
function createPromiseHandlerCtrl () {
  const fn = function (resolve, reject) {
    fn.resolve = resolve
    fn.reject = reject
  }

  return fn
}

/**
 * Generates a random number of actions between 2 and 10.
 *
 * When the action function is executed is on hold if its property `onHold` is
 * set with a promise value. Note that this property can only be set with a
 * promise value, allowing the caller to control when actually follow the logic.
 * Such promise should always be resolved, as it is only used to indicate to
 * actually start the logic execution. By default, `onHold` is set to a resolved
 * promise.
 *
 * The action functions allows to request status update when its property
 * 'updateState' is true.
 *
 * The action function has also 2 other properties to indicate to resolve/reject
 * the promise returned by the action; the 2 properties are mutually excluded,
 * 'resolve' with the value to resolve the promise and 'reject' with the error
 * value to reject the promise; when any of them is set and 'updateState' is false
 * the action resolve the promise with 'undefined'.
 *
 * @param {StateUpdaterOnActions} sua - The instance of the UpdateStateOnActions
 *    to test. It's used for being able to call updateState method.
 * @return {Array} - an array of objects with 2 properties
 *    {Function} action - The action function which is a jest.fn instance for
 *      being able to spy the calls.
 *    {Object} ctx - an empty object to represent a context, in order to simulate
 *      it for calling callCtx; null when the action doesn't have context, so
 *      call should be used.
 */
function generateActions (sua) {
  const numActs = fkRand.number(8) + 2
  const actions = []

  for (let i = 0; i < numActs; i++) {
    const act = jest.fn(async function (...args) {
      await act.onHold

      if (act.updateState === true) {
        act.updateState = false
        return sua.updateState()
      }

      if (act.reject) {
        throw act.reject
      }

      return act.resolve
    })

    act.onHold = Promise.resolve()
    act.updateState = false

    if (i % 2) {
      actions.push({ action: act, ctx: {} })
      continue
    }

    actions.push({ action: act, ctx: null })
  }

  return actions
}

/**
 * Call the actions using the provided state update on actions passed instance
 * and return a list of promises which each promise that every action call has
 * returned.
 *
 * @param {StateUpdaterOnActions} sua - The instance of the UpdateStateOnActions
 *    to test.
 * @param {generateActions[]} actions - List of actions object generated by
 *    the helper function, present in this test, generateActions
 * @return {Promise[]} - List of all the promises which the promises which the
 *    call to each action has returned
 */
function callActions (sua, actions) {
  const actionsResPromises = []

  for (let i = 0; i < actions.length; i++) {
    actions[i].action.resolve = fkRand.words()
    if (actions[i].ctx) {
      actionsResPromises[i] = sua.callCtx(actions[i].action, actions[i].ctx)
    } else {
      actionsResPromises[i] = sua.call(actions[i].action)
    }
  }

  return actionsResPromises
}
