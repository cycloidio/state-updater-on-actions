
export function createStateUpdater (updateAction, ...params) {
  if (typeof updateAction !== 'function') {
    throw new TypeError('updateAction must be a function')
  }

  return create(updateAction, null, ...params)
}

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
