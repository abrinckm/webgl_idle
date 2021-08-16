function isPowerOf2 (value)
{
  return (value & (value - 1)) == 0
}

function createDeferredPromise ()
{
  let _reject, _resolve
  return {
    promise: new Promise ((resolve, reject) => {
                _resolve = resolve
                _reject = reject
             }),
    resolve: _resolve,
    reject: _reject
  }
}


export {
  isPowerOf2,
  createDeferredPromise
}