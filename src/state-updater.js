/**
 * The state-updater-on-actions interface.
 * <br><br>
 * <b>NOTE this isn't a real class</b>, it's an interface because of JSDoc
 * limitations.
 * [Related StackOverflow thread]{@link https://stackoverflow.com/questions/23095975/jsdoc-object-methods-with-method-or-property}
 *
 * @name StateUpdaterOnActions
 * @class
 */

/**
 * Calls an action with the passed parameters.
 *
 * @method
 * @name StateUpdaterOnActions#call
 * @param {Action} action - The action to call.
 * @param {*} params - The parameters to pass to the action when it will be called.
 * @return {Promise} - The promise that the action returns, or if it returns a
 *    promise with the value returned by the <code>updateState</code>, it will
 *    call the <code>updateAction</code> function passed to the constructor by
 *    parameter and if it returns a rejected promise, then it will be returned
 *    such rejected promise.
 */

/**
 * Calls an action using the specified context (e.g obj.action()) and the
 * passed parameters.
 *
 * @method
 * @name StateUpdaterOnActions#callCtx
 * @param {Action} action - The action to call.
 * @param {*} ctx - The context to use for calling the action (i.e. `this`
 *    pointer).
 * @param {*} params - The parameters to pass to the action when it will be called.
 * @return {Promise} - The promise that the action returns, or if it returns a
 *    promise with the value returned by the <code>updateState</code> method, it
 *    will call the <code>updateAction</code> function passed to the constructor
 *    by parameter and if it returns a rejected promise then it will be returned
 *    such rejected promise.
 */

/**
 * Returns the value which the actions must resolve their returned promises when
 * they require an state update.
 *
 * @method
 * @name StateUpdaterOnActions#updateState
 * @return {*} - The value DOES NOT matter as it's used internally to identify
 *        that the update state action must be called.
 */

/**
 * Action is a function which returns a promise; in order to notify that the
 * state must be updated, it MUST return a resolved promise which the value
 * returned by the
 * [<code>updateState</code> method of the <code>StateUpdaterOnActions</code> instance which is used to call the action]{@link StateUpdaterOnActions#updateState}.
 *
 * @async
 * @typedef {Function} Action
 */

/**
 * Create an instance of state updater that uses an action function, which
 * doesn't require to be executed in any context (e.g. a method of an
 * object, or a function which use `this` pointer) and requires the passed
 * parameters.
 *
 * @param {Action} updateAction - The function which update the shared state
 *    require by the actions which will be executed by the returned instance.
 *    The function MUST return a promise.
 * @param {*} params - The parameters to pass to the <code>updateAction</code>
 *    each time that it will be executed.
 * @return {StateUpdaterOnActions} - The instance which will call the
 *    <code>updateAction</code> with the passed parameters when required.
 */
export function createStateUpdater (updateAction, ...params) {
  if (typeof updateAction !== 'function') {
    throw new TypeError('updateAction must be a function')
  }

  return create(updateAction, null, ...params)
}

/**
 * Create an instance of state updater that uses an action function, which
 * requires to be executed in any context (e.g. a method of an object, or a
 * function which use <code>this</code> pointer) and requires the passed
 * parameters.
 *
 * @param {Action} updateAction - The function which update the shared state
 *    require by the actions which will be executed by the returned instance.
 *    The function MUST return a promise.
 * @param {*} ctx - The context to use for calling the action (i.e.
 *    <code>this</code> pointer).
 * @param {*} params - The parameters to pass to the <code>updateAction</code>
 *    each time that will be executed.
 * @return {StateUpdaterOnActions} - The instance which will call the
 *    <code>updateAction</code> with the passed parameters when required.
 */
export function createStateUpdaterCtx (updateAction, ctx, ...params) {
  if (typeof updateAction !== 'function') {
    throw new TypeError('updateAction must be a function')
  }

  if (!ctx) {
    switch (typeof ctx) {
      case 'undefined':
        throw new TypeError('context is required')
      case 'object':
        throw new TypeError('context cannot be null')
    }
  }

  return create(updateAction, ctx, ...params)
}

function create (updateAction, ctx, ...params) {
  // Empty object to have a reference to compare and detect that a updateState
  // has been called
  const updateID = {}
  let updatingPromise = null
  const updater = updateAction.bind(ctx, ...params)

  async function caller (action, ctx, ...params) {
    if (updatingPromise) {
      try {
        await updatingPromise
      } catch (err) {
        throw err
      } finally {
        updatingPromise = null
      }
    }

    let actPromise
    if (ctx === null) {
      actPromise = action(...params)
    } else {
      actPromise = action.call(ctx, ...params)
    }

    const res = await actPromise
    if (res !== updateID) {
      return res
    }

    if (!updatingPromise) {
      updatingPromise = updater()
    }

    return caller(action, ctx, ...params)
  }

  return {
    call: function (action, ...params) {
      if (typeof action !== 'function') {
        throw new TypeError('action must be a function')
      }

      return caller(action, null, ...params)
    },
    callCtx: function (action, ctx, ...params) {
      if (typeof action !== 'function') {
        throw new TypeError('action must be a function')
      }

      if (!ctx) {
        switch (typeof ctx) {
          case 'undefined':
            throw new TypeError('context is required')
          case 'object':
            throw new TypeError('context cannot be null')
        }
      }

      return caller(action, ctx, ...params)
    },
    updateState: function () {
      return updateID
    }
  }
}
